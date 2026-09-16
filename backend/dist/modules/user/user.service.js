"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
const database_1 = require("../../config/database");
const password_1 = require("../../utils/password");
const error_middleware_1 = require("../../middleware/error.middleware");
class UserService {
    async createUser(input, organizationId, adminUserId) {
        const existingUser = await database_1.prisma.user.findFirst({
            where: {
                email: input.email.toLowerCase(),
                organizationId: organizationId,
            },
        });
        if (existingUser) {
            throw new error_middleware_1.AppError('A user with this email already exists in this organization.', 409);
        }
        const hashedPassword = await (0, password_1.hashPassword)(input.password);
        const user = await database_1.prisma.user.create({
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
        await database_1.prisma.auditLog.create({
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
    async getAllUsers(organizationId, isSuperAdmin, query) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
        const skip = (page - 1) * limit;
        const where = {};
        if (!isSuperAdmin || organizationId) {
            where.organizationId = organizationId;
        }
        if (query.role)
            where.role = query.role;
        if (query.status)
            where.status = query.status;
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
            database_1.prisma.user.count({ where }),
            database_1.prisma.user.findMany({
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
    async getUserById(id, organizationId, isSuperAdmin) {
        const user = await database_1.prisma.user.findUnique({
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
            throw new error_middleware_1.AppError('User not found.', 404);
        }
        if (!isSuperAdmin && user.organizationId !== organizationId) {
            throw new error_middleware_1.AppError('Access denied.', 403);
        }
        return user;
    }
    async updateUser(id, input, organizationId, isSuperAdmin, adminUserId) {
        const existing = await database_1.prisma.user.findUnique({ where: { id } });
        if (!existing) {
            throw new error_middleware_1.AppError('User not found.', 404);
        }
        if (!isSuperAdmin && existing.organizationId !== organizationId) {
            throw new error_middleware_1.AppError('Access denied.', 403);
        }
        const updated = await database_1.prisma.user.update({
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
        await database_1.prisma.auditLog.create({
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
    async resetPassword(id, newPassword, organizationId, isSuperAdmin, adminUserId) {
        const existing = await database_1.prisma.user.findUnique({ where: { id } });
        if (!existing) {
            throw new error_middleware_1.AppError('User not found.', 404);
        }
        if (!isSuperAdmin && existing.organizationId !== organizationId) {
            throw new error_middleware_1.AppError('Access denied.', 403);
        }
        const hashedPassword = await (0, password_1.hashPassword)(newPassword);
        await database_1.prisma.user.update({
            where: { id },
            data: {
                password: hashedPassword,
                refreshToken: null,
            },
        });
        await database_1.prisma.auditLog.create({
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
exports.UserService = UserService;
exports.userService = new UserService();
