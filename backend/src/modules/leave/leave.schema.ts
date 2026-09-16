import { z } from 'zod';
import { LeaveRequestStatus } from '@prisma/client';

export const createLeaveTypeSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Leave type name is required'),
    code: z
      .string()
      .min(2)
      .max(20)
      .regex(/^[A-Z0-9_-]+$/i, 'Code must contain only alphanumeric characters'),
    description: z.string().optional(),
    annualLimit: z.number().int().min(0, 'Annual limit must be a positive integer'),
    status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  }),
});

export const applyLeaveSchema = z.object({
  body: z.object({
    leaveTypeId: z.string().uuid('Invalid leave type ID'),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
    reason: z.string().min(3, 'Reason must be at least 3 characters'),
  }),
});

export const approveLeaveSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid leave request ID'),
  }),
});

export const rejectLeaveSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid leave request ID'),
  }),
  body: z.object({
    rejectionReason: z.string().min(3, 'Rejection reason is required'),
  }),
});

export const cancelLeaveSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid leave request ID'),
  }),
});

export const listLeavesSchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    status: z.nativeEnum(LeaveRequestStatus).optional(),
    employeeId: z.string().uuid().optional(),
    leaveTypeId: z.string().uuid().optional(),
    year: z.string().regex(/^\d{4}$/).optional(),
  }),
});

export type CreateLeaveTypeInput = z.infer<typeof createLeaveTypeSchema>['body'];
export type ApplyLeaveInput = z.infer<typeof applyLeaveSchema>['body'];
export type RejectLeaveInput = z.infer<typeof rejectLeaveSchema>['body'];
