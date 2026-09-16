import { prisma } from '../../config/database';
import { hashPassword, comparePassword } from '../../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { AppError } from '../../middleware/error.middleware';
import { RegisterInput, LoginInput, ChangePasswordInput } from './auth.schema';
import { LoginResponse, UserProfileResponse, AuthTokens } from './auth.types';
import { UserRole } from '@prisma/client';

export class AuthService {
  /**
   * Register a new Organization, default leave types, initial Employee, and Admin User atomically.
   */
  async register(input: RegisterInput): Promise<LoginResponse> {
    // 1. Check if organization code already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { code: input.organizationCode.toUpperCase() },
    });

    if (existingOrg) {
      throw new AppError('An organization with this code already exists.', 409);
    }

    // 2. Hash admin password
    const hashedPassword = await hashPassword(input.adminPassword);

    // 3. Execute registration in a Database Transaction for ACID compliance
    const result = await prisma.$transaction(async (tx) => {
      // Create Organization
      const org = await tx.organization.create({
        data: {
          name: input.organizationName,
          code: input.organizationCode.toUpperCase(),
          email: input.organizationEmail,
          phone: input.phone,
          website: input.website,
          address: input.address,
          city: input.city,
          state: input.state,
          country: input.country,
        },
      });

      // Create Admin Employee Profile
      const employee = await tx.employee.create({
        data: {
          organizationId: org.id,
          employeeCode: 'EMP-001',
          firstName: input.adminFirstName,
          lastName: input.adminLastName,
          email: input.adminEmail,
          phone: input.phone,
          designation: 'Organization Administrator',
          joiningDate: new Date(),
        },
      });

      // Create Admin User Account
      const user = await tx.user.create({
        data: {
          organizationId: org.id,
          employeeId: employee.id,
          email: input.adminEmail.toLowerCase(),
          password: hashedPassword,
          role: UserRole.ORGANIZATION_ADMIN,
        },
      });

      // Create default standard Leave Types for the organization
      await tx.leaveType.createMany({
        data: [
          { organizationId: org.id, name: 'Casual Leave', code: 'CASUAL', annualLimit: 12 },
          { organizationId: org.id, name: 'Sick Leave', code: 'SICK', annualLimit: 10 },
          { organizationId: org.id, name: 'Annual Leave', code: 'ANNUAL', annualLimit: 15 },
          { organizationId: org.id, name: 'Unpaid Leave', code: 'UNPAID', annualLimit: 0 },
        ],
      });

      // Log creation in Audit Log
      await tx.auditLog.create({
        data: {
          organizationId: org.id,
          userId: user.id,
          action: 'REGISTER_ORGANIZATION',
          entity: 'Organization',
          entityId: org.id,
          newValue: { organizationName: org.name, adminEmail: user.email },
        },
      });

      return { org, user, employee };
    });

    // 4. Generate JWT tokens
    const tokens = this.generateTokenPair({
      userId: result.user.id,
      organizationId: result.org.id,
      role: result.user.role,
      employeeId: result.employee.id,
    });

    // Save refresh token to user record
    await prisma.user.update({
      where: { id: result.user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        status: result.user.status,
        organizationId: result.org.id,
        employeeId: result.employee.id,
        organization: {
          id: result.org.id,
          name: result.org.name,
          code: result.org.code,
          status: result.org.status,
        },
        employee: {
          id: result.employee.id,
          employeeCode: result.employee.employeeCode,
          firstName: result.employee.firstName,
          lastName: result.employee.lastName,
          designation: result.employee.designation,
          profileImage: result.employee.profileImage,
        },
      },
      tokens,
    };
  }

  /**
   * User Login with email & password.
   */
  async login(input: LoginInput, ipAddress?: string): Promise<LoginResponse> {
    const email = input.email.toLowerCase();

    // Query user along with organization and employee records
    const user = await prisma.user.findFirst({
      where: {
        email,
        ...(input.organizationCode && {
          organization: { code: input.organizationCode.toUpperCase() },
        }),
      },
      include: {
        organization: true,
        employee: true,
      },
    });

    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    if (user.status !== 'ACTIVE') {
      throw new AppError('Your account has been deactivated. Please contact support.', 403);
    }

    // Verify organization status if not SUPER_ADMIN
    if (user.organization && user.organization.status !== 'ACTIVE') {
      throw new AppError(
        `Your organization is currently ${user.organization.status.toLowerCase()}. Access denied.`,
        403
      );
    }

    // Verify Password
    const isPasswordValid = await comparePassword(input.password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password.', 401);
    }

    // Generate JWT tokens
    const tokens = this.generateTokenPair({
      userId: user.id,
      organizationId: user.organizationId,
      role: user.role,
      employeeId: user.employeeId,
    });

    // Update lastLoginAt and current refreshToken
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        refreshToken: tokens.refreshToken,
      },
    });

    // Audit log for login
    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        action: 'LOGIN',
        entity: 'User',
        entityId: user.id,
        ipAddress,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        organizationId: user.organizationId,
        employeeId: user.employeeId,
        organization: user.organization
          ? {
              id: user.organization.id,
              name: user.organization.name,
              code: user.organization.code,
              status: user.organization.status,
            }
          : null,
        employee: user.employee
          ? {
              id: user.employee.id,
              employeeCode: user.employee.employeeCode,
              firstName: user.employee.firstName,
              lastName: user.employee.lastName,
              designation: user.employee.designation,
              profileImage: user.employee.profileImage,
            }
          : null,
      },
      tokens,
    };
  }

  /**
   * Refresh expired access token using valid refresh token.
   */
  async refreshToken(token: string): Promise<AuthTokens> {
    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw new AppError('Invalid or expired refresh token.', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.refreshToken !== token) {
      throw new AppError('Refresh token has been revoked. Please log in again.', 401);
    }

    // Generate new token pair (token rotation)
    const newTokens = this.generateTokenPair({
      userId: user.id,
      organizationId: user.organizationId,
      role: user.role,
      employeeId: user.employeeId,
    });

    // Save new refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newTokens.refreshToken },
    });

    return newTokens;
  }

  /**
   * Get logged-in user details.
   */
  async getCurrentUser(userId: string): Promise<UserProfileResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: true,
        employee: true,
      },
    });

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      organizationId: user.organizationId,
      employeeId: user.employeeId,
      organization: user.organization
        ? {
            id: user.organization.id,
            name: user.organization.name,
            code: user.organization.code,
            status: user.organization.status,
          }
        : null,
      employee: user.employee
        ? {
            id: user.employee.id,
            employeeCode: user.employee.employeeCode,
            firstName: user.employee.firstName,
            lastName: user.employee.lastName,
            designation: user.employee.designation,
            profileImage: user.employee.profileImage,
          }
        : null,
    };
  }

  /**
   * Change user password.
   */
  async changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    const isMatch = await comparePassword(input.currentPassword, user.password);
    if (!isMatch) {
      throw new AppError('Current password is incorrect.', 400);
    }

    const hashedPassword = await hashPassword(input.newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        refreshToken: null, // Revoke active sessions
      },
    });
  }

  /**
   * User Logout (Invalidate refresh token).
   */
  async logout(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  // Private helper to sign access and refresh tokens
  private generateTokenPair(payload: {
    userId: string;
    organizationId: string | null;
    role: UserRole;
    employeeId?: string | null;
  }): AuthTokens {
    return {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };
  }
}

export const authService = new AuthService();
