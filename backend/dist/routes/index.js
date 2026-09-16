"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRouter = void 0;
const express_1 = require("express");
const auth_routes_1 = require("../modules/auth/auth.routes");
const organization_routes_1 = require("../modules/organization/organization.routes");
const user_routes_1 = require("../modules/user/user.routes");
const employee_routes_1 = require("../modules/employee/employee.routes");
const department_routes_1 = require("../modules/department/department.routes");
const attendance_routes_1 = require("../modules/attendance/attendance.routes");
const leave_routes_1 = require("../modules/leave/leave.routes");
const payroll_routes_1 = require("../modules/payroll/payroll.routes");
const performance_routes_1 = require("../modules/performance/performance.routes");
const dashboard_routes_1 = require("../modules/dashboard/dashboard.routes");
const notification_routes_1 = require("../modules/notification/notification.routes");
const audit_routes_1 = require("../modules/audit/audit.routes");
exports.apiRouter = (0, express_1.Router)();
exports.apiRouter.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
exports.apiRouter.use('/auth', auth_routes_1.authRouter);
exports.apiRouter.use('/organizations', organization_routes_1.organizationRouter);
exports.apiRouter.use('/users', user_routes_1.userRouter);
exports.apiRouter.use('/employees', employee_routes_1.employeeRouter);
exports.apiRouter.use('/departments', department_routes_1.departmentRouter);
exports.apiRouter.use('/attendance', attendance_routes_1.attendanceRouter);
exports.apiRouter.use('/leaves', leave_routes_1.leaveRouter);
exports.apiRouter.use('/payroll', payroll_routes_1.payrollRouter);
exports.apiRouter.use('/performance', performance_routes_1.performanceRouter);
exports.apiRouter.use('/dashboard', dashboard_routes_1.dashboardRouter);
exports.apiRouter.use('/notifications', notification_routes_1.notificationRouter);
exports.apiRouter.use('/audit-logs', audit_routes_1.auditRouter);
