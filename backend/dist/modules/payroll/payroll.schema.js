"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPayslipsSchema = exports.generateBulkPayslipsSchema = exports.generatePayslipSchema = exports.createSalarySchema = void 0;
const zod_1 = require("zod");
exports.createSalarySchema = zod_1.z.object({
    body: zod_1.z.object({
        employeeId: zod_1.z.string().uuid('Invalid employee ID'),
        basicSalary: zod_1.z.number().positive('Basic salary must be positive'),
        allowances: zod_1.z.number().nonnegative('Allowances must be non-negative').default(0),
        deductions: zod_1.z.number().nonnegative('Deductions must be non-negative').default(0),
        effectiveFrom: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
        effectiveTo: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
    }),
});
exports.generatePayslipSchema = zod_1.z.object({
    body: zod_1.z.object({
        employeeId: zod_1.z.string().uuid('Invalid employee ID'),
        month: zod_1.z.number().int().min(1).max(12),
        year: zod_1.z.number().int().min(2000).max(2100),
    }),
});
exports.generateBulkPayslipsSchema = zod_1.z.object({
    body: zod_1.z.object({
        month: zod_1.z.number().int().min(1).max(12),
        year: zod_1.z.number().int().min(2000).max(2100),
    }),
});
exports.listPayslipsSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional().default('1'),
        limit: zod_1.z.string().optional().default('10'),
        employeeId: zod_1.z.string().uuid().optional(),
        month: zod_1.z.string().optional(),
        year: zod_1.z.string().optional(),
    }),
});
