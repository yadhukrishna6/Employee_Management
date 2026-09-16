import { Request, Response, NextFunction } from 'express';
import { leaveService } from './leave.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/error.middleware';

export class LeaveController {
  async createType(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user!.organizationId) {
        throw new AppError('Organization context required', 400);
      }
      const leaveType = await leaveService.createLeaveType(req.body, req.user!.organizationId);
      return sendSuccess(res, 'Leave type created successfully', leaveType, 201);
    } catch (error) {
      next(error);
    }
  }

  async getTypes(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user!.organizationId) {
        throw new AppError('Organization context required', 400);
      }
      const types = await leaveService.getLeaveTypes(req.user!.organizationId);
      return sendSuccess(res, 'Leave types retrieved', types, 200);
    } catch (error) {
      next(error);
    }
  }

  async apply(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user!.employeeId || !req.user!.organizationId) {
        throw new AppError('Only registered employees can apply for leave.', 400);
      }
      const request = await leaveService.applyLeave(
        req.user!.employeeId,
        req.user!.organizationId,
        req.body
      );
      return sendSuccess(res, 'Leave request submitted successfully', request, 201);
    } catch (error) {
      next(error);
    }
  }

  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user!.organizationId) {
        throw new AppError('Organization context required', 400);
      }
      const updated = await leaveService.approveLeave(
        req.params.id,
        req.user!.organizationId,
        req.user!.userId
      );
      return sendSuccess(res, 'Leave request approved successfully', updated, 200);
    } catch (error) {
      next(error);
    }
  }

  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user!.organizationId) {
        throw new AppError('Organization context required', 400);
      }
      const updated = await leaveService.rejectLeave(
        req.params.id,
        req.user!.organizationId,
        req.body,
        req.user!.userId
      );
      return sendSuccess(res, 'Leave request rejected', updated, 200);
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user!.employeeId || !req.user!.organizationId) {
        throw new AppError('Only employees can cancel their leave.', 400);
      }
      await leaveService.cancelLeave(req.params.id, req.user!.employeeId, req.user!.organizationId);
      return sendSuccess(res, 'Leave request cancelled successfully', null, 200);
    } catch (error) {
      next(error);
    }
  }

  async getBalances(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user!.organizationId) {
        throw new AppError('Organization context required', 400);
      }
      const targetEmployeeId =
        req.user!.role === 'EMPLOYEE'
          ? req.user!.employeeId
          : (req.query.employeeId as string) || req.user!.employeeId;

      if (!targetEmployeeId) {
        throw new AppError('Employee ID is required', 400);
      }

      const balances = await leaveService.getLeaveBalances(
        targetEmployeeId,
        req.user!.organizationId,
        req.query.year ? Number(req.query.year) : undefined
      );
      return sendSuccess(res, 'Leave balances retrieved', balances, 200);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user!.organizationId) {
        throw new AppError('Organization context required', 400);
      }
      const result = await leaveService.getAllLeaveRequests(req.user!.organizationId, {
        page: Number(req.query.page),
        limit: Number(req.query.limit),
        status: req.query.status as any,
        employeeId: req.query.employeeId as string,
        leaveTypeId: req.query.leaveTypeId as string,
      });
      return sendSuccess(res, 'Leave requests retrieved', result.data, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getMy(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user!.employeeId || !req.user!.organizationId) {
        throw new AppError('No employee profile associated with this account.', 400);
      }
      const result = await leaveService.getAllLeaveRequests(req.user!.organizationId, {
        page: Number(req.query.page),
        limit: Number(req.query.limit),
        status: req.query.status as any,
        employeeId: req.user!.employeeId,
      });
      return sendSuccess(res, 'My leave requests retrieved', result.data, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }
}

export const leaveController = new LeaveController();
