import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    employeeId: z.string().uuid('Invalid employee ID'),
    reviewPeriod: z.string().min(1, 'Review period is required (e.g. Q1 2026)'),
    technicalSkill: z.number().min(1).max(5),
    communication: z.number().min(1).max(5),
    teamwork: z.number().min(1).max(5),
    problemSolving: z.number().min(1).max(5),
    comments: z.string().optional(),
    status: z.enum(['DRAFT', 'SUBMITTED']).default('SUBMITTED'),
  }),
});

export const updateReviewSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid review ID'),
  }),
  body: z.object({
    technicalSkill: z.number().min(1).max(5).optional(),
    communication: z.number().min(1).max(5).optional(),
    teamwork: z.number().min(1).max(5).optional(),
    problemSolving: z.number().min(1).max(5).optional(),
    comments: z.string().optional(),
    status: z.enum(['DRAFT', 'SUBMITTED']).optional(),
  }),
});

export const listReviewsSchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    employeeId: z.string().uuid().optional(),
    reviewerId: z.string().uuid().optional(),
    reviewPeriod: z.string().optional(),
  }),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>['body'];
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>['body'];
