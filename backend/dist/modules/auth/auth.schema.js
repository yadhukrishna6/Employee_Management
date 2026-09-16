"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        organizationName: zod_1.z.string().min(2, 'Organization name must be at least 2 characters'),
        organizationCode: zod_1.z
            .string()
            .min(2, 'Organization code must be at least 2 characters')
            .max(20, 'Organization code must not exceed 20 characters')
            .regex(/^[A-Z0-9_-]+$/i, 'Organization code can only contain letters, numbers, hyphens, and underscores'),
        organizationEmail: zod_1.z.string().email('Invalid organization email address'),
        phone: zod_1.z.string().optional(),
        website: zod_1.z.string().url('Invalid website URL').optional().or(zod_1.z.literal('')),
        address: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        state: zod_1.z.string().optional(),
        country: zod_1.z.string().optional(),
        adminEmail: zod_1.z.string().email('Invalid admin email address'),
        adminPassword: zod_1.z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number'),
        adminFirstName: zod_1.z.string().min(1, 'First name is required'),
        adminLastName: zod_1.z.string().min(1, 'Last name is required'),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z.string().min(1, 'Password is required'),
        organizationCode: zod_1.z.string().optional(),
    }),
});
exports.refreshTokenSchema = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
    }),
});
exports.changePasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        currentPassword: zod_1.z.string().min(1, 'Current password is required'),
        newPassword: zod_1.z
            .string()
            .min(8, 'New password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number'),
    }),
});
