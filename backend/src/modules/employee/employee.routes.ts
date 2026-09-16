import { Router } from 'express';
import { employeeController } from './employee.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  updateEmployeeStatusSchema,
  listEmployeesSchema,
} from './employee.schema';
import { UserRole } from '@prisma/client';

export const employeeRouter = Router();

employeeRouter.use(authenticate);

// List & View endpoints
employeeRouter.get('/hierarchy', employeeController.getHierarchy);
employeeRouter.get('/', validateRequest(listEmployeesSchema), employeeController.getAll);
employeeRouter.get('/:id', employeeController.getById);

// Admin & HR management endpoints
employeeRouter.post(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.HR),
  validateRequest(createEmployeeSchema),
  employeeController.create
);

employeeRouter.put(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.HR),
  validateRequest(updateEmployeeSchema),
  employeeController.update
);

employeeRouter.patch(
  '/:id/status',
  authorize(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.HR),
  validateRequest(updateEmployeeStatusSchema),
  employeeController.updateStatus
);

employeeRouter.delete(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.HR),
  employeeController.delete
);
