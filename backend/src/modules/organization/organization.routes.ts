import { Router } from 'express';
import { organizationController } from './organization.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  updateOrgStatusSchema,
  getOrgParamsSchema,
  listOrganizationsSchema,
} from './organization.schema';
import { UserRole } from '@prisma/client';

export const organizationRouter = Router();

// All organization routes require authentication
organizationRouter.use(authenticate);

// SUPER_ADMIN Only routes
organizationRouter.post(
  '/',
  authorize(UserRole.SUPER_ADMIN),
  validateRequest(createOrganizationSchema),
  organizationController.create
);

organizationRouter.get(
  '/',
  authorize(UserRole.SUPER_ADMIN),
  validateRequest(listOrganizationsSchema),
  organizationController.getAll
);

organizationRouter.patch(
  '/:id/status',
  authorize(UserRole.SUPER_ADMIN),
  validateRequest(updateOrgStatusSchema),
  organizationController.updateStatus
);

// SUPER_ADMIN or ORGANIZATION_ADMIN routes
organizationRouter.get(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN),
  validateRequest(getOrgParamsSchema),
  organizationController.getById
);

organizationRouter.put(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN),
  validateRequest(updateOrganizationSchema),
  organizationController.update
);
