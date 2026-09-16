"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardService = exports.DashboardService = void 0;
const database_1 = require("../../config/database");
const error_middleware_1 = require("../../middleware/error.middleware");
const client_1 = require("@prisma/client");
class DashboardService {
    async getDashboardData(user) {
        if (user.role === 'SUPER_ADMIN') {
            return this.getSuperAdminDashboard();
        }
        if (!user.organizationId) {
            throw new error_middleware_1.AppError('Organization context required.', 400);
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
                throw new error_middleware_1.AppError('Invalid role.', 403);
        }
    }
    async getSuperAdminDashboard() {
        const [totalOrgs, activeOrgs, totalUsers, recentOrgs] = await Promise.all([
            database_1.prisma.organization.count(),
            database_1.prisma.organization.count({ where: { status: 'ACTIVE' } }),
            database_1.prisma.user.count(),
            database_1.prisma.organization.findMany({
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
    async getAdminDashboard(organizationId) {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const [totalEmployees, activeEmployees, inactiveEmployees, departments, todayAttendances, pendingLeaves, recentEmployees, recentAuditLogs,] = await Promise.all([
            database_1.prisma.employee.count({ where: { organizationId } }),
            database_1.prisma.employee.count({ where: { organizationId, status: 'ACTIVE' } }),
            database_1.prisma.employee.count({ where: { organizationId, status: { in: ['INACTIVE', 'TERMINATED'] } } }),
            database_1.prisma.department.findMany({
                where: { organizationId },
                select: {
                    id: true,
                    name: true,
                    code: true,
                    _count: { select: { employees: true } },
                },
            }),
            database_1.prisma.attendance.findMany({
                where: { organizationId, date: today },
                select: { status: true },
            }),
            database_1.prisma.leaveRequest.count({
                where: { organizationId, status: client_1.LeaveRequestStatus.PENDING },
            }),
            database_1.prisma.employee.findMany({
                where: { organizationId },
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { department: { select: { name: true } } },
            }),
            database_1.prisma.auditLog.findMany({
                where: { organizationId },
                take: 8,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { email: true } } },
            }),
        ]);
        const presentToday = todayAttendances.filter((a) => a.status === client_1.AttendanceStatus.PRESENT).length;
        const halfDayToday = todayAttendances.filter((a) => a.status === client_1.AttendanceStatus.HALF_DAY).length;
        const onLeaveToday = todayAttendances.filter((a) => a.status === client_1.AttendanceStatus.ON_LEAVE).length;
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
    async getManagerDashboard(organizationId, managerEmployeeId) {
        if (!managerEmployeeId) {
            throw new error_middleware_1.AppError('Manager employee profile not found.', 400);
        }
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const [subordinates, pendingLeaves, performanceStats] = await Promise.all([
            database_1.prisma.employee.findMany({
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
            database_1.prisma.leaveRequest.findMany({
                where: {
                    organizationId,
                    status: client_1.LeaveRequestStatus.PENDING,
                    employee: { managerId: managerEmployeeId },
                },
                include: {
                    leaveType: true,
                    employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true, email: true, profileImage: true } },
                },
            }),
            database_1.prisma.performanceReview.aggregate({
                where: { organizationId, reviewerId: managerEmployeeId },
                _avg: { overallRating: true },
                _count: { id: true },
            }),
        ]);
        const presentSubordinates = subordinates.filter((s) => s.attendances.length > 0 && s.attendances[0].status === client_1.AttendanceStatus.PRESENT).length;
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
    async getEmployeeDashboard(organizationId, employeeId) {
        if (!employeeId) {
            throw new error_middleware_1.AppError('Employee profile not found.', 400);
        }
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const currentYear = today.getFullYear();
        const [todayAttendance, leaveBalances, recentLeaves, latestPayslip] = await Promise.all([
            database_1.prisma.attendance.findUnique({
                where: { employeeId_date: { employeeId, date: today } },
            }),
            database_1.prisma.leaveBalance.findMany({
                where: { employeeId, organizationId, year: currentYear },
                include: { leaveType: true },
            }),
            database_1.prisma.leaveRequest.findMany({
                where: { employeeId, organizationId },
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { leaveType: true },
            }),
            database_1.prisma.payslip.findFirst({
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
exports.DashboardService = DashboardService;
exports.dashboardService = new DashboardService();
