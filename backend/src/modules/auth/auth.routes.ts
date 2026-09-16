import { Router } from 'express';
import { authController } from './auth.controller';
import { validateRequest } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from './auth.schema';

export const authRouter = Router();

// Public Authentication Endpoints
authRouter.post('/register', validateRequest(registerSchema), authController.register);
authRouter.post('/login', validateRequest(loginSchema), authController.login);
authRouter.post('/refresh', validateRequest(refreshTokenSchema), authController.refreshToken);

// Protected Authentication Endpoints (Requires valid JWT Access Token)
authRouter.get('/me', authenticate, authController.getMe);
authRouter.post(
  '/change-password',
  authenticate,
  validateRequest(changePasswordSchema),
  authController.changePassword
);
authRouter.post('/logout', authenticate, authController.logout);
