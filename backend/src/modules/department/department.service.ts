import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { CreateDepartmentInput, UpdateDepartmentInput } from './department.schema';
import { Prisma } from '@prisma/client';

export class DepartmentService {
  async createDepartment(
    input: CreateDepartmentInput,
    organizationId: string,
    userId: string
  ) {
    const code = input.code.toUpperCase();

    // Check code uniqueness within organization
    const existing = await prisma.department.findUnique({
      where: {
        organizationId_code: {
          organizationId,
          code,
        },
      },
    });

    if (existing) {
      throw new AppError('A department with this code already exists in your organization.', 409);
    }

    const department = await prisma.department.create({
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

    await prisma.auditLog.create({
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

  async getAllDepartments(
    organizationId: string,
    query: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
    }
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.DepartmentWhereInput = {
      organizationId,
    };

    if (query.status) where.status = query.status;

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, departments] = await Promise.all([
      prisma.department.count({ where }),
      prisma.department.findMany({
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

  async getDepartmentById(id: string, organizationId: string) {
    const department = await prisma.department.findFirst({
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
      throw new AppError('Department not found in your organization.', 404);
    }

    return department;
  }

  async updateDepartment(
    id: string,
    input: UpdateDepartmentInput,
    organizationId: string,
    userId: string
  ) {
    const department = await prisma.department.findFirst({
      where: { id, organizationId },
    });

    if (!department) {
      throw new AppError('Department not found.', 404);
    }

    if (input.code && input.code.toUpperCase() !== department.code) {
      const codeExists = await prisma.department.findUnique({
        where: {
          organizationId_code: {
            organizationId,
            code: input.code.toUpperCase(),
          },
        },
      });
      if (codeExists) {
        throw new AppError('A department with this code already exists.', 409);
      }
    }

    const updated = await prisma.department.update({
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

    await prisma.auditLog.create({
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

  async deleteDepartment(id: string, organizationId: string, userId: string) {
    const department = await prisma.department.findFirst({
      where: { id, organizationId },
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });

    if (!department) {
      throw new AppError('Department not found.', 404);
    }

    if (department._count.employees > 0) {
      throw new AppError(
        `Cannot delete department. ${department._count.employees} employee(s) are currently assigned to this department.`,
        400
      );
    }

    await prisma.department.delete({ where: { id } });

    await prisma.auditLog.create({
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

export const departmentService = new DepartmentService();
