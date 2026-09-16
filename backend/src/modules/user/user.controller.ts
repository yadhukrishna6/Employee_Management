import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service';
import { sendSuccess } from '../../utils/response';

export class UserController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const isSuperAdmin = req.user!.role === 'SUPER_ADMIN';
      const organizationId = isSuperAdmin && req.body.organizationId
        ? req.body.organizationId
        : req.user!.organizationId;

      const user = await userService.createUser(req.body, organizationId, req.user!.userId);
      return sendSuccess(res, 'User created successfully', user, 201);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const isSuperAdmin = req.user!.role === 'SUPER_ADMIN';
      const result = await userService.getAllUsers(
        req.user!.organizationId,
        isSuperAdmin,
        {
          page: Number(req.query.page),
          limit: Number(req.query.limit),
          search: req.query.search as string,
          role: req.query.role as any,
          status: req.query.status as any,
        }
      );
      return sendSuccess(res, 'Users retrieved successfully', result.users, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const isSuperAdmin = req.user!.role === 'SUPER_ADMIN';
      const user = await userService.getUserById(req.params.id, req.user!.organizationId, isSuperAdmin);
      return sendSuccess(res, 'User retrieved successfully', user, 200);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const isSuperAdmin = req.user!.role === 'SUPER_ADMIN';
      const updated = await userService.updateUser(
        req.params.id,
        req.body,
        req.user!.organizationId,
        isSuperAdmin,
        req.user!.userId
      );
      return sendSuccess(res, 'User updated successfully', updated, 200);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const isSuperAdmin = req.user!.role === 'SUPER_ADMIN';
      await userService.resetPassword(
        req.params.id,
        req.body.newPassword,
        req.user!.organizationId,
        isSuperAdmin,
        req.user!.userId
      );
      return sendSuccess(res, 'User password reset successfully', null, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
