"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeController = exports.EmployeeController = void 0;
const employee_service_1 = require("./employee.service");
const database_1 = require("../../config/database");
const response_1 = require("../../utils/response");
const error_middleware_1 = require("../../middleware/error.middleware");
class EmployeeController {
    async create(req, res, next) {
        try {
            if (!req.user.organizationId) {
                throw new error_middleware_1.AppError('Organization context required', 400);
            }
            const employee = await employee_service_1.employeeService.createEmployee(req.body, req.user.organizationId, req.user.userId);
            return (0, response_1.sendSuccess)(res, 'Employee created successfully', employee, 201);
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
            const result = await employee_service_1.employeeService.getAllEmployees(req.user.organizationId, {
                page: Number(req.query.page) || 1,
                limit: Number(req.query.limit) || 10,
                search: req.query.search,
                status: req.query.status,
                departmentId: req.query.departmentId,
                designation: req.query.designation,
                sortBy: req.query.sortBy,
                sortOrder: req.query.sortOrder,
            });
            return (0, response_1.sendSuccess)(res, 'Employees retrieved successfully', result.data, 200, {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            });
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
            const employee = await employee_service_1.employeeService.getEmployeeById(req.params.id, req.user.organizationId);
            return (0, response_1.sendSuccess)(res, 'Employee details retrieved successfully', employee, 200);
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
            const updated = await employee_service_1.employeeService.updateEmployee(req.params.id, req.body, req.user.organizationId, req.user.userId);
            return (0, response_1.sendSuccess)(res, 'Employee updated successfully', updated, 200);
        }
        catch (error) {
            next(error);
        }
    }
    async updateStatus(req, res, next) {
        try {
            if (!req.user.organizationId) {
                throw new error_middleware_1.AppError('Organization context required', 400);
            }
            const updated = await employee_service_1.employeeService.updateStatus(req.params.id, req.body, req.user.organizationId, req.user.userId);
            return (0, response_1.sendSuccess)(res, 'Employee status updated successfully', updated, 200);
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
            await employee_service_1.employeeService.deleteEmployee(req.params.id, req.user.organizationId, req.user.userId);
            return (0, response_1.sendSuccess)(res, 'Employee deleted successfully', null, 200);
        }
        catch (error) {
            next(error);
        }
    }
    async getHierarchy(req, res, next) {
        try {
            let orgId = req.user.organizationId;
            if (!orgId && req.user.role === 'SUPER_ADMIN') {
                if (req.query.organizationId) {
                    orgId = req.query.organizationId;
                }
                else {
                    const firstOrg = await database_1.prisma.organization.findFirst({ where: { status: 'ACTIVE' } });
                    orgId = firstOrg?.id || null;
                }
            }
            if (!orgId) {
                throw new error_middleware_1.AppError('Organization context required', 400);
            }
            const tree = await employee_service_1.employeeService.getHierarchyTree(orgId);
            return (0, response_1.sendSuccess)(res, 'Organization employee hierarchy retrieved', tree, 200);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.EmployeeController = EmployeeController;
exports.employeeController = new EmployeeController();
