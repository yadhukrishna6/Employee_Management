import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { AttendanceStatus, LeaveRequestStatus, UserRole } from '@prisma/client';

export class DashboardService {
  async getDashboardData(user: {
    userId: string;
    organizationId: string | null;
    role: UserRole;
    employeeId?: string | null;
  }) {
    if (user.role === 'SUPER_ADMIN') {
      return this.getSuperAdminDashboard();
    }

    if (!user.organizationId) {
      throw new AppError('Organization context required.', 400);
    }

    switch (user.role) {
      case 'ORGANIZATION_ADMIN':
      case 'HR':
        return this.getAdminDashboard(user.organizationId);
      case 'MANAGER':
        return this.getManagerDashboard(user.organizationId, user.employeeId);
      case 'EMPLOYEE':
        return this.getEmployeeDashboard(user.organizationId, user.employeeId);
      default:
        throw new AppError('Invalid role.', 403);
    }
  }

  private async getSuperAdminDashboard() {
    const [totalOrgs, activeOrgs, totalUsers, recentOrgs] = await Promise.all([
      prisma.organization.count(),
      prisma.organization.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count(),
      prisma.organization.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { employees: true } } },
      }),
    ]);

    return {
      role: 'SUPER_ADMIN',
      stats: {
        totalOrganizations: totalOrgs,
        activeOrganizations: activeOrgs,
        totalUsers,
      },
      recentOrganizations: recentOrgs,
    };
  }

  private async getAdminDashboard(organizationId: string) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const [
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      departments,
      todayAttendances,
      pendingLeaves,
      recentEmployees,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.employee.count({ where: { organizationId } }),
      prisma.employee.count({ where: { organizationId, status: 'ACTIVE' } }),
      prisma.employee.count({ where: { organizationId, status: { in: ['INACTIVE', 'TERMINATED'] } } }),
      prisma.department.findMany({
        where: { organizationId },
        select: {
          id: true,
          name: true,
          code: true,
          _count: { select: { employees: true } },
        },
      }),
      prisma.attendance.findMany({
        where: { organizationId, date: today },
        select: { status: true },
      }),
      prisma.leaveRequest.count({
        where: { organizationId, status: LeaveRequestStatus.PENDING },
      }),
      prisma.employee.findMany({
        where: { organizationId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { department: { select: { name: true } } },
      }),
      prisma.auditLog.findMany({
        where: { organizationId },
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true } } },
      }),
    ]);

    // Compute today's attendance metrics
    const presentToday = todayAttendances.filter((a) => a.status === AttendanceStatus.PRESENT).length;
    const halfDayToday = todayAttendances.filter((a) => a.status === AttendanceStatus.HALF_DAY).length;
    const onLeaveToday = todayAttendances.filter((a) => a.status === AttendanceStatus.ON_LEAVE).length;
    const absentToday = Math.max(0, activeEmployees - (presentToday + halfDayToday + onLeaveToday));

    return {
      role: 'ORGANIZATION_ADMIN',
      stats: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        totalDepartments: departments.length,
        pendingLeaves,
        attendanceToday: {
          present: presentToday,
          halfDay: halfDayToday,
          onLeave: onLeaveToday,
          absent: absentToday,
        },
      },
      charts: {
        employeesByDepartment: departments.map((d) => ({
          department: d.name,
          count: d._count.employees,
        })),
      },
      recentEmployees,
      recentActivities: recentAuditLogs,
    };
  }

  private async getManagerDashboard(organizationId: string, managerEmployeeId?: string | null) {
    if (!managerEmployeeId) {
      throw new AppError('Manager employee profile not found.', 400);
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const [subordinates, pendingLeaves, performanceStats] = await Promise.all([
      prisma.employee.findMany({
        where: { organizationId, managerId: managerEmployeeId, status: 'ACTIVE' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeCode: true,
          designation: true,
          attendances: { where: { date: today } },
        },
      }),
      prisma.leaveRequest.findMany({
        where: {
          organizationId,
          status: LeaveRequestStatus.PENDING,
          employee: { managerId: managerEmployeeId },
        },
        include: {
          leaveType: true,
          employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true, email: true, profileImage: true } },
        },
      }),
      prisma.performanceReview.aggregate({
        where: { organizationId, reviewerId: managerEmployeeId },
        _avg: { overallRating: true },
        _count: { id: true },
      }),
    ]);

    const presentSubordinates = subordinates.filter(
      (s) => s.attendances.length > 0 && s.attendances[0].status === AttendanceStatus.PRESENT
    ).length;

    return {
      role: 'MANAGER',
      stats: {
        teamSize: subordinates.length,
        teamPresentToday: presentSubordinates,
        pendingTeamLeaves: pendingLeaves.length,
        averageTeamRating: performanceStats._avg.overallRating ? Math.round(performanceStats._avg.overallRating * 10) / 10 : null,
      },
      teamMembers: subordinates,
      pendingLeaves,
    };
  }

  private async getEmployeeDashboard(organizationId: string, employeeId?: string | null) {
    if (!employeeId) {
      throw new AppError('Employee profile not found.', 400);
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();

    const [todayAttendance, leaveBalances, recentLeaves, latestPayslip] = await Promise.all([
      prisma.attendance.findUnique({
        where: { employeeId_date: { employeeId, date: today } },
      }),
      prisma.leaveBalance.findMany({
        where: { employeeId, organizationId, year: currentYear },
        include: { leaveType: true },
      }),
      prisma.leaveRequest.findMany({
        where: { employeeId, organizationId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { leaveType: true },
      }),
      prisma.payslip.findFirst({
        where: { employeeId, organizationId },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      }),
    ]);

    return {
      role: 'EMPLOYEE',
      todayAttendance: todayAttendance || { status: 'NOT_CHECKED_IN', checkIn: null, checkOut: null },
      leaveBalances,
      recentLeaves,
      latestPayslip,
    };
  }
}

export const dashboardService = new DashboardService();
