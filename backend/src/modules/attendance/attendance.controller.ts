import { Request, Response, NextFunction } from 'express';
import { attendanceService } from './attendance.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/error.middleware';

export class AttendanceController {
  async checkIn(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user!.employeeId) {
        throw new AppError('Only linked employees can perform attendance check-in.', 400);
      }
      const attendance = await attendanceService.checkIn(
        req.user!.employeeId,
        req.user!.organizationId!,
        req.body
      );
      return sendSuccess(res, 'Checked in successfully', attendance, 200);
    } catch (error) {
      next(error);
    }
  }

  async checkOut(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user!.employeeId) {
        throw new AppError('Only linked employees can perform attendance check-out.', 400);
      }
      const attendance = await attendanceService.checkOut(req.user!.employeeId, req.body);
      return sendSuccess(res, 'Checked out successfully', attendance, 200);
    } catch (error) {
      next(error);
    }
  }

  async getMy(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user!.employeeId) {
        throw new AppError('No employee profile linked to your account.', 400);
      }
      const result = await attendanceService.getMyAttendance(req.user!.employeeId, {
        page: Number(req.query.page),
        limit: Number(req.query.limit),
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        status: req.query.status as any,
      });
      return sendSuccess(res, 'Attendance history retrieved', result.data, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user!.organizationId) {
        throw new AppError('Organization context required', 400);
      }
      const result = await attendanceService.getAllAttendance(req.user!.organizationId, {
        page: Number(req.query.page),
        limit: Number(req.query.limit),
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        status: req.query.status as any,
        employeeId: req.query.employeeId as string,
        departmentId: req.query.departmentId as string,
      });
      return sendSuccess(res, 'Attendance records retrieved', result.data, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getByEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await attendanceService.getMyAttendance(req.params.employeeId, {
        page: Number(req.query.page),
        limit: Number(req.query.limit),
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        status: req.query.status as any,
      });
      return sendSuccess(res, 'Employee attendance retrieved', result.data, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user!.organizationId) {
        throw new AppError('Organization context required', 400);
      }
      const targetEmployeeId =
        req.user!.role === 'EMPLOYEE'
          ? req.user!.employeeId || undefined
          : (req.query.employeeId as string) || undefined;

      const summary = await attendanceService.getMonthlySummary(req.user!.organizationId, {
        month: req.query.month ? Number(req.query.month) : undefined,
        year: req.query.year ? Number(req.query.year) : undefined,
        employeeId: targetEmployeeId,
      });
      return sendSuccess(res, 'Attendance summary retrieved', summary, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const attendanceController = new AttendanceController();
