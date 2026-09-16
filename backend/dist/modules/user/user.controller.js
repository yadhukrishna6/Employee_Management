"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = exports.UserController = void 0;
const user_service_1 = require("./user.service");
const response_1 = require("../../utils/response");
class UserController {
    async create(req, res, next) {
        try {
            const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
            const organizationId = isSuperAdmin && req.body.organizationId
                ? req.body.organizationId
                : req.user.organizationId;
            const user = await user_service_1.userService.createUser(req.body, organizationId, req.user.userId);
            return (0, response_1.sendSuccess)(res, 'User created successfully', user, 201);
        }
        catch (error) {
            next(error);
        }
    }
    async getAll(req, res, next) {
        try {
            const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
            const result = await user_service_1.userService.getAllUsers(req.user.organizationId, isSuperAdmin, {
                page: Number(req.query.page),
                limit: Number(req.query.limit),
                search: req.query.search,
                role: req.query.role,
                status: req.query.status,
            });
            return (0, response_1.sendSuccess)(res, 'Users retrieved successfully', result.users, 200, result.pagination);
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
            const user = await user_service_1.userService.getUserById(req.params.id, req.user.organizationId, isSuperAdmin);
            return (0, response_1.sendSuccess)(res, 'User retrieved successfully', user, 200);
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
            const updated = await user_service_1.userService.updateUser(req.params.id, req.body, req.user.organizationId, isSuperAdmin, req.user.userId);
            return (0, response_1.sendSuccess)(res, 'User updated successfully', updated, 200);
        }
        catch (error) {
            next(error);
        }
    }
    async resetPassword(req, res, next) {
        try {
            const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
            await user_service_1.userService.resetPassword(req.params.id, req.body.newPassword, req.user.organizationId, isSuperAdmin, req.user.userId);
            return (0, response_1.sendSuccess)(res, 'User password reset successfully', null, 200);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserController = UserController;
exports.userController = new UserController();
