import { prisma } from '../../config/database';
import { employeeRepository } from './employee.repository';
import { AppError } from '../../middleware/error.middleware';
import { hashPassword } from '../../utils/password';
import { CreateEmployeeInput, UpdateEmployeeInput, UpdateEmployeeStatusInput } from './employee.schema';
import { EmployeeStatus, UserRole } from '@prisma/client';

export class EmployeeService {
  async createEmployee(
    input: CreateEmployeeInput,
    organizationId: string,
    currentUserId: string
  ) {
    // 1. Determine and validate Employee Code
    let code = input.employeeCode?.toUpperCase();
    if (!code) {
      const count = await employeeRepository.countInOrg(organizationId);
      code = `EMP-${String(count + 1).padStart(3, '0')}`;
    }

    const existingCode = await employeeRepository.findByCode(code, organizationId);
    if (existingCode) {
      throw new AppError(`Employee code ${code} is already in use.`, 409);
    }

    // 2. Check Email Uniqueness in Organization
    const existingEmail = await employeeRepository.findByEmail(input.email.toLowerCase(), organizationId);
    if (existingEmail) {
      throw new AppError(`An employee with email ${input.email} already exists.`, 409);
    }

    // 3. Create Employee + default leave balances inside transaction
    const result = await prisma.$transaction(async (tx) => {
      const employee = await tx.employee.create({
        data: {
          organizationId,
          employeeCode: code!,
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

      // Initialize annual leave balances for all active leave types
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

      // Optionally create Login User Account
      let createdUser = null;
      if (input.createUserAccount && input.userPassword) {
        const hashedPassword = await hashPassword(input.userPassword);
        createdUser = await tx.user.create({
          data: {
            organizationId,
            employeeId: employee.id,
            email: employee.email,
            password: hashedPassword,
            role: input.userRole as UserRole,
          },
        });
      }

      // Record Audit Log
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

  async getAllEmployees(
    organizationId: string,
    query: {
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
    return employeeRepository.findManyWithPagination(organizationId, query);
  }

  async getEmployeeById(id: string, organizationId: string) {
    const employee = await employeeRepository.findById(id, organizationId);
    if (!employee) {
      throw new AppError('Employee not found.', 404);
    }
    return employee;
  }

  async updateEmployee(
    id: string,
    input: UpdateEmployeeInput,
    organizationId: string,
    currentUserId: string
  ) {
    const existing = await employeeRepository.findById(id, organizationId);
    if (!existing) {
      throw new AppError('Employee not found.', 404);
    }

    if (input.email && input.email.toLowerCase() !== existing.email) {
      const emailTaken = await employeeRepository.findByEmail(input.email.toLowerCase(), organizationId);
      if (emailTaken) {
        throw new AppError('Email address is already in use by another employee.', 409);
      }
    }

    const updated = await prisma.employee.update({
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

    await prisma.auditLog.create({
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

  async updateStatus(
    id: string,
    input: UpdateEmployeeStatusInput,
    organizationId: string,
    currentUserId: string
  ) {
    const existing = await employeeRepository.findById(id, organizationId);
    if (!existing) {
      throw new AppError('Employee not found.', 404);
    }

    const updated = await prisma.employee.update({
      where: { id },
      data: { status: input.status },
    });

    // If employee is deactivated or terminated, deactivate corresponding user login account
    if (input.status === 'TERMINATED' || input.status === 'INACTIVE') {
      await prisma.user.updateMany({
        where: { employeeId: id },
        data: { status: 'INACTIVE', refreshToken: null },
      });
    }

    await prisma.auditLog.create({
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

  async deleteEmployee(id: string, organizationId: string, currentUserId: string) {
    const existing = await employeeRepository.findById(id, organizationId);
    if (!existing) {
      throw new AppError('Employee not found.', 404);
    }

    // Check if employee has subordinates
    if (existing.subordinates && existing.subordinates.length > 0) {
      throw new AppError(
        `Cannot delete employee. They manage ${existing.subordinates.length} team member(s). Please reassign their manager first.`,
        400
      );
    }

    await prisma.employee.delete({ where: { id } });

    await prisma.auditLog.create({
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

  async getHierarchyTree(organizationId: string) {
    const employees = await prisma.employee.findMany({
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

    // 1. Build map of all employee nodes with subordinates array
    type TreeNode = typeof employees[0] & { subordinates: TreeNode[] };
    const nodeMap = new Map<string, TreeNode>();

    employees.forEach((emp) => {
      nodeMap.set(emp.id, { ...emp, subordinates: [] });
    });

    // 2. Link subordinates to their managers, or push to root array
    const rootNodes: TreeNode[] = [];

    employees.forEach((emp) => {
      const node = nodeMap.get(emp.id)!;
      if (emp.managerId && nodeMap.has(emp.managerId)) {
        nodeMap.get(emp.managerId)!.subordinates.push(node);
      } else {
        rootNodes.push(node);
      }
    });

    return rootNodes;
  }
}

export const employeeService = new EmployeeService();

