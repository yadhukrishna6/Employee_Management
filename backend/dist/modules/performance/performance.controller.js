"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceController = exports.PerformanceController = void 0;
const performance_service_1 = require("./performance.service");
const response_1 = require("../../utils/response");
const error_middleware_1 = require("../../middleware/error.middleware");
class PerformanceController {
    async create(req, res, next) {
        try {
            if (!req.user.employeeId || !req.user.organizationId) {
                throw new error_middleware_1.AppError('Reviewer must be an employee in the organization.', 400);
            }
            const review = await performance_service_1.performanceService.createReview(req.body, req.user.employeeId, req.user.organizationId, req.user.userId);
            return (0, response_1.sendSuccess)(res, 'Performance review submitted successfully', review, 201);
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            if (!req.user.organizationId) {
                throw new error_middleware_1.AppError('Organization context required', 400);
            }
            const updated = await performance_service_1.performanceService.updateReview(req.params.id, req.body, req.user.organizationId, req.user.userId);
            return (0, response_1.sendSuccess)(res, 'Performance review updated successfully', updated, 200);
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
            const result = await performance_service_1.performanceService.getReviews(req.user.organizationId, {
                page: Number(req.query.page),
                limit: Number(req.query.limit),
                employeeId: req.query.employeeId,
                reviewerId: req.query.reviewerId,
                reviewPeriod: req.query.reviewPeriod,
            });
            return (0, response_1.sendSuccess)(res, 'Performance reviews retrieved', result.data, 200, result.pagination);
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
            const result = await performance_service_1.performanceService.getReviews(req.user.organizationId, {
                page: Number(req.query.page),
                limit: Number(req.query.limit),
                employeeId: req.user.employeeId,
                reviewPeriod: req.query.reviewPeriod,
            });
            return (0, response_1.sendSuccess)(res, 'My performance reviews retrieved', result.data, 200, result.pagination);
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            if (!req.user.organizationId) {
                throw new error_middleware_1.AppError('Organization context required', 400);
            }
            const review = await performance_service_1.performanceService.getReviewById(req.params.id, req.user.organizationId);
            if (req.user.role === 'EMPLOYEE' && review.employeeId !== req.user.employeeId) {
                throw new error_middleware_1.AppError('Access denied.', 403);
            }
            return (0, response_1.sendSuccess)(res, 'Performance review retrieved', review, 200);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PerformanceController = PerformanceController;
exports.performanceController = new PerformanceController();
