"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentService = exports.DepartmentService = void 0;
const database_1 = require("../../config/database");
const error_middleware_1 = require("../../middleware/error.middleware");
class DepartmentService {
    async createDepartment(input, organizationId, userId) {
        const code = input.code.toUpperCase();
        const existing = await database_1.prisma.department.findUnique({
            where: {
                organizationId_code: {
                    organizationId,
                    code,
                },
            },
        });
        if (existing) {
            throw new error_middleware_1.AppError('A department with this code already exists in your organization.', 409);
        }
        const department = await database_1.prisma.department.create({
            data: {
                organizationId,
                name: input.name,
                code,
                description: input.description,
                managerId: input.managerId,
                status: input.status,
            },
            include: {
                manager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        employeeCode: true,
                    },
                },
            },
        });
        await database_1.prisma.auditLog.create({
            data: {
                organizationId,
                userId,
                action: 'CREATE_DEPARTMENT',
                entity: 'Department',
                entityId: department.id,
                newValue: { name: department.name, code: department.code },
            },
        });
        return department;
    }
    async getAllDepartments(organizationId, query) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
        const skip = (page - 1) * limit;
        const where = {
            organizationId,
        };
        if (query.status)
            where.status = query.status;
        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { code: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        const [total, departments] = await Promise.all([
            database_1.prisma.department.count({ where }),
            database_1.prisma.department.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    manager: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            employeeCode: true,
                            designation: true,
                        },
                    },
                    _count: {
                        select: {
                            employees: true,
                        },
                    },
                },
            }),
        ]);
        return {
            departments,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getDepartmentById(id, organizationId) {
        const department = await database_1.prisma.department.findFirst({
            where: { id, organizationId },
            include: {
                manager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        employeeCode: true,
                        designation: true,
                    },
                },
                employees: {
                    where: { status: 'ACTIVE' },
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        employeeCode: true,
                        email: true,
                        designation: true,
                        profileImage: true,
                    },
                },
                _count: {
                    select: {
                        employees: true,
                    },
                },
            },
        });
        if (!department) {
            throw new error_middleware_1.AppError('Department not found in your organization.', 404);
        }
        return department;
    }
    async updateDepartment(id, input, organizationId, userId) {
        const department = await database_1.prisma.department.findFirst({
            where: { id, organizationId },
        });
        if (!department) {
            throw new error_middleware_1.AppError('Department not found.', 404);
        }
        if (input.code && input.code.toUpperCase() !== department.code) {
            const codeExists = await database_1.prisma.department.findUnique({
                where: {
                    organizationId_code: {
                        organizationId,
                        code: input.code.toUpperCase(),
                    },
                },
            });
            if (codeExists) {
                throw new error_middleware_1.AppError('A department with this code already exists.', 409);
            }
        }
        const updated = await database_1.prisma.department.update({
            where: { id },
            data: {
                ...input,
                ...(input.code && { code: input.code.toUpperCase() }),
            },
            include: {
                manager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        employeeCode: true,
                    },
                },
            },
        });
        await database_1.prisma.auditLog.create({
            data: {
                organizationId,
                userId,
                action: 'UPDATE_DEPARTMENT',
                entity: 'Department',
                entityId: id,
                oldValue: { name: department.name, code: department.code },
                newValue: input,
            },
        });
        return updated;
    }
    async deleteDepartment(id, organizationId, userId) {
        const department = await database_1.prisma.department.findFirst({
            where: { id, organizationId },
            include: {
                _count: {
                    select: { employees: true },
                },
            },
        });
        if (!department) {
            throw new error_middleware_1.AppError('Department not found.', 404);
        }
        if (department._count.employees > 0) {
            throw new error_middleware_1.AppError(`Cannot delete department. ${department._count.employees} employee(s) are currently assigned to this department.`, 400);
        }
        await database_1.prisma.department.delete({ where: { id } });
        await database_1.prisma.auditLog.create({
            data: {
                organizationId,
                userId,
                action: 'DELETE_DEPARTMENT',
                entity: 'Department',
                entityId: id,
                oldValue: { name: department.name, code: department.code },
            },
        });
    }
}
exports.DepartmentService = DepartmentService;
exports.departmentService = new DepartmentService();
