"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentController = exports.DepartmentController = void 0;
const department_service_1 = require("./department.service");
const response_1 = require("../../utils/response");
const error_middleware_1 = require("../../middleware/error.middleware");
class DepartmentController {
    async create(req, res, next) {
        try {
            if (!req.user.organizationId) {
                throw new error_middleware_1.AppError('Organization context required', 400);
            }
            const department = await department_service_1.departmentService.createDepartment(req.body, req.user.organizationId, req.user.userId);
            return (0, response_1.sendSuccess)(res, 'Department created successfully', department, 201);
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
            const result = await department_service_1.departmentService.getAllDepartments(req.user.organizationId, {
                page: Number(req.query.page),
                limit: Number(req.query.limit),
                search: req.query.search,
                status: req.query.status,
            });
            return (0, response_1.sendSuccess)(res, 'Departments retrieved successfully', result.departments, 200, result.pagination);
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
            const department = await department_service_1.departmentService.getDepartmentById(req.params.id, req.user.organizationId);
            return (0, response_1.sendSuccess)(res, 'Department retrieved successfully', department, 200);
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
            const updated = await department_service_1.departmentService.updateDepartment(req.params.id, req.body, req.user.organizationId, req.user.userId);
            return (0, response_1.sendSuccess)(res, 'Department updated successfully', updated, 200);
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            if (!req.user.organizationId) {
                throw new error_middleware_1.AppError('Organization context required', 400);
            }
            await department_service_1.departmentService.deleteDepartment(req.params.id, req.user.organizationId, req.user.userId);
            return (0, response_1.sendSuccess)(res, 'Department deleted successfully', null, 200);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DepartmentController = DepartmentController;
exports.departmentController = new DepartmentController();
