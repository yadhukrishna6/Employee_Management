"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetUserPasswordSchema = exports.listUsersSchema = exports.updateUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number'),
        role: zod_1.z.nativeEnum(client_1.UserRole),
        employeeId: zod_1.z.string().uuid().optional().nullable(),
        status: zod_1.z.nativeEnum(client_1.UserStatus).optional().default(client_1.UserStatus.ACTIVE),
    }),
});
exports.updateUserSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid user ID format'),
    }),
    body: zod_1.z.object({
        role: zod_1.z.nativeEnum(client_1.UserRole).optional(),
        status: zod_1.z.nativeEnum(client_1.UserStatus).optional(),
        employeeId: zod_1.z.string().uuid().optional().nullable(),
    }),
});
exports.listUsersSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional().default('1'),
        limit: zod_1.z.string().optional().default('10'),
        search: zod_1.z.string().optional(),
        role: zod_1.z.nativeEnum(client_1.UserRole).optional(),
        status: zod_1.z.nativeEnum(client_1.UserStatus).optional(),
    }),
});
exports.resetUserPasswordSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid user ID format'),
    }),
    body: zod_1.z.object({
        newPassword: zod_1.z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number'),
    }),
});
