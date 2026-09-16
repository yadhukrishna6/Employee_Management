"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const database_1 = require("../../config/database");
const password_1 = require("../../utils/password");
const jwt_1 = require("../../utils/jwt");
const error_middleware_1 = require("../../middleware/error.middleware");
const client_1 = require("@prisma/client");
class AuthService {
    async register(input) {
        const existingOrg = await database_1.prisma.organization.findUnique({
            where: { code: input.organizationCode.toUpperCase() },
        });
        if (existingOrg) {
            throw new error_middleware_1.AppError('An organization with this code already exists.', 409);
        }
        const hashedPassword = await (0, password_1.hashPassword)(input.adminPassword);
        const result = await database_1.prisma.$transaction(async (tx) => {
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
            const user = await tx.user.create({
                data: {
                    organizationId: org.id,
                    employeeId: employee.id,
                    email: input.adminEmail.toLowerCase(),
                    password: hashedPassword,
                    role: client_1.UserRole.ORGANIZATION_ADMIN,
                },
            });
            await tx.leaveType.createMany({
                data: [
                    { organizationId: org.id, name: 'Casual Leave', code: 'CASUAL', annualLimit: 12 },
                    { organizationId: org.id, name: 'Sick Leave', code: 'SICK', annualLimit: 10 },
                    { organizationId: org.id, name: 'Annual Leave', code: 'ANNUAL', annualLimit: 15 },
                    { organizationId: org.id, name: 'Unpaid Leave', code: 'UNPAID', annualLimit: 0 },
                ],
            });
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
        const tokens = this.generateTokenPair({
            userId: result.user.id,
            organizationId: result.org.id,
            role: result.user.role,
            employeeId: result.employee.id,
        });
        await database_1.prisma.user.update({
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
    async login(input, ipAddress) {
        const email = input.email.toLowerCase();
        const user = await database_1.prisma.user.findFirst({
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
            throw new error_middleware_1.AppError('Invalid email or password.', 401);
        }
        if (user.status !== 'ACTIVE') {
            throw new error_middleware_1.AppError('Your account has been deactivated. Please contact support.', 403);
        }
        if (user.organization && user.organization.status !== 'ACTIVE') {
            throw new error_middleware_1.AppError(`Your organization is currently ${user.organization.status.toLowerCase()}. Access denied.`, 403);
        }
        const isPasswordValid = await (0, password_1.comparePassword)(input.password, user.password);
        if (!isPasswordValid) {
            throw new error_middleware_1.AppError('Invalid email or password.', 401);
        }
        const tokens = this.generateTokenPair({
            userId: user.id,
            organizationId: user.organizationId,
            role: user.role,
            employeeId: user.employeeId,
        });
        await database_1.prisma.user.update({
            where: { id: user.id },
            data: {
                lastLoginAt: new Date(),
                refreshToken: tokens.refreshToken,
            },
        });
        await database_1.prisma.auditLog.create({
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
    async refreshToken(token) {
        let payload;
        try {
            payload = (0, jwt_1.verifyRefreshToken)(token);
        }
        catch {
            throw new error_middleware_1.AppError('Invalid or expired refresh token.', 401);
        }
        const user = await database_1.prisma.user.findUnique({
            where: { id: payload.userId },
        });
        if (!user || user.refreshToken !== token) {
            throw new error_middleware_1.AppError('Refresh token has been revoked. Please log in again.', 401);
        }
        const newTokens = this.generateTokenPair({
            userId: user.id,
            organizationId: user.organizationId,
            role: user.role,
            employeeId: user.employeeId,
        });
        await database_1.prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: newTokens.refreshToken },
        });
        return newTokens;
    }
    async getCurrentUser(userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            include: {
                organization: true,
                employee: true,
            },
        });
        if (!user) {
            throw new error_middleware_1.AppError('User not found.', 404);
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
    async changePassword(userId, input) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new error_middleware_1.AppError('User not found.', 404);
        }
        const isMatch = await (0, password_1.comparePassword)(input.currentPassword, user.password);
        if (!isMatch) {
            throw new error_middleware_1.AppError('Current password is incorrect.', 400);
        }
        const hashedPassword = await (0, password_1.hashPassword)(input.newPassword);
        await database_1.prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                refreshToken: null,
            },
        });
    }
    async logout(userId) {
        await database_1.prisma.user.update({
            where: { id: userId },
            data: { refreshToken: null },
        });
    }
    generateTokenPair(payload) {
        return {
            accessToken: (0, jwt_1.generateAccessToken)(payload),
            refreshToken: (0, jwt_1.generateRefreshToken)(payload),
        };
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
