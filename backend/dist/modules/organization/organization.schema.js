"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listOrganizationsSchema = exports.getOrgParamsSchema = exports.updateOrgStatusSchema = exports.updateOrganizationSchema = exports.createOrganizationSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createOrganizationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Organization name must be at least 2 characters'),
        code: zod_1.z
            .string()
            .min(2, 'Organization code must be at least 2 characters')
            .max(20, 'Organization code must not exceed 20 characters')
            .regex(/^[A-Z0-9_-]+$/i, 'Organization code can only contain alphanumeric characters, hyphens and underscores'),
        email: zod_1.z.string().email('Invalid email address'),
        phone: zod_1.z.string().optional(),
        website: zod_1.z.string().url('Invalid website URL').optional().or(zod_1.z.literal('')),
        address: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        state: zod_1.z.string().optional(),
        country: zod_1.z.string().optional(),
        status: zod_1.z.nativeEnum(client_1.OrganizationStatus).optional(),
    }),
});
exports.updateOrganizationSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid organization ID format'),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).optional(),
        email: zod_1.z.string().email().optional(),
        phone: zod_1.z.string().optional(),
        website: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
        address: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        state: zod_1.z.string().optional(),
        country: zod_1.z.string().optional(),
        status: zod_1.z.nativeEnum(client_1.OrganizationStatus).optional(),
    }),
});
exports.updateOrgStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid organization ID format'),
    }),
    body: zod_1.z.object({
        status: zod_1.z.nativeEnum(client_1.OrganizationStatus),
    }),
});
exports.getOrgParamsSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid organization ID format'),
    }),
});
exports.listOrganizationsSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional().default('1'),
        limit: zod_1.z.string().optional().default('10'),
        search: zod_1.z.string().optional(),
        status: zod_1.z.nativeEnum(client_1.OrganizationStatus).optional(),
    }),
});
