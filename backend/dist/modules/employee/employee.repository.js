"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeRepository = exports.EmployeeRepository = void 0;
const database_1 = require("../../config/database");
class EmployeeRepository {
    async findManyWithPagination(organizationId, params) {
        const { page, limit, search, status, departmentId, designation, sortBy = 'createdAt', sortOrder = 'desc' } = params;
        const skip = (page - 1) * limit;
        const where = {
            organizationId,
        };
        if (status)
            where.status = status;
        if (departmentId)
            where.departmentId = departmentId;
        if (designation)
            where.designation = { contains: designation, mode: 'insensitive' };
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { employeeCode: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [total, data] = await Promise.all([
            database_1.prisma.employee.count({ where }),
            database_1.prisma.employee.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    department: {
                        select: { id: true, name: true, code: true },
                    },
                    manager: {
                        select: { id: true, firstName: true, lastName: true, employeeCode: true },
                    },
                    user: {
                        select: { id: true, email: true, role: true, status: true },
                    },
                },
            }),
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findById(id, organizationId) {
        return database_1.prisma.employee.findFirst({
            where: { id, organizationId },
            include: {
                department: true,
                manager: {
                    select: { id: true, firstName: true, lastName: true, employeeCode: true, designation: true },
                },
                subordinates: {
                    select: { id: true, firstName: true, lastName: true, employeeCode: true, designation: true },
                },
                user: {
                    select: { id: true, email: true, role: true, status: true, lastLoginAt: true },
                },
                leaveBalances: {
                    include: { leaveType: true },
                },
                salaries: {
                    where: { status: 'ACTIVE' },
                    take: 1,
                },
            },
        });
    }
    async findByCode(employeeCode, organizationId) {
        return database_1.prisma.employee.findUnique({
            where: {
                organizationId_employeeCode: {
                    organizationId,
                    employeeCode,
                },
            },
        });
    }
    async findByEmail(email, organizationId) {
        return database_1.prisma.employee.findUnique({
            where: {
                organizationId_email: {
                    organizationId,
                    email,
                },
            },
        });
    }
    async countInOrg(organizationId) {
        return database_1.prisma.employee.count({ where: { organizationId } });
    }
    async create(data) {
        return database_1.prisma.employee.create({ data });
    }
    async update(id, data) {
        return database_1.prisma.employee.update({
            where: { id },
            data,
            include: {
                department: true,
                manager: true,
            },
        });
    }
    async delete(id) {
        return database_1.prisma.employee.delete({ where: { id } });
    }
}
exports.EmployeeRepository = EmployeeRepository;
exports.employeeRepository = new EmployeeRepository();
