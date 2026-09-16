"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listEmployeesSchema = exports.updateEmployeeStatusSchema = exports.updateEmployeeSchema = exports.createEmployeeSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createEmployeeSchema = zod_1.z.object({
    body: zod_1.z.object({
        employeeCode: zod_1.z
            .string()
            .min(2, 'Employee code must be at least 2 characters')
            .max(20)
            .optional(),
        firstName: zod_1.z.string().min(1, 'First name is required'),
        lastName: zod_1.z.string().min(1, 'Last name is required'),
        email: zod_1.z.string().email('Invalid email address'),
        phone: zod_1.z.string().optional(),
        dateOfBirth: zod_1.z.string().datetime().or(zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
        gender: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        state: zod_1.z.string().optional(),
        country: zod_1.z.string().optional(),
        profileImage: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
        departmentId: zod_1.z.string().uuid().optional().nullable(),
        managerId: zod_1.z.string().uuid().optional().nullable(),
        designation: zod_1.z.string().min(1, 'Designation is required'),
        joiningDate: zod_1.z.string().datetime().or(zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
        employmentType: zod_1.z.nativeEnum(client_1.EmploymentType).default(client_1.EmploymentType.FULL_TIME),
        status: zod_1.z.nativeEnum(client_1.EmployeeStatus).default(client_1.EmployeeStatus.ACTIVE),
        createUserAccount: zod_1.z.boolean().optional().default(false),
        userPassword: zod_1.z.string().min(8).optional(),
        userRole: zod_1.z.enum(['ORGANIZATION_ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']).optional().default('EMPLOYEE'),
    }),
});
exports.updateEmployeeSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid employee ID format'),
    }),
    body: zod_1.z.object({
        firstName: zod_1.z.string().min(1).optional(),
        lastName: zod_1.z.string().min(1).optional(),
        email: zod_1.z.string().email().optional(),
        phone: zod_1.z.string().optional().nullable(),
        dateOfBirth: zod_1.z.string().optional().nullable(),
        gender: zod_1.z.string().optional().nullable(),
        address: zod_1.z.string().optional().nullable(),
        city: zod_1.z.string().optional().nullable(),
        state: zod_1.z.string().optional().nullable(),
        country: zod_1.z.string().optional().nullable(),
        profileImage: zod_1.z.string().optional().nullable(),
        departmentId: zod_1.z.string().uuid().optional().nullable(),
        managerId: zod_1.z.string().uuid().optional().nullable(),
        designation: zod_1.z.string().min(1).optional(),
        joiningDate: zod_1.z.string().optional(),
        employmentType: zod_1.z.nativeEnum(client_1.EmploymentType).optional(),
        status: zod_1.z.nativeEnum(client_1.EmployeeStatus).optional(),
    }),
});
exports.updateEmployeeStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid employee ID format'),
    }),
    body: zod_1.z.object({
        status: zod_1.z.nativeEnum(client_1.EmployeeStatus),
    }),
});
exports.listEmployeesSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional().default('1'),
        limit: zod_1.z.string().optional().default('10'),
        search: zod_1.z.string().optional(),
        status: zod_1.z.nativeEnum(client_1.EmployeeStatus).optional(),
        departmentId: zod_1.z.string().uuid().optional(),
        designation: zod_1.z.string().optional(),
        sortBy: zod_1.z.enum(['firstName', 'lastName', 'joiningDate', 'createdAt', 'employeeCode']).optional().default('createdAt'),
        sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
    }),
});
