import { Request, Response, NextFunction } from 'express';
import { departmentService } from './department.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/error.middleware';

export class DepartmentController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user!.organizationId) {
        throw new AppError('Organization context required', 400);
      }
      const department = await departmentService.createDepartment(
        req.body,
        req.user!.organizationId,
        req.user!.userId
      );
      return sendSuccess(res, 'Department created successfully', department, 201);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user!.organizationId) {
        throw new AppError('Organization context required', 400);
      }
      const result = await departmentService.getAllDepartments(req.user!.organizationId, {
        page: Number(req.query.page),
        limit: Number(req.query.limit),
        search: req.query.search as string,
        status: req.query.status as string,
      });
      return sendSuccess(res, 'Departments retrieved successfully', result.departments, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user!.organizationId) {
        throw new AppError('Organization context required', 400);
      }
      const department = await departmentService.getDepartmentById(
        req.params.id,
        req.user!.organizationId
      );
      return sendSuccess(res, 'Department retrieved successfully', department, 200);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user!.organizationId) {
        throw new AppError('Organization context required', 400);
      }
      const updated = await departmentService.updateDepartment(
        req.params.id,
        req.body,
        req.user!.organizationId,
        req.user!.userId
      );
      return sendSuccess(res, 'Department updated successfully', updated, 200);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user!.organizationId) {
        throw new AppError('Organization context required', 400);
      }
      await departmentService.deleteDepartment(
        req.params.id,
        req.user!.organizationId,
        req.user!.userId
      );
      return sendSuccess(res, 'Department deleted successfully', null, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const departmentController = new DepartmentController();
