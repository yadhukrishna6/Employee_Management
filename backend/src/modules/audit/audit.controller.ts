import { Request, Response, NextFunction } from 'express';
import { auditService } from './audit.service';
import { sendSuccess } from '../../utils/response';

export class AuditController {
  async getLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const isSuperAdmin = req.user!.role === 'SUPER_ADMIN';
      const result = await auditService.getLogs(req.user!.organizationId, isSuperAdmin, {
        page: Number(req.query.page),
        limit: Number(req.query.limit),
        entity: req.query.entity as string,
        action: req.query.action as string,
        userId: req.query.userId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      });
      return sendSuccess(res, 'Audit logs retrieved', result.data, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }
}

export const auditController = new AuditController();
