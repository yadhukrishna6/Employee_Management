import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { CreateLeaveTypeInput, ApplyLeaveInput, RejectLeaveInput } from './leave.schema';
import { LeaveRequestStatus, Prisma } from '@prisma/client';

export class LeaveService {
  private calculateWorkingDays(startDate: Date, endDate: Date): number {
    let count = 0;
    const cur = new Date(startDate);
    while (cur <= endDate) {
      const dayOfWeek = cur.getUTCDay();
      // Skip weekends (0: Sunday, 6: Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
    // If leave spans only weekend, default to minimum 1 day
    return Math.max(1, count);
  }

  async createLeaveType(input: CreateLeaveTypeInput, organizationId: string) {
    const code = input.code.toUpperCase();
    const existing = await prisma.leaveType.findUnique({
      where: {
        organizationId_code: {
          organizationId,
          code,
        },
      },
    });

    if (existing) {
      throw new AppError('A leave type with this code already exists.', 409);
    }

    return prisma.leaveType.create({
      data: {
        organizationId,
        name: input.name,
        code,
        description: input.description,
        annualLimit: input.annualLimit,
        status: input.status,
      },
    });
  }

  async getLeaveTypes(organizationId: string) {
    return prisma.leaveType.findMany({
      where: { organizationId, status: 'ACTIVE' },
      orderBy: { name: 'asc' },
    });
  }

  async applyLeave(
    employeeId: string,
    organizationId: string,
    input: ApplyLeaveInput
  ) {
    const start = new Date(input.startDate);
    const end = new Date(input.endDate);
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(0, 0, 0, 0);

    if (start > end) {
      throw new AppError('Start date cannot be after end date.', 400);
    }

    // 1. Calculate required days
    const numberOfDays = this.calculateWorkingDays(start, end);
    const currentYear = start.getFullYear();

    // 2. Check for Overlapping Leave Requests
    const overlapping = await prisma.leaveRequest.findFirst({
      where: {
        employeeId,
        status: { in: [LeaveRequestStatus.PENDING, LeaveRequestStatus.APPROVED] },
        OR: [
          {
            startDate: { lte: end },
            endDate: { gte: start },
          },
        ],
      },
    });

    if (overlapping) {
      throw new AppError(
        'You already have an active or pending leave request overlapping with these dates.',
        400
      );
    }

    // 3. Verify Leave Type & Balance
    const leaveType = await prisma.leaveType.findFirst({
      where: { id: input.leaveTypeId, organizationId },
    });

    if (!leaveType) {
      throw new AppError('Invalid leave type.', 404);
    }

    // Unpaid leave doesn't consume balance
    if (leaveType.code !== 'UNPAID') {
      let balance = await prisma.leaveBalance.findUnique({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId,
            leaveTypeId: leaveType.id,
            year: currentYear,
          },
        },
      });

      // Auto-create balance record if not initialized
      if (!balance) {
        balance = await prisma.leaveBalance.create({
          data: {
            organizationId,
            employeeId,
            leaveTypeId: leaveType.id,
            year: currentYear,
            allocated: leaveType.annualLimit,
            used: 0,
            remaining: leaveType.annualLimit,
          },
        });
      }

      if (balance.remaining < numberOfDays) {
        throw new AppError(
          `Insufficient leave balance. You have ${balance.remaining} day(s) remaining for ${leaveType.name}, but requested ${numberOfDays} day(s).`,
          400
        );
      }
    }

