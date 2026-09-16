import { z } from 'zod';
import { EmploymentType, EmployeeStatus } from '@prisma/client';

export const createEmployeeSchema = z.object({
  body: z.object({
    employeeCode: z
      .string()
      .min(2, 'Employee code must be at least 2 characters')
      .max(20)
      .optional(), // If not provided, service will auto-generate
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    dateOfBirth: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
    gender: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    profileImage: z.string().url().optional().or(z.literal('')),
    departmentId: z.string().uuid().optional().nullable(),
    managerId: z.string().uuid().optional().nullable(),
    designation: z.string().min(1, 'Designation is required'),
    joiningDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    employmentType: z.nativeEnum(EmploymentType).default(EmploymentType.FULL_TIME),
    status: z.nativeEnum(EmployeeStatus).default(EmployeeStatus.ACTIVE),
    createUserAccount: z.boolean().optional().default(false),
    userPassword: z.string().min(8).optional(),
    userRole: z.enum(['ORGANIZATION_ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']).optional().default('EMPLOYEE'),
  }),
});

export const updateEmployeeSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid employee ID format'),
  }),
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional().nullable(),
    dateOfBirth: z.string().optional().nullable(),
    gender: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    profileImage: z.string().optional().nullable(),
    departmentId: z.string().uuid().optional().nullable(),
    managerId: z.string().uuid().optional().nullable(),
    designation: z.string().min(1).optional(),
    joiningDate: z.string().optional(),
    employmentType: z.nativeEnum(EmploymentType).optional(),
    status: z.nativeEnum(EmployeeStatus).optional(),
  }),
});

export const updateEmployeeStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid employee ID format'),
  }),
  body: z.object({
    status: z.nativeEnum(EmployeeStatus),
  }),
});

export const listEmployeesSchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    search: z.string().optional(),
    status: z.nativeEnum(EmployeeStatus).optional(),
    departmentId: z.string().uuid().optional(),
    designation: z.string().optional(),
    sortBy: z.enum(['firstName', 'lastName', 'joiningDate', 'createdAt', 'employeeCode']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>['body'];
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>['body'];
export type UpdateEmployeeStatusInput = z.infer<typeof updateEmployeeStatusSchema>['body'];
