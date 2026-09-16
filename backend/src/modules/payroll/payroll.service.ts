import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { CreateSalaryInput, GeneratePayslipInput } from './payroll.schema';
import { Prisma } from '@prisma/client';

export class PayrollService {
  async setSalaryStructure(
    input: CreateSalaryInput,
    organizationId: string,
    currentUserId: string
  ) {
    const employee = await prisma.employee.findFirst({
      where: { id: input.employeeId, organizationId },
    });

    if (!employee) {
      throw new AppError('Employee not found.', 404);
    }

    const netSalary = Math.round((input.basicSalary + input.allowances - input.deductions) * 100) / 100;

    if (netSalary < 0) {
      throw new AppError('Net salary cannot be negative.', 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      // Deactivate previous active salary structure
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

  async getEmployeeSalary(employeeId: string, organizationId: string) {
    const salary = await prisma.salary.findFirst({
      where: {
        employeeId,
        organizationId,
        status: 'ACTIVE',
      },
    });

    if (!salary) {
      throw new AppError('No active salary structure found for this employee.', 404);
    }

    return salary;
  }

  async generatePayslip(
    input: GeneratePayslipInput,
    organizationId: string,
    currentUserId: string
  ) {
    const employee = await prisma.employee.findFirst({
      where: { id: input.employeeId, organizationId },
      include: {
        user: true,
        salaries: { where: { status: 'ACTIVE' }, take: 1 },
      },
    });

    if (!employee) {
      throw new AppError('Employee not found.', 404);
    }

    const activeSalary = employee.salaries[0];
    if (!activeSalary) {
      throw new AppError('Cannot generate payslip: Employee has no active salary structure configured.', 400);
    }

    // Check for duplicate payslip
    const existing = await prisma.payslip.findUnique({
      where: {
        employeeId_month_year: {
          employeeId: input.employeeId,
          month: input.month,
          year: input.year,
        },
      },
    });

    if (existing) {
      throw new AppError(`A payslip for ${input.month}/${input.year} already exists for this employee.`, 409);
    }

    const payslip = await prisma.payslip.create({
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

    // Notify employee
    if (employee.user) {
      await prisma.notification.create({
        data: {
          organizationId,
          userId: employee.user.id,
          title: 'Payslip Available',
          message: `Your payslip for ${input.month}/${input.year} is now ready for viewing.`,
          type: 'INFO',
        },
      });
    }

    await prisma.auditLog.create({
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

  async generateBulkPayslips(
    month: number,
    year: number,
    organizationId: string,
    currentUserId: string
  ) {
    const employees = await prisma.employee.findMany({
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
      if (!emp.salaries[0]) continue;

      const exists = await prisma.payslip.findUnique({
        where: {
          employeeId_month_year: {
            employeeId: emp.id,
            month,
            year,
          },
        },
      });

      if (!exists) {
        const ps = await prisma.payslip.create({
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

  async getPayslips(
    organizationId: string,
    query: {
      page?: number;
      limit?: number;
      employeeId?: string;
      month?: number;
      year?: number;
    }
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.PayslipWhereInput = {
      organizationId,
    };

    if (query.employeeId) where.employeeId = query.employeeId;
    if (query.month) where.month = Number(query.month);
    if (query.year) where.year = Number(query.year);

    const [total, data] = await Promise.all([
      prisma.payslip.count({ where }),
      prisma.payslip.findMany({
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

  async getPayslipById(id: string, organizationId: string) {
    const payslip = await prisma.payslip.findFirst({
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
      throw new AppError('Payslip not found.', 404);
    }

    return payslip;
  }
}

export const payrollService = new PayrollService();
