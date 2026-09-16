import { Request, Response, NextFunction } from 'express';
import { performanceService } from './performance.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/error.middleware';

export class PerformanceController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user!.employeeId || !req.user!.organizationId) {
        throw new AppError('Reviewer must be an employee in the organization.', 400);
      }
      const review = await performanceService.createReview(
        req.body,
        req.user!.employeeId,
        req.user!.organizationId,
        req.user!.userId
      );
      return sendSuccess(res, 'Performance review submitted successfully', review, 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user!.organizationId) {
        throw new AppError('Organization context required', 400);
      }
      const updated = await performanceService.updateReview(
        req.params.id,
        req.body,
        req.user!.organizationId,
        req.user!.userId
      );
      return sendSuccess(res, 'Performance review updated successfully', updated, 200);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user!.organizationId) {
        throw new AppError('Organization context required', 400);
      }
      const result = await performanceService.getReviews(req.user!.organizationId, {
        page: Number(req.query.page),
        limit: Number(req.query.limit),
        employeeId: req.query.employeeId as string,
        reviewerId: req.query.reviewerId as string,
        reviewPeriod: req.query.reviewPeriod as string,
      });
      return sendSuccess(res, 'Performance reviews retrieved', result.data, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getMy(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user!.employeeId || !req.user!.organizationId) {
        throw new AppError('No employee profile associated with this account.', 400);
      }
      const result = await performanceService.getReviews(req.user!.organizationId, {
        page: Number(req.query.page),
        limit: Number(req.query.limit),
        employeeId: req.user!.employeeId,
        reviewPeriod: req.query.reviewPeriod as string,
      });
      return sendSuccess(res, 'My performance reviews retrieved', result.data, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user!.organizationId) {
        throw new AppError('Organization context required', 400);
      }
      const review = await performanceService.getReviewById(req.params.id, req.user!.organizationId);

      // Security check: If EMPLOYEE, verify it is their own review
      if (req.user!.role === 'EMPLOYEE' && review.employeeId !== req.user!.employeeId) {
        throw new AppError('Access denied.', 403);
      }

      return sendSuccess(res, 'Performance review retrieved', review, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const performanceController = new PerformanceController();
