import { Router } from 'express';
import { payrollController } from './payroll.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import {
  createSalarySchema,
  generatePayslipSchema,
  generateBulkPayslipsSchema,
  listPayslipsSchema,
} from './payroll.schema';
import { UserRole } from '@prisma/client';

export const payrollRouter = Router();

payrollRouter.use(authenticate);

// Employee own payslips & salary view
payrollRouter.get('/my-payslips', payrollController.getMyPayslips);
payrollRouter.get('/my-salary', payrollController.getSalary);
payrollRouter.get('/payslips/:id', payrollController.getPayslipById);

// Admin & HR Payroll Operations
payrollRouter.post(
  '/salary',
  authorize(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.HR),
  validateRequest(createSalarySchema),
  payrollController.setSalary
);

payrollRouter.get(
  '/salary/:employeeId',
  authorize(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.HR),
  payrollController.getSalary
);

payrollRouter.post(
  '/payslips/generate',
  authorize(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.HR),
  validateRequest(generatePayslipSchema),
  payrollController.generate
);

payrollRouter.post(
  '/payslips/bulk-generate',
  authorize(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.HR),
  validateRequest(generateBulkPayslipsSchema),
  payrollController.generateBulk
);

payrollRouter.get(
  '/payslips',
  authorize(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.HR),
  validateRequest(listPayslipsSchema),
  payrollController.getPayslips
);
