import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes';
import { organizationRouter } from '../modules/organization/organization.routes';
import { userRouter } from '../modules/user/user.routes';
import { employeeRouter } from '../modules/employee/employee.routes';
import { departmentRouter } from '../modules/department/department.routes';
import { attendanceRouter } from '../modules/attendance/attendance.routes';
import { leaveRouter } from '../modules/leave/leave.routes';
import { payrollRouter } from '../modules/payroll/payroll.routes';
import { performanceRouter } from '../modules/performance/performance.routes';
import { dashboardRouter } from '../modules/dashboard/dashboard.routes';
import { notificationRouter } from '../modules/notification/notification.routes';
import { auditRouter } from '../modules/audit/audit.routes';

export const apiRouter = Router();

apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/organizations', organizationRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/employees', employeeRouter);
apiRouter.use('/departments', departmentRouter);
apiRouter.use('/attendance', attendanceRouter);
apiRouter.use('/leaves', leaveRouter);
apiRouter.use('/payroll', payrollRouter);
apiRouter.use('/performance', performanceRouter);
apiRouter.use('/dashboard', dashboardRouter);
apiRouter.use('/notifications', notificationRouter);
apiRouter.use('/audit-logs', auditRouter);
