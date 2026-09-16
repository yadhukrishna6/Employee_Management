import { z } from 'zod';

export const createSalarySchema = z.object({
  body: z.object({
    employeeId: z.string().uuid('Invalid employee ID'),
    basicSalary: z.number().positive('Basic salary must be positive'),
    allowances: z.number().nonnegative('Allowances must be non-negative').default(0),
    deductions: z.number().nonnegative('Deductions must be non-negative').default(0),
    effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    effectiveTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  }),
});

export const generatePayslipSchema = z.object({
  body: z.object({
    employeeId: z.string().uuid('Invalid employee ID'),
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(2000).max(2100),
  }),
});

export const generateBulkPayslipsSchema = z.object({
  body: z.object({
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(2000).max(2100),
  }),
});

export const listPayslipsSchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    employeeId: z.string().uuid().optional(),
    month: z.string().optional(),
    year: z.string().optional(),
  }),
});

export type CreateSalaryInput = z.infer<typeof createSalarySchema>['body'];
export type GeneratePayslipInput = z.infer<typeof generatePayslipSchema>['body'];
