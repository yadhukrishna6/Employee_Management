"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveController = exports.LeaveController = void 0;
const leave_service_1 = require("./leave.service");
const response_1 = require("../../utils/response");
const error_middleware_1 = require("../../middleware/error.middleware");
class LeaveController {
    async createType(req, res, next) {
        try {
            if (!req.user.organizationId) {
                throw new error_middleware_1.AppError('Organization context required', 400);
            }
            const leaveType = await leave_service_1.leaveService.createLeaveType(req.body, req.user.organizationId);
            return (0, response_1.sendSuccess)(res, 'Leave type created successfully', leaveType, 201);
        }
        catch (error) {
            next(error);
        }
    }
    async getTypes(req, res, next) {
        try {
            if (!req.user.organizationId) {
                throw new error_middleware_1.AppError('Organization context required', 400);
            }
            const types = await leave_service_1.leaveService.getLeaveTypes(req.user.organizationId);
            return (0, response_1.sendSuccess)(res, 'Leave types retrieved', types, 200);
        }
        catch (error) {
            next(error);
        }
    }
    async apply(req, res, next) {
        try {
            if (!req.user.employeeId || !req.user.organizationId) {
                throw new error_middleware_1.AppError('Only registered employees can apply for leave.', 400);
            }
            const request = await leave_service_1.leaveService.applyLeave(req.user.employeeId, req.user.organizationId, req.body);
            return (0, response_1.sendSuccess)(res, 'Leave request submitted successfully', request, 201);
        }
        catch (error) {
            next(error);
        }
    }
    async approve(req, res, next) {
        try {
            if (!req.user.organizationId) {
                throw new error_middleware_1.AppError('Organization context required', 400);
            }
            const updated = await leave_service_1.leaveService.approveLeave(req.params.id, req.user.organizationId, req.user.userId);
            return (0, response_1.sendSuccess)(res, 'Leave request approved successfully', updated, 200);
        }
        catch (error) {
            next(error);
        }
    }
    async reject(req, res, next) {
        try {
            if (!req.user.organizationId) {
                throw new error_middleware_1.AppError('Organization context required', 400);
            }
            const updated = await leave_service_1.leaveService.rejectLeave(req.params.id, req.user.organizationId, req.body, req.user.userId);
            return (0, response_1.sendSuccess)(res, 'Leave request rejected', updated, 200);
        }
        catch (error) {
            next(error);
        }
    }
    async cancel(req, res, next) {
        try {
            if (!req.user.employeeId || !req.user.organizationId) {
                throw new error_middleware_1.AppError('Only employees can cancel their leave.', 400);
            }
            await leave_service_1.leaveService.cancelLeave(req.params.id, req.user.employeeId, req.user.organizationId);
            return (0, response_1.sendSuccess)(res, 'Leave request cancelled successfully', null, 200);
        }
        catch (error) {
            next(error);
        }
    }
    async getBalances(req, res, next) {
        try {
            if (!req.user.organizationId) {
                throw new error_middleware_1.AppError('Organization context required', 400);
            }
            const targetEmployeeId = req.user.role === 'EMPLOYEE'
                ? req.user.employeeId
                : req.query.employeeId || req.user.employeeId;
            if (!targetEmployeeId) {
                throw new error_middleware_1.AppError('Employee ID is required', 400);
            }
            const balances = await leave_service_1.leaveService.getLeaveBalances(targetEmployeeId, req.user.organizationId, req.query.year ? Number(req.query.year) : undefined);
            return (0, response_1.sendSuccess)(res, 'Leave balances retrieved', balances, 200);
        }
        catch (error) {
            next(error);
        }
    }
    async getAll(req, res, next) {
        try {
            if (!req.user.organizationId) {
                throw new error_middleware_1.AppError('Organization context required', 400);
            }
            const result = await leave_service_1.leaveService.getAllLeaveRequests(req.user.organizationId, {
                page: Number(req.query.page),
                limit: Number(req.query.limit),
                status: req.query.status,
                employeeId: req.query.employeeId,
                leaveTypeId: req.query.leaveTypeId,
            });
            return (0, response_1.sendSuccess)(res, 'Leave requests retrieved', result.data, 200, result.pagination);
        }
        catch (error) {
            next(error);
        }
    }
    async getMy(req, res, next) {
        try {
            if (!req.user.employeeId || !req.user.organizationId) {
                throw new error_middleware_1.AppError('No employee profile associated with this account.', 400);
            }
            const result = await leave_service_1.leaveService.getAllLeaveRequests(req.user.organizationId, {
                page: Number(req.query.page),
                limit: Number(req.query.limit),
                status: req.query.status,
                employeeId: req.user.employeeId,
            });
            return (0, response_1.sendSuccess)(res, 'My leave requests retrieved', result.data, 200, result.pagination);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.LeaveController = LeaveController;
exports.leaveController = new LeaveController();
