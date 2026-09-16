import { Router } from 'express';
import { attendanceController } from './attendance.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import {
  checkInSchema,
  checkOutSchema,
  listAttendanceSchema,
  attendanceSummarySchema,
} from './attendance.schema';
import { UserRole } from '@prisma/client';

export const attendanceRouter = Router();

attendanceRouter.use(authenticate);

// Employee Daily Attendance Actions
attendanceRouter.post('/check-in', validateRequest(checkInSchema), attendanceController.checkIn);
attendanceRouter.post('/check-out', validateRequest(checkOutSchema), attendanceController.checkOut);
attendanceRouter.get('/my', validateRequest(listAttendanceSchema), attendanceController.getMy);
attendanceRouter.get('/summary', validateRequest(attendanceSummarySchema), attendanceController.getSummary);

// Organization Wide & Employee Specific (Admin, HR, Manager)
attendanceRouter.get(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.HR, UserRole.MANAGER),
  validateRequest(listAttendanceSchema),
  attendanceController.getAll
);

attendanceRouter.get(
  '/employee/:employeeId',
  authorize(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.HR, UserRole.MANAGER),
  validateRequest(listAttendanceSchema),
  attendanceController.getByEmployee
);