    // 4. Create Leave Request
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        organizationId,
        employeeId,
        leaveTypeId: leaveType.id,
        startDate: start,
        endDate: end,
        numberOfDays,
        reason: input.reason,
        status: LeaveRequestStatus.PENDING,
      },
      include: {
        leaveType: true,
        employee: {
          select: { firstName: true, lastName: true, employeeCode: true, managerId: true },
        },
      },
    });

    return leaveRequest;
  }

  async approveLeave(
    id: string,
    organizationId: string,
    approverUserId: string
  ) {
    const leave = await prisma.leaveRequest.findFirst({
      where: { id, organizationId },
      include: {
        leaveType: true,
        employee: { include: { user: true } },
      },
    });

    if (!leave) {
      throw new AppError('Leave request not found.', 404);
    }

    if (leave.status !== LeaveRequestStatus.PENDING) {
      throw new AppError(`Cannot approve a leave request with status ${leave.status}.`, 400);
    }

    const year = new Date(leave.startDate).getFullYear();

    // Execute approval and balance update atomically
    const result = await prisma.$transaction(async (tx) => {
      // Deduct balance if not unpaid
      if (leave.leaveType.code !== 'UNPAID') {
        const balance = await tx.leaveBalance.findUnique({
          where: {
            employeeId_leaveTypeId_year: {
              employeeId: leave.employeeId,
              leaveTypeId: leave.leaveTypeId,
              year,
            },
          },
        });

        if (balance && balance.remaining < leave.numberOfDays) {
          throw new AppError('Employee has insufficient remaining leave balance to approve this request.', 400);
        }

        if (balance) {
          await tx.leaveBalance.update({
            where: { id: balance.id },
            data: {
              used: { increment: leave.numberOfDays },
              remaining: { decrement: leave.numberOfDays },
            },
          });
        }
      }

      // Update Leave Request
      const updated = await tx.leaveRequest.update({
        where: { id },
        data: {
          status: LeaveRequestStatus.APPROVED,
          approvedBy: approverUserId,
          approvedAt: new Date(),
        },
        include: { leaveType: true, employee: true },
      });

      // Create in-app Notification for Employee
      if (leave.employee.user) {
        await tx.notification.create({
          data: {
            organizationId,
            userId: leave.employee.user.id,
            title: 'Leave Request Approved',
            message: `Your ${leave.leaveType.name} request from ${leave.startDate.toISOString().split('T')[0]} to ${leave.endDate.toISOString().split('T')[0]} has been approved.`,
            type: 'LEAVE',
          },
        });
      }

      // Audit Log
      await tx.auditLog.create({
        data: {
          organizationId,
          userId: approverUserId,
          action: 'APPROVE_LEAVE',
          entity: 'LeaveRequest',
          entityId: id,
          newValue: { status: 'APPROVED', approvedBy: approverUserId },
        },
      });

      return updated;
    });

    return result;
  }

  async rejectLeave(
    id: string,
    organizationId: string,
    input: RejectLeaveInput,
    rejecterUserId: string
  ) {
    const leave = await prisma.leaveRequest.findFirst({
      where: { id, organizationId },
      include: { leaveType: true, employee: { include: { user: true } } },
    });

    if (!leave) {
      throw new AppError('Leave request not found.', 404);
    }

    if (leave.status !== LeaveRequestStatus.PENDING) {
      throw new AppError(`Cannot reject a leave request with status ${leave.status}.`, 400);
    }

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: LeaveRequestStatus.REJECTED,
        approvedBy: rejecterUserId,
        approvedAt: new Date(),
        rejectionReason: input.rejectionReason,
      },
      include: { leaveType: true, employee: true },
    });

    // Notify employee
    if (leave.employee.user) {
      await prisma.notification.create({
        data: {
          organizationId,
          userId: leave.employee.user.id,
          title: 'Leave Request Rejected',
          message: `Your ${leave.leaveType.name} request was rejected. Reason: ${input.rejectionReason}`,
          type: 'LEAVE',
        },
      });
    }

    // Audit Log
    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: rejecterUserId,
        action: 'REJECT_LEAVE',
        entity: 'LeaveRequest',
        entityId: id,
        newValue: { status: 'REJECTED', reason: input.rejectionReason },
      },
    });

    return updated;
  }

  async cancelLeave(
    id: string,
    employeeId: string,
    organizationId: string
  ) {
    const leave = await prisma.leaveRequest.findFirst({
      where: { id, employeeId, organizationId },
      include: { leaveType: true },
    });

    if (!leave) {
      throw new AppError('Leave request not found.', 404);
    }

    if (leave.status === LeaveRequestStatus.CANCELLED || leave.status === LeaveRequestStatus.REJECTED) {
      throw new AppError(`Leave request is already ${leave.status.toLowerCase()}.`, 400);
    }

    // If already approved, restore balance
    const year = new Date(leave.startDate).getFullYear();

    await prisma.$transaction(async (tx) => {
      if (leave.status === LeaveRequestStatus.APPROVED && leave.leaveType.code !== 'UNPAID') {
        const balance = await tx.leaveBalance.findUnique({
          where: {
            employeeId_leaveTypeId_year: {
              employeeId: leave.employeeId,
              leaveTypeId: leave.leaveTypeId,
              year,
            },
          },
        });

        if (balance) {
          await tx.leaveBalance.update({
            where: { id: balance.id },
            data: {
              used: { decrement: leave.numberOfDays },
              remaining: { increment: leave.numberOfDays },
            },
          });
        }
      }

      await tx.leaveRequest.update({
        where: { id },
        data: { status: LeaveRequestStatus.CANCELLED },
      });
    });
  }

  async getLeaveBalances(employeeId: string, organizationId: string, year?: number) {
    const targetYear = year || new Date().getFullYear();

    return prisma.leaveBalance.findMany({
      where: {
        employeeId,
        organizationId,
        year: targetYear,
      },
      include: {
        leaveType: true,
      },
    });
  }

  async getAllLeaveRequests(
    organizationId: string,
    query: {
      page?: number;
      limit?: number;
      status?: LeaveRequestStatus;
      employeeId?: string;
      leaveTypeId?: string;
    }
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.LeaveRequestWhereInput = {
      organizationId,
    };

    if (query.status) where.status = query.status;
    if (query.employeeId) where.employeeId = query.employeeId;
    if (query.leaveTypeId) where.leaveTypeId = query.leaveTypeId;

    const [total, data] = await Promise.all([
      prisma.leaveRequest.count({ where }),
      prisma.leaveRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          leaveType: true,
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
}

export const leaveService = new LeaveService();
