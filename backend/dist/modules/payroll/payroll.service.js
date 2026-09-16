"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.payrollService = exports.PayrollService = void 0;
const database_1 = require("../../config/database");
const error_middleware_1 = require("../../middleware/error.middleware");
class PayrollService {
    async setSalaryStructure(input, organizationId, currentUserId) {
        const employee = await database_1.prisma.employee.findFirst({
            where: { id: input.employeeId, organizationId },
        });
        if (!employee) {
            throw new error_middleware_1.AppError('Employee not found.', 404);
        }
        const netSalary = Math.round((input.basicSalary + input.allowances - input.deductions) * 100) / 100;
        if (netSalary < 0) {
            throw new error_middleware_1.AppError('Net salary cannot be negative.', 400);
        }
        const result = await database_1.prisma.$transaction(async (tx) => {
            await tx.salary.updateMany({
                where: {
                    employeeId: input.employeeId,
                    organizationId,
                    status: 'ACTIVE',
                },
                data: { status: 'INACTIVE', effectiveTo: new Date(input.effectiveFrom) },
            });
            const salary = await tx.salary.create({
                data: {
                    organizationId,
                    employeeId: input.employeeId,
                    basicSalary: input.basicSalary,
                    allowances: input.allowances,
                    deductions: input.deductions,
                    netSalary,
                    effectiveFrom: new Date(input.effectiveFrom),
                    effectiveTo: input.effectiveTo ? new Date(input.effectiveTo) : null,
                    status: 'ACTIVE',
                },
            });
            await tx.auditLog.create({
                data: {
                    organizationId,
                    userId: currentUserId,
                    action: 'SET_SALARY_STRUCTURE',
                    entity: 'Salary',
                    entityId: salary.id,
                    newValue: { basic: salary.basicSalary, net: salary.netSalary },
                },
            });
            return salary;
        });
        return result;
    }
    async getEmployeeSalary(employeeId, organizationId) {
        const salary = await database_1.prisma.salary.findFirst({
            where: {
                employeeId,
                organizationId,
                status: 'ACTIVE',
            },
        });
        if (!salary) {
            throw new error_middleware_1.AppError('No active salary structure found for this employee.', 404);
        }
        return salary;
    }
    async generatePayslip(input, organizationId, currentUserId) {
        const employee = await database_1.prisma.employee.findFirst({
            where: { id: input.employeeId, organizationId },
            include: {
                user: true,
                salaries: { where: { status: 'ACTIVE' }, take: 1 },
            },
        });
        if (!employee) {
            throw new error_middleware_1.AppError('Employee not found.', 404);
        }
        const activeSalary = employee.salaries[0];
        if (!activeSalary) {
            throw new error_middleware_1.AppError('Cannot generate payslip: Employee has no active salary structure configured.', 400);
        }
        const existing = await database_1.prisma.payslip.findUnique({
            where: {
                employeeId_month_year: {
                    employeeId: input.employeeId,
                    month: input.month,
                    year: input.year,
                },
            },
        });
        if (existing) {
            throw new error_middleware_1.AppError(`A payslip for ${input.month}/${input.year} already exists for this employee.`, 409);
        }
        const payslip = await database_1.prisma.payslip.create({
            data: {
                organizationId,
                employeeId: input.employeeId,
                salaryId: activeSalary.id,
                month: input.month,
                year: input.year,
                basicSalary: activeSalary.basicSalary,
                allowances: activeSalary.allowances,
                deductions: activeSalary.deductions,
                netSalary: activeSalary.netSalary,
            },
            include: {
                employee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        employeeCode: true,
                        designation: true,
                        department: { select: { name: true } },
                    },
                },
            },
        });
        if (employee.user) {
            await database_1.prisma.notification.create({
                data: {
                    organizationId,
                    userId: employee.user.id,
                    title: 'Payslip Available',
                    message: `Your payslip for ${input.month}/${input.year} is now ready for viewing.`,
                    type: 'INFO',
                },
            });
        }
        await database_1.prisma.auditLog.create({
            data: {
                organizationId,
                userId: currentUserId,
                action: 'GENERATE_PAYSLIP',
                entity: 'Payslip',
                entityId: payslip.id,
                newValue: { month: payslip.month, year: payslip.year, netSalary: payslip.netSalary },
            },
        });
        return payslip;
    }
    async generateBulkPayslips(month, year, organizationId, currentUserId) {
        const employees = await database_1.prisma.employee.findMany({
            where: {
                organizationId,
                status: 'ACTIVE',
            },
            include: {
                salaries: { where: { status: 'ACTIVE' }, take: 1 },
            },
        });
        const generated = [];
        for (const emp of employees) {
            if (!emp.salaries[0])
                continue;
            const exists = await database_1.prisma.payslip.findUnique({
                where: {
                    employeeId_month_year: {
                        employeeId: emp.id,
                        month,
                        year,
                    },
                },
            });
            if (!exists) {
                const ps = await database_1.prisma.payslip.create({
                    data: {
                        organizationId,
                        employeeId: emp.id,
                        salaryId: emp.salaries[0].id,
                        month,
                        year,
                        basicSalary: emp.salaries[0].basicSalary,
                        allowances: emp.salaries[0].allowances,
                        deductions: emp.salaries[0].deductions,
                        netSalary: emp.salaries[0].netSalary,
                    },
                });
                generated.push(ps);
            }
        }
        return { totalGenerated: generated.length };
    }
    async getPayslips(organizationId, query) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
        const skip = (page - 1) * limit;
        const where = {
            organizationId,
        };
        if (query.employeeId)
            where.employeeId = query.employeeId;
        if (query.month)
            where.month = Number(query.month);
        if (query.year)
            where.year = Number(query.year);
        const [total, data] = await Promise.all([
            database_1.prisma.payslip.count({ where }),
            database_1.prisma.payslip.findMany({
                where,
                skip,
                take: limit,
                orderBy: [{ year: 'desc' }, { month: 'desc' }],
                include: {
                    employee: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            employeeCode: true,
                            designation: true,
                            department: { select: { name: true } },
                        },
                    },
                },
            }),
        ]);
        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getPayslipById(id, organizationId) {
        const payslip = await database_1.prisma.payslip.findFirst({
            where: { id, organizationId },
            include: {
                employee: {
                    include: {
                        department: true,
                        organization: true,
                    },
                },
            },
        });
        if (!payslip) {
            throw new error_middleware_1.AppError('Payslip not found.', 404);
        }
        return payslip;
    }
}
exports.PayrollService = PayrollService;
exports.payrollService = new PayrollService();
