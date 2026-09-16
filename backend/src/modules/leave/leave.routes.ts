import { Router } from 'express';
import { leaveController } from './leave.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import {
  createLeaveTypeSchema,
  applyLeaveSchema,
  approveLeaveSchema,
  rejectLeaveSchema,
  cancelLeaveSchema,
  listLeavesSchema,
} from './leave.schema';
import { UserRole } from '@prisma/client';

export const leaveRouter = Router();

leaveRouter.use(authenticate);

// Leave Types
leaveRouter.get('/types', leaveController.getTypes);
leaveRouter.post(
  '/types',
  authorize(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.HR),
  validateRequest(createLeaveTypeSchema),
  leaveController.createType
);

// Employee actions
leaveRouter.post('/', validateRequest(applyLeaveSchema), leaveController.apply);
leaveRouter.get('/my', validateRequest(listLeavesSchema), leaveController.getMy);
leaveRouter.get('/balance', leaveController.getBalances);
leaveRouter.patch('/:id/cancel', validateRequest(cancelLeaveSchema), leaveController.cancel);

// Approvals & Management (Admin, HR, Manager)
leaveRouter.get(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.HR, UserRole.MANAGER),
  validateRequest(listLeavesSchema),
  leaveController.getAll
);

leaveRouter.patch(
  '/:id/approve',
  authorize(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.HR, UserRole.MANAGER),
  validateRequest(approveLeaveSchema),
  leaveController.approve
);

leaveRouter.patch(
  '/:id/reject',
  authorize(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.HR, UserRole.MANAGER),
  validateRequest(rejectLeaveSchema),
  leaveController.reject
);
