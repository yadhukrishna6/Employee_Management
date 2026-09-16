import { prisma } from '../../config/database';
import { Prisma, Employee, EmployeeStatus } from '@prisma/client';

export class EmployeeRepository {
  async findManyWithPagination(
    organizationId: string,
    params: {
      page: number;
      limit: number;
      search?: string;
      status?: EmployeeStatus;
      departmentId?: string;
      designation?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ) {
    const { page, limit, search, status, departmentId, designation, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.EmployeeWhereInput = {
      organizationId,
    };

    if (status) where.status = status;
    if (departmentId) where.departmentId = departmentId;
    if (designation) where.designation = { contains: designation, mode: 'insensitive' };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employeeCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await Promise.all([
      prisma.employee.count({ where }),
      prisma.employee.findMany({
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

  async findById(id: string, organizationId: string) {
    return prisma.employee.findFirst({
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

  async findByCode(employeeCode: string, organizationId: string): Promise<Employee | null> {
    return prisma.employee.findUnique({
      where: {
        organizationId_employeeCode: {
          organizationId,
          employeeCode,
        },
      },
    });
  }

  async findByEmail(email: string, organizationId: string): Promise<Employee | null> {
    return prisma.employee.findUnique({
      where: {
        organizationId_email: {
          organizationId,
          email,
        },
      },
    });
  }

  async countInOrg(organizationId: string): Promise<number> {
    return prisma.employee.count({ where: { organizationId } });
  }

  async create(data: Prisma.EmployeeCreateInput): Promise<Employee> {
    return prisma.employee.create({ data });
  }

  async update(id: string, data: Prisma.EmployeeUpdateInput): Promise<Employee> {
    return prisma.employee.update({
      where: { id },
      data,
      include: {
        department: true,
        manager: true,
      },
    });
  }

  async delete(id: string): Promise<Employee> {
    return prisma.employee.delete({ where: { id } });
  }
}

export const employeeRepository = new EmployeeRepository();
