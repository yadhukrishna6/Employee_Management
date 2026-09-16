"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const response_1 = require("../../utils/response");
class AuthController {
    async register(req, res, next) {
        try {
            const result = await auth_service_1.authService.register(req.body);
            return (0, response_1.sendSuccess)(res, 'Organization registered successfully', result, 201);
        }
        catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const result = await auth_service_1.authService.login(req.body, req.ip);
            return (0, response_1.sendSuccess)(res, 'Login successful', result, 200);
        }
        catch (error) {
            next(error);
        }
    }
    async refreshToken(req, res, next) {
        try {
            const tokens = await auth_service_1.authService.refreshToken(req.body.refreshToken);
            return (0, response_1.sendSuccess)(res, 'Token refreshed successfully', tokens, 200);
        }
        catch (error) {
            next(error);
        }
    }
    async getMe(req, res, next) {
        try {
            const user = await auth_service_1.authService.getCurrentUser(req.user.userId);
            return (0, response_1.sendSuccess)(res, 'User profile fetched successfully', { user }, 200);
        }
        catch (error) {
            next(error);
        }
    }
    async changePassword(req, res, next) {
        try {
            await auth_service_1.authService.changePassword(req.user.userId, req.body);
            return (0, response_1.sendSuccess)(res, 'Password changed successfully', null, 200);
        }
        catch (error) {
            next(error);
        }
    }
    async logout(req, res, next) {
        try {
            await auth_service_1.authService.logout(req.user.userId);
            return (0, response_1.sendSuccess)(res, 'Logged out successfully', null, 200);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
