import { prisma } from '../../config/database';
import { hashPassword } from '../../utils/password';
import { AppError } from '../../middleware/error.middleware';
import { CreateUserInput, UpdateUserInput } from './user.schema';
import { UserRole, UserStatus, Prisma } from '@prisma/client';

export class UserService {
  async createUser(
    input: CreateUserInput,
    organizationId: string | null,
    adminUserId: string
  ) {
    // Check if user with same email exists in the organization
    const existingUser = await prisma.user.findFirst({
      where: {
        email: input.email.toLowerCase(),
        organizationId: organizationId,
      },
    });

    if (existingUser) {
      throw new AppError('A user with this email already exists in this organization.', 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        password: hashedPassword,
        role: input.role,
        status: input.status,
        organizationId,
        employeeId: input.employeeId || null,
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        organizationId: true,
        employeeId: true,
        lastLoginAt: true,
        createdAt: true,
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            designation: true,
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: adminUserId,
        action: 'CREATE_USER',
        entity: 'User',
        entityId: user.id,
        newValue: { email: user.email, role: user.role },
      },
    });

    return user;
  }

  async getAllUsers(
    organizationId: string | null,
    isSuperAdmin: boolean,
    query: {
      page?: number;
      limit?: number;
      search?: string;
      role?: UserRole;
      status?: UserStatus;
    }
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    // Multi-tenant isolation: Super admin can see all; otherwise strictly isolate
    if (!isSuperAdmin || organizationId) {
      where.organizationId = organizationId;
    }

    if (query.role) where.role = query.role;
    if (query.status) where.status = query.status;

    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        {
          employee: {
            OR: [
              { firstName: { contains: query.search, mode: 'insensitive' } },
              { lastName: { contains: query.search, mode: 'insensitive' } },
              { employeeCode: { contains: query.search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          organizationId: true,
          employeeId: true,
          lastLoginAt: true,
          createdAt: true,
          organization: {
            select: { id: true, name: true, code: true },
          },
          employee: {
            select: {
              id: true,
              employeeCode: true,
              firstName: true,
              lastName: true,
              designation: true,
            },
          },
        },
      }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: string, organizationId: string | null, isSuperAdmin: boolean) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        organizationId: true,
        employeeId: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        organization: {
          select: { id: true, name: true, code: true },
        },
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            designation: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    // Tenant isolation verification
    if (!isSuperAdmin && user.organizationId !== organizationId) {
      throw new AppError('Access denied.', 403);
    }

    return user;
  }

  async updateUser(
    id: string,
    input: UpdateUserInput,
    organizationId: string | null,
    isSuperAdmin: boolean,
    adminUserId: string
  ) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('User not found.', 404);
    }

    if (!isSuperAdmin && existing.organizationId !== organizationId) {
      throw new AppError('Access denied.', 403);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        role: input.role,
        status: input.status,
        employeeId: input.employeeId,
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        employeeId: true,
        updatedAt: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: existing.organizationId,
        userId: adminUserId,
        action: 'UPDATE_USER',
        entity: 'User',
        entityId: id,
        oldValue: { role: existing.role, status: existing.status },
        newValue: input,
      },
    });

    return updated;
  }

  async resetPassword(
    id: string,
    newPassword: string,
    organizationId: string | null,
    isSuperAdmin: boolean,
    adminUserId: string
  ) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('User not found.', 404);
    }

    if (!isSuperAdmin && existing.organizationId !== organizationId) {
      throw new AppError('Access denied.', 403);
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        refreshToken: null, // Invalidate all active sessions for security
      },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: existing.organizationId,
        userId: adminUserId,
        action: 'RESET_PASSWORD',
        entity: 'User',
        entityId: id,
      },
    });
  }
}

export const userService = new UserService();
