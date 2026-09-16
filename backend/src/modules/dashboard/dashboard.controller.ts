import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service';
import { sendSuccess } from '../../utils/response';

export class DashboardController {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getDashboardData({
        userId: req.user!.userId,
        organizationId: req.user!.organizationId,
        role: req.user!.role,
        employeeId: req.user!.employeeId,
      });
      return sendSuccess(res, 'Dashboard data retrieved successfully', data, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
