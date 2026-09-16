"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listDepartmentsSchema = exports.updateDepartmentSchema = exports.createDepartmentSchema = void 0;
const zod_1 = require("zod");
exports.createDepartmentSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Department name must be at least 2 characters'),
        code: zod_1.z
            .string()
            .min(2, 'Department code must be at least 2 characters')
            .max(20, 'Department code must not exceed 20 characters')
            .regex(/^[A-Z0-9_-]+$/i, 'Code must contain only letters, numbers, hyphens and underscores'),
        description: zod_1.z.string().optional(),
        managerId: zod_1.z.string().uuid().optional().nullable(),
        status: zod_1.z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE'),
    }),
});
exports.updateDepartmentSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid department ID format'),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).optional(),
        code: zod_1.z
            .string()
            .min(2)
            .max(20)
            .regex(/^[A-Z0-9_-]+$/i)
            .optional(),
        description: zod_1.z.string().optional().nullable(),
        managerId: zod_1.z.string().uuid().optional().nullable(),
        status: zod_1.z.enum(['ACTIVE', 'INACTIVE']).optional(),
    }),
});
exports.listDepartmentsSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional().default('1'),
        limit: zod_1.z.string().optional().default('10'),
        search: zod_1.z.string().optional(),
        status: zod_1.z.enum(['ACTIVE', 'INACTIVE']).optional(),
    }),
});
