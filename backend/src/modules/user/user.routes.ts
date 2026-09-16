import { Router } from 'express';
import { userController } from './user.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import {
  createUserSchema,
  updateUserSchema,
  listUsersSchema,
  resetUserPasswordSchema,
} from './user.schema';
import { UserRole } from '@prisma/client';

export const userRouter = Router();

userRouter.use(authenticate);
userRouter.use(authorize(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN));

userRouter.post('/', validateRequest(createUserSchema), userController.create);
userRouter.get('/', validateRequest(listUsersSchema), userController.getAll);
userRouter.get('/:id', userController.getById);
userRouter.put('/:id', validateRequest(updateUserSchema), userController.update);
userRouter.post(
  '/:id/reset-password',
  validateRequest(resetUserPasswordSchema),
  userController.resetPassword
);
