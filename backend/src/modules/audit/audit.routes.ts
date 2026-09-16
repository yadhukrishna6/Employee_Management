import { Router } from 'express';
import { auditController } from './audit.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { UserRole } from '@prisma/client';

export const auditRouter = Router();

auditRouter.use(authenticate);
auditRouter.use(authorize(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN));

auditRouter.get('/', auditController.getLogs);
