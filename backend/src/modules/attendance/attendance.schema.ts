import { z } from 'zod';
import { AttendanceStatus } from '@prisma/client';

export const checkInSchema = z.object({
  body: z.object({
    remarks: z.string().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD').optional(),
  }),
});

export const checkOutSchema = z.object({
  body: z.object({
    remarks: z.string().optional(),
  }),
});

export const listAttendanceSchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('20'),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
    status: z.nativeEnum(AttendanceStatus).optional().or(z.literal('')),
    employeeId: z.string().uuid().optional().or(z.literal('')),
    departmentId: z.string().uuid().optional().or(z.literal('')),
  }),
});

export const attendanceSummarySchema = z.object({
  query: z.object({
    month: z.string().regex(/^(0?[1-9]|1[0-2])$/, 'Month must be between 1 and 12').optional(),
    year: z.string().regex(/^\d{4}$/, 'Year must be 4 digits').optional(),
    employeeId: z.string().uuid().optional(),
  }),
});

export type CheckInInput = z.infer<typeof checkInSchema>['body'];
export type CheckOutInput = z.infer<typeof checkOutSchema>['body'];
