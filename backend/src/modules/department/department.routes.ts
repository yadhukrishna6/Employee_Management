import { Router } from 'express';
import { departmentController } from './department.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  listDepartmentsSchema,
} from './department.schema';
import { UserRole } from '@prisma/client';

export const departmentRouter = Router();

departmentRouter.use(authenticate);

// View routes accessible by all authenticated employees within the tenant
departmentRouter.get('/', validateRequest(listDepartmentsSchema), departmentController.getAll);
departmentRouter.get('/:id', departmentController.getById);

// Admin & HR management routes
departmentRouter.post(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.HR),
  validateRequest(createDepartmentSchema),
  departmentController.create
);

departmentRouter.put(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.HR),
  validateRequest(updateDepartmentSchema),
  departmentController.update
);

departmentRouter.delete(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.HR),
  departmentController.delete
);
