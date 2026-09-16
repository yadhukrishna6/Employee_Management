import { Router } from 'express';
import { performanceController } from './performance.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import {
  createReviewSchema,
  updateReviewSchema,
  listReviewsSchema,
} from './performance.schema';
import { UserRole } from '@prisma/client';

export const performanceRouter = Router();

performanceRouter.use(authenticate);

// Employee own reviews
performanceRouter.get('/my', performanceController.getMy);
performanceRouter.get('/:id', performanceController.getById);

// Manager / HR / Admin actions
performanceRouter.post(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.HR, UserRole.MANAGER),
  validateRequest(createReviewSchema),
  performanceController.create
);

performanceRouter.put(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.HR, UserRole.MANAGER),
  validateRequest(updateReviewSchema),
  performanceController.update
);

performanceRouter.get(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.HR, UserRole.MANAGER),
  validateRequest(listReviewsSchema),
  performanceController.getAll
);
