import { Request, Response, NextFunction } from 'express';
import { employeeService } from './employee.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/error.middleware';

export class EmployeeController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user!.organizationId) {
        throw new AppError('Organization context required', 400);
      }
      const employee = await employeeService.createEmployee(
        req.body,
        req.user!.organizationId,
        req.user!.userId
      );
      return sendSuccess(res, 'Employee created successfully', employee, 201);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user!.organizationId) {
        throw new AppError('Organization context required', 400);
      }
      const result = await employeeService.getAllEmployees(req.user!.organizationId, {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
        search: req.query.search as string,
        status: req.query.status as any,
        departmentId: req.query.departmentId as string,
        designation: req.query.designation as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as any,
      });
      return sendSuccess(res, 'Employees retrieved successfully', result.data, 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user!.organizationId) {
        throw new AppError('Organization context required', 400);
      }
      const employee = await employeeService.getEmployeeById(
        req.params.id,
        req.user!.organizationId
      );
      return sendSuccess(res, 'Employee details retrieved successfully', employee, 200);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user!.organizationId) {
        throw new AppError('Organization context required', 400);
      }
      const updated = await employeeService.updateEmployee(
        req.params.id,
        req.body,
        req.user!.organizationId,
        req.user!.userId
      );
      return sendSuccess(res, 'Employee updated successfully', updated, 200);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user!.organizationId) {
        throw new AppError('Organization context required', 400);
      }
      const updated = await employeeService.updateStatus(
        req.params.id,
        req.body,
        req.user!.organizationId,
        req.user!.userId
      );
      return sendSuccess(res, 'Employee status updated successfully', updated, 200);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user!.organizationId) {
        throw new AppError('Organization context required', 400);
      }
      await employeeService.deleteEmployee(
        req.params.id,
        req.user!.organizationId,
        req.user!.userId
      );
      return sendSuccess(res, 'Employee deleted successfully', null, 200);
    } catch (error) {
      next(error);
    }
  }

  async getHierarchy(req: Request, res: Response, next: NextFunction) {
    try {
      let orgId = req.user!.organizationId;

      if (!orgId && req.user!.role === 'SUPER_ADMIN') {
        if (req.query.organizationId) {
          orgId = req.query.organizationId as string;
        } else {
          const firstOrg = await prisma.organization.findFirst({ where: { status: 'ACTIVE' } });
          orgId = firstOrg?.id || null;
        }
      }

      if (!orgId) {
        throw new AppError('Organization context required', 400);
      }

      const tree = await employeeService.getHierarchyTree(orgId);
      return sendSuccess(res, 'Organization employee hierarchy retrieved', tree, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const employeeController = new EmployeeController();
