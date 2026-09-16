"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeService = exports.EmployeeService = void 0;
const database_1 = require("../../config/database");
const employee_repository_1 = require("./employee.repository");
const error_middleware_1 = require("../../middleware/error.middleware");
const password_1 = require("../../utils/password");
class EmployeeService {
    async createEmployee(input, organizationId, currentUserId) {
        let code = input.employeeCode?.toUpperCase();
        if (!code) {
            const count = await employee_repository_1.employeeRepository.countInOrg(organizationId);
            code = `EMP-${String(count + 1).padStart(3, '0')}`;
        }
        const existingCode = await employee_repository_1.employeeRepository.findByCode(code, organizationId);
        if (existingCode) {
            throw new error_middleware_1.AppError(`Employee code ${code} is already in use.`, 409);
        }
        const existingEmail = await employee_repository_1.employeeRepository.findByEmail(input.email.toLowerCase(), organizationId);
        if (existingEmail) {
            throw new error_middleware_1.AppError(`An employee with email ${input.email} already exists.`, 409);
        }
        const result = await database_1.prisma.$transaction(async (tx) => {
            const employee = await tx.employee.create({
                data: {
                    organizationId,
                    employeeCode: code,
                    firstName: input.firstName,
                    lastName: input.lastName,
                    email: input.email.toLowerCase(),
                    phone: input.phone,
                    dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
                    gender: input.gender,
                    address: input.address,
                    city: input.city,
                    state: input.state,
                    country: input.country,
                    profileImage: input.profileImage,
                    departmentId: input.departmentId,
                    managerId: input.managerId,
                    designation: input.designation,
                    joiningDate: new Date(input.joiningDate),
                    employmentType: input.employmentType,
                    status: input.status,
                },
            });
            const leaveTypes = await tx.leaveType.findMany({
                where: { organizationId, status: 'ACTIVE' },
            });
            const currentYear = new Date().getFullYear();
            if (leaveTypes.length > 0) {
                await tx.leaveBalance.createMany({
                    data: leaveTypes.map((lt) => ({
                        organizationId,
                        employeeId: employee.id,
                        leaveTypeId: lt.id,
                        year: currentYear,
                        allocated: lt.annualLimit,
                        used: 0,
                        remaining: lt.annualLimit,
                    })),
                });
            }
            let createdUser = null;
            if (input.createUserAccount && input.userPassword) {
                const hashedPassword = await (0, password_1.hashPassword)(input.userPassword);
                createdUser = await tx.user.create({
                    data: {
                        organizationId,
                        employeeId: employee.id,
                        email: employee.email,
                        password: hashedPassword,
                        role: input.userRole,
                    },
                });
            }
            await tx.auditLog.create({
                data: {
                    organizationId,
                    userId: currentUserId,
                    action: 'CREATE_EMPLOYEE',
                    entity: 'Employee',
                    entityId: employee.id,
                    newValue: {
                        code: employee.employeeCode,
                        name: `${employee.firstName} ${employee.lastName}`,
                        email: employee.email,
                    },
                },
            });
            return { employee, user: createdUser };
        });
        return result.employee;
    }
    async getAllEmployees(organizationId, query) {
        return employee_repository_1.employeeRepository.findManyWithPagination(organizationId, query);
    }
    async getEmployeeById(id, organizationId) {
        const employee = await employee_repository_1.employeeRepository.findById(id, organizationId);
        if (!employee) {
            throw new error_middleware_1.AppError('Employee not found.', 404);
        }
        return employee;
    }
    async updateEmployee(id, input, organizationId, currentUserId) {
        const existing = await employee_repository_1.employeeRepository.findById(id, organizationId);
        if (!existing) {
            throw new error_middleware_1.AppError('Employee not found.', 404);
        }
        if (input.email && input.email.toLowerCase() !== existing.email) {
            const emailTaken = await employee_repository_1.employeeRepository.findByEmail(input.email.toLowerCase(), organizationId);
            if (emailTaken) {
                throw new error_middleware_1.AppError('Email address is already in use by another employee.', 409);
            }
        }
        const updated = await database_1.prisma.employee.update({
            where: { id },
            data: {
                ...input,
                email: input.email?.toLowerCase(),
                dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
                joiningDate: input.joiningDate ? new Date(input.joiningDate) : undefined,
            },
            include: {
                department: true,
                manager: true,
            },
        });
        await database_1.prisma.auditLog.create({
            data: {
                organizationId,
                userId: currentUserId,
                action: 'UPDATE_EMPLOYEE',
                entity: 'Employee',
                entityId: id,
                oldValue: {
                    firstName: existing.firstName,
                    lastName: existing.lastName,
                    designation: existing.designation,
                    status: existing.status,
                },
                newValue: input,
            },
        });
        return updated;
    }
    async updateStatus(id, input, organizationId, currentUserId) {
        const existing = await employee_repository_1.employeeRepository.findById(id, organizationId);
        if (!existing) {
            throw new error_middleware_1.AppError('Employee not found.', 404);
        }
        const updated = await database_1.prisma.employee.update({
            where: { id },
            data: { status: input.status },
        });
        if (input.status === 'TERMINATED' || input.status === 'INACTIVE') {
            await database_1.prisma.user.updateMany({
                where: { employeeId: id },
                data: { status: 'INACTIVE', refreshToken: null },
            });
        }
        await database_1.prisma.auditLog.create({
            data: {
                organizationId,
                userId: currentUserId,
                action: 'UPDATE_EMPLOYEE_STATUS',
                entity: 'Employee',
                entityId: id,
                oldValue: { status: existing.status },
                newValue: { status: input.status },
            },
        });
        return updated;
    }
    async deleteEmployee(id, organizationId, currentUserId) {
        const existing = await employee_repository_1.employeeRepository.findById(id, organizationId);
        if (!existing) {
            throw new error_middleware_1.AppError('Employee not found.', 404);
        }
        if (existing.subordinates && existing.subordinates.length > 0) {
            throw new error_middleware_1.AppError(`Cannot delete employee. They manage ${existing.subordinates.length} team member(s). Please reassign their manager first.`, 400);
        }
        await database_1.prisma.employee.delete({ where: { id } });
        await database_1.prisma.auditLog.create({
            data: {
                organizationId,
                userId: currentUserId,
                action: 'DELETE_EMPLOYEE',
                entity: 'Employee',
                entityId: id,
                oldValue: {
                    code: existing.employeeCode,
                    name: `${existing.firstName} ${existing.lastName}`,
                },
            },
        });
    }
    async getHierarchyTree(organizationId) {
        const employees = await database_1.prisma.employee.findMany({
            where: { organizationId, status: 'ACTIVE' },
            select: {
                id: true,
                employeeCode: true,
                firstName: true,
                lastName: true,
                email: true,
                designation: true,
                profileImage: true,
                managerId: true,
                department: {
                    select: { id: true, name: true, code: true },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
        const nodeMap = new Map();
        employees.forEach((emp) => {
            nodeMap.set(emp.id, { ...emp, subordinates: [] });
        });
        const rootNodes = [];
        employees.forEach((emp) => {
            const node = nodeMap.get(emp.id);
            if (emp.managerId && nodeMap.has(emp.managerId)) {
                nodeMap.get(emp.managerId).subordinates.push(node);
            }
            else {
                rootNodes.push(node);
            }
        });
        return rootNodes;
    }
}
exports.EmployeeService = EmployeeService;
exports.employeeService = new EmployeeService();
