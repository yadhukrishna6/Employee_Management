import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { CheckInInput, CheckOutInput } from './attendance.schema';
import { AttendanceStatus, Prisma } from '@prisma/client';

export class AttendanceService {
  /**
   * Helper: Normalize a date to UTC midnight (start of day) for @db.Date column
   */
  private getMidnightDate(dateStr?: string): Date {
    const d = dateStr ? new Date(dateStr) : new Date();
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }

  async checkIn(
    employeeId: string,
    organizationId: string,
    input: CheckInInput
  ) {
    const today = this.getMidnightDate(input.date);
    const now = new Date();

    // Check if attendance record already exists for this date
    const existing = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: today,
        },
      },
    });

    if (existing && existing.checkIn) {
      throw new AppError('You have already checked in for this date.', 400);
    }

    const attendance = await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId,
          date: today,
        },
      },
      update: {
        checkIn: now,
        status: AttendanceStatus.PRESENT,
        remarks: input.remarks || existing?.remarks,
      },
      create: {
        organizationId,
        employeeId,
        date: today,
        checkIn: now,
        status: AttendanceStatus.PRESENT,
        remarks: input.remarks,
      },
    });

    return attendance;
  }

  async checkOut(employeeId: string, input: CheckOutInput) {
    const today = this.getMidnightDate();
    const now = new Date();

    const existing = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: today,
        },
      },
    });

    if (!existing || !existing.checkIn) {
      throw new AppError('No check-in record found for today. Please check in first.', 400);
    }

    if (existing.checkOut) {
      throw new AppError('You have already checked out for today.', 400);
    }

    // Calculate working hours in decimal format (e.g. 8.5 hours)
    const diffMs = now.getTime() - new Date(existing.checkIn).getTime();
    const workingHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;

    // Determine status based on hours
    let status = existing.status;
    if (workingHours < 4) {
      status = AttendanceStatus.HALF_DAY;
    } else {
      status = AttendanceStatus.PRESENT;
    }

    const updated = await prisma.attendance.update({
      where: { id: existing.id },
      data: {
        checkOut: now,
        workingHours,
        status,
        remarks: input.remarks ? `${existing.remarks ? existing.remarks + ' | ' : ''}${input.remarks}` : existing.remarks,
      },
    });

    return updated;
  }

  async getMyAttendance(
    employeeId: string,
    query: {
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
      status?: AttendanceStatus;
    }
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.AttendanceWhereInput = {
      employeeId,
    };

    if (query.status) where.status = query.status;

    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) where.date.gte = this.getMidnightDate(query.startDate);
      if (query.endDate) where.date.lte = this.getMidnightDate(query.endDate);
    }

    const [total, data] = await Promise.all([
      prisma.attendance.count({ where }),
      prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
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

  async getAllAttendance(
    organizationId: string,
    query: {
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
      status?: AttendanceStatus;
      employeeId?: string;
      departmentId?: string;
    }
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.AttendanceWhereInput = {
      organizationId,
    };

    if (query.status) where.status = query.status;
    if (query.employeeId) where.employeeId = query.employeeId;

    if (query.departmentId) {
      where.employee = { departmentId: query.departmentId };
    }

    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) where.date.gte = this.getMidnightDate(query.startDate);
      if (query.endDate) where.date.lte = this.getMidnightDate(query.endDate);
    }

    const [total, data] = await Promise.all([
      prisma.attendance.count({ where }),
      prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
              designation: true,
              department: {
                select: { id: true, name: true, code: true },
              },
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

  async getMonthlySummary(
    organizationId: string,
    params: {
      month?: number;
      year?: number;
      employeeId?: string;
    }
  ) {
    const now = new Date();
    const month = params.month || now.getMonth() + 1;
    const year = params.year || now.getFullYear();

    const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
    const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59));

    const where: Prisma.AttendanceWhereInput = {
      organizationId,
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    };

    if (params.employeeId) {
      where.employeeId = params.employeeId;
    }

    const records = await prisma.attendance.findMany({
      where,
      select: {
        status: true,
        workingHours: true,
        date: true,
      },
    });

    const summary = {
      month,
      year,
      totalRecords: records.length,
      present: records.filter((r) => r.status === AttendanceStatus.PRESENT).length,
      absent: records.filter((r) => r.status === AttendanceStatus.ABSENT).length,
      halfDay: records.filter((r) => r.status === AttendanceStatus.HALF_DAY).length,
      onLeave: records.filter((r) => r.status === AttendanceStatus.ON_LEAVE).length,
      totalWorkingHours: Math.round(records.reduce((acc, r) => acc + r.workingHours, 0) * 10) / 10,
    };

    return summary;
  }
}

export const attendanceService = new AttendanceService();
