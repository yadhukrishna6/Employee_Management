"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listLeavesSchema = exports.cancelLeaveSchema = exports.rejectLeaveSchema = exports.approveLeaveSchema = exports.applyLeaveSchema = exports.createLeaveTypeSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createLeaveTypeSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Leave type name is required'),
        code: zod_1.z
            .string()
            .min(2)
            .max(20)
            .regex(/^[A-Z0-9_-]+$/i, 'Code must contain only alphanumeric characters'),
        description: zod_1.z.string().optional(),
        annualLimit: zod_1.z.number().int().min(0, 'Annual limit must be a positive integer'),
        status: zod_1.z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
    }),
});
exports.applyLeaveSchema = zod_1.z.object({
    body: zod_1.z.object({
        leaveTypeId: zod_1.z.string().uuid('Invalid leave type ID'),
        startDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
        endDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
        reason: zod_1.z.string().min(3, 'Reason must be at least 3 characters'),
    }),
});
exports.approveLeaveSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid leave request ID'),
    }),
});
exports.rejectLeaveSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid leave request ID'),
    }),
    body: zod_1.z.object({
        rejectionReason: zod_1.z.string().min(3, 'Rejection reason is required'),
    }),
});
exports.cancelLeaveSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid leave request ID'),
    }),
});
exports.listLeavesSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional().default('1'),
        limit: zod_1.z.string().optional().default('10'),
        status: zod_1.z.nativeEnum(client_1.LeaveRequestStatus).optional(),
        employeeId: zod_1.z.string().uuid().optional(),
        leaveTypeId: zod_1.z.string().uuid().optional(),
        year: zod_1.z.string().regex(/^\d{4}$/).optional(),
    }),
});
