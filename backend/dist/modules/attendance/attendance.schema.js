"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendanceSummarySchema = exports.listAttendanceSchema = exports.checkOutSchema = exports.checkInSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.checkInSchema = zod_1.z.object({
    body: zod_1.z.object({
        remarks: zod_1.z.string().optional(),
        date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD').optional(),
    }),
});
exports.checkOutSchema = zod_1.z.object({
    body: zod_1.z.object({
        remarks: zod_1.z.string().optional(),
    }),
});
exports.listAttendanceSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional().default('1'),
        limit: zod_1.z.string().optional().default('20'),
        startDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        endDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        status: zod_1.z.nativeEnum(client_1.AttendanceStatus).optional(),
        employeeId: zod_1.z.string().uuid().optional(),
        departmentId: zod_1.z.string().uuid().optional(),
    }),
});
exports.attendanceSummarySchema = zod_1.z.object({
    query: zod_1.z.object({
        month: zod_1.z.string().regex(/^(0?[1-9]|1[0-2])$/, 'Month must be between 1 and 12').optional(),
        year: zod_1.z.string().regex(/^\d{4}$/, 'Year must be 4 digits').optional(),
        employeeId: zod_1.z.string().uuid().optional(),
    }),
});
