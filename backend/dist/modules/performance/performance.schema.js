"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listReviewsSchema = exports.updateReviewSchema = exports.createReviewSchema = void 0;
const zod_1 = require("zod");
exports.createReviewSchema = zod_1.z.object({
    body: zod_1.z.object({
        employeeId: zod_1.z.string().uuid('Invalid employee ID'),
        reviewPeriod: zod_1.z.string().min(1, 'Review period is required (e.g. Q1 2026)'),
        technicalSkill: zod_1.z.number().min(1).max(5),
        communication: zod_1.z.number().min(1).max(5),
        teamwork: zod_1.z.number().min(1).max(5),
        problemSolving: zod_1.z.number().min(1).max(5),
        comments: zod_1.z.string().optional(),
        status: zod_1.z.enum(['DRAFT', 'SUBMITTED']).default('SUBMITTED'),
    }),
});
exports.updateReviewSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid review ID'),
    }),
    body: zod_1.z.object({
        technicalSkill: zod_1.z.number().min(1).max(5).optional(),
        communication: zod_1.z.number().min(1).max(5).optional(),
        teamwork: zod_1.z.number().min(1).max(5).optional(),
        problemSolving: zod_1.z.number().min(1).max(5).optional(),
        comments: zod_1.z.string().optional(),
        status: zod_1.z.enum(['DRAFT', 'SUBMITTED']).optional(),
    }),
});
exports.listReviewsSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional().default('1'),
        limit: zod_1.z.string().optional().default('10'),
        employeeId: zod_1.z.string().uuid().optional(),
        reviewerId: zod_1.z.string().uuid().optional(),
        reviewPeriod: zod_1.z.string().optional(),
    }),
});
