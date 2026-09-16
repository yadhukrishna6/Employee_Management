"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.payrollController = exports.PayrollController = void 0;
const payroll_service_1 = require("./payroll.service");
const response_1 = require("../../utils/response");
const error_middleware_1 = require("../../middleware/error.middleware");
class PayrollController {
    async setSalary(req, res, next) {
        try {
            if (!req.user.organizationId) {
                throw new error_middleware_1.AppError('Organization context required', 400);
            }
            const salary = await payroll_service_1.payrollService.setSalaryStructure(req.body, req.user.organizationId, req.user.userId);
            return (0, response_1.sendSuccess)(res, 'Salary structure updated successfully', salary, 201);
        }
        catch (error) {
            next(error);
        }
    }
    async getSalary(req, res, next) {
        try {
            if (!req.user.organizationId) {
                throw new error_middleware_1.AppError('Organization context required', 400);
            }
            const employeeId = req.user.role === 'EMPLOYEE' ? req.user.employeeId : req.params.employeeId;
            if (!employeeId) {
                throw new error_middleware_1.AppError('Employee ID is required', 400);
            }
            const salary = await payroll_service_1.payrollService.getEmployeeSalary(employeeId, req.user.organizationId);
            return (0, response_1.sendSuccess)(res, 'Salary structure retrieved', salary, 200);
        }
        catch (error) {
            next(error);
        }
    }
    async generate(req, res, next) {
        try {
            if (!req.user.organizationId) {
                throw new error_middleware_1.AppError('Organization context required', 400);
            }
            const payslip = await payroll_service_1.payrollService.generatePayslip(req.body, req.user.organizationId, req.user.userId);
            return (0, response_1.sendSuccess)(res, 'Payslip generated successfully', payslip, 201);
        }
        catch (error) {
            next(error);
        }
    }
    async generateBulk(req, res, next) {
        try {
            if (!req.user.organizationId) {
                throw new error_middleware_1.AppError('Organization context required', 400);
            }
            const result = await payroll_service_1.payrollService.generateBulkPayslips(req.body.month, req.body.year, req.user.organizationId, req.user.userId);
            return (0, response_1.sendSuccess)(res, `Bulk payslip generation completed: ${result.totalGenerated} generated`, result, 200);
        }
        catch (error) {
            next(error);
        }
    }
    async getPayslips(req, res, next) {
        try {
            if (!req.user.organizationId) {
                throw new error_middleware_1.AppError('Organization context required', 400);
            }
            const result = await payroll_service_1.payrollService.getPayslips(req.user.organizationId, {
                page: Number(req.query.page),
                limit: Number(req.query.limit),
                employeeId: req.query.employeeId,
                month: req.query.month ? Number(req.query.month) : undefined,
                year: req.query.year ? Number(req.query.year) : undefined,
            });
            return (0, response_1.sendSuccess)(res, 'Payslips retrieved successfully', result.data, 200, result.pagination);
        }
        catch (error) {
            next(error);
        }
    }
    async getMyPayslips(req, res, next) {
        try {
            if (!req.user.employeeId || !req.user.organizationId) {
                throw new error_middleware_1.AppError('No employee profile associated with this account.', 400);
            }
            const result = await payroll_service_1.payrollService.getPayslips(req.user.organizationId, {
                page: Number(req.query.page),
                limit: Number(req.query.limit),
                employeeId: req.user.employeeId,
                month: req.query.month ? Number(req.query.month) : undefined,
                year: req.query.year ? Number(req.query.year) : undefined,
            });
            return (0, response_1.sendSuccess)(res, 'My payslips retrieved successfully', result.data, 200, result.pagination);
        }
        catch (error) {
            next(error);
        }
    }
    async getPayslipById(req, res, next) {
        try {
            if (!req.user.organizationId) {
                throw new error_middleware_1.AppError('Organization context required', 400);
            }
            const payslip = await payroll_service_1.payrollService.getPayslipById(req.params.id, req.user.organizationId);
            if (req.user.role === 'EMPLOYEE' && payslip.employeeId !== req.user.employeeId) {
                throw new error_middleware_1.AppError('Access denied.', 403);
            }
            return (0, response_1.sendSuccess)(res, 'Payslip details retrieved', payslip, 200);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PayrollController = PayrollController;
exports.payrollController = new PayrollController();
