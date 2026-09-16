import { Request, Response, NextFunction } from 'express';
import { organizationService } from './organization.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/error.middleware';

export class OrganizationController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const org = await organizationService.createOrganization(req.body, req.user!.userId);
      return sendSuccess(res, 'Organization created successfully', org, 201);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.getAllOrganizations({
        page: Number(req.query.page),
        limit: Number(req.query.limit),
        search: req.query.search as string,
        status: req.query.status as any,
      });
      return sendSuccess(res, 'Organizations retrieved successfully', result.organizations, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Tenant check: Org admin can only access their own organization
      if (req.user!.role !== 'SUPER_ADMIN' && req.user!.organizationId !== id) {
        throw new AppError('Forbidden. You do not have permission to view this organization.', 403);
      }

      const org = await organizationService.getOrganizationById(id);
      return sendSuccess(res, 'Organization retrieved successfully', org, 200);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (req.user!.role !== 'SUPER_ADMIN' && req.user!.organizationId !== id) {
        throw new AppError('Forbidden. You do not have permission to modify this organization.', 403);
      }

      const updated = await organizationService.updateOrganization(id, req.body, req.user!.userId);
      return sendSuccess(res, 'Organization updated successfully', updated, 200);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await organizationService.updateStatus(id, req.body, req.user!.userId);
      return sendSuccess(res, 'Organization status updated successfully', updated, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const organizationController = new OrganizationController();
