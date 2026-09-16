import { z } from 'zod';

export const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Department name must be at least 2 characters'),
    code: z
      .string()
      .min(2, 'Department code must be at least 2 characters')
      .max(20, 'Department code must not exceed 20 characters')
      .regex(/^[A-Z0-9_-]+$/i, 'Code must contain only letters, numbers, hyphens and underscores'),
    description: z.string().optional(),
    managerId: z.string().uuid().optional().nullable(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE'),
  }),
});

export const updateDepartmentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid department ID format'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    code: z
      .string()
      .min(2)
      .max(20)
      .regex(/^[A-Z0-9_-]+$/i)
      .optional(),
    description: z.string().optional().nullable(),
    managerId: z.string().uuid().optional().nullable(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
});

export const listDepartmentsSchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    search: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>['body'];
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>['body'];
