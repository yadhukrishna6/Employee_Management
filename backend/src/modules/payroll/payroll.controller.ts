import { Request, Response, NextFunction } from 'express';
import { payrollService } from './payroll.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/error.middleware';

export class PayrollController {
  async setSalary(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user!.organizationId) {
        throw new AppError('Organization context required', 400);
      }
      const salary = await payrollService.setSalaryStructure(
        req.body,
        req.user!.organizationId,
        req.user!.userId
      );
      return sendSuccess(res, 'Salary structure updated successfully', salary, 201);
    } catch (error) {
      next(error);
    }
  }

  async getSalary(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user!.organizationId) {
        throw new AppError('Organization context required', 400);
      }
      const employeeId =
        req.user!.role === 'EMPLOYEE' ? req.user!.employeeId! : req.params.employeeId;

      if (!employeeId) {
        throw new AppError('Employee ID is required', 400);
      }

      const salary = await payrollService.getEmployeeSalary(employeeId, req.user!.organizationId);
      return sendSuccess(res, 'Salary structure retrieved', salary, 200);
    } catch (error) {
      next(error);
    }
  }

  async generate(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user!.organizationId) {
        throw new AppError('Organization context required', 400);
      }
      const payslip = await payrollService.generatePayslip(
        req.body,
        req.user!.organizationId,
        req.user!.userId
      );
      return sendSuccess(res, 'Payslip generated successfully', payslip, 201);
    } catch (error) {
      next(error);
    }
  }

  async generateBulk(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user!.organizationId) {
        throw new AppError('Organization context required', 400);
      }
      const result = await payrollService.generateBulkPayslips(
        req.body.month,
        req.body.year,
        req.user!.organizationId,
        req.user!.userId
      );
      return sendSuccess(res, `Bulk payslip generation completed: ${result.totalGenerated} generated`, result, 200);
    } catch (error) {
      next(error);
    }
  }

  async getPayslips(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user!.organizationId) {
        throw new AppError('Organization context required', 400);
      }
      const result = await payrollService.getPayslips(req.user!.organizationId, {
        page: Number(req.query.page),
        limit: Number(req.query.limit),
        employeeId: req.query.employeeId as string,
        month: req.query.month ? Number(req.query.month) : undefined,
        year: req.query.year ? Number(req.query.year) : undefined,
      });
      return sendSuccess(res, 'Payslips retrieved successfully', result.data, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getMyPayslips(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user!.employeeId || !req.user!.organizationId) {
        throw new AppError('No employee profile associated with this account.', 400);
      }
      const result = await payrollService.getPayslips(req.user!.organizationId, {
        page: Number(req.query.page),
        limit: Number(req.query.limit),
        employeeId: req.user!.employeeId,
        month: req.query.month ? Number(req.query.month) : undefined,
        year: req.query.year ? Number(req.query.year) : undefined,
      });
      return sendSuccess(res, 'My payslips retrieved successfully', result.data, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getPayslipById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user!.organizationId) {
        throw new AppError('Organization context required', 400);
      }
      const payslip = await payrollService.getPayslipById(req.params.id, req.user!.organizationId);

      // Security check: Employee can only view their own payslip
      if (req.user!.role === 'EMPLOYEE' && payslip.employeeId !== req.user!.employeeId) {
        throw new AppError('Access denied.', 403);
      }

      return sendSuccess(res, 'Payslip details retrieved', payslip, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const payrollController = new PayrollController();
