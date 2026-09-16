"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardController = exports.DashboardController = void 0;
const dashboard_service_1 = require("./dashboard.service");
const response_1 = require("../../utils/response");
class DashboardController {
    async getDashboard(req, res, next) {
        try {
            const data = await dashboard_service_1.dashboardService.getDashboardData({
                userId: req.user.userId,
                organizationId: req.user.organizationId,
                role: req.user.role,
                employeeId: req.user.employeeId,
            });
            return (0, response_1.sendSuccess)(res, 'Dashboard data retrieved successfully', data, 200);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DashboardController = DashboardController;
exports.dashboardController = new DashboardController();
