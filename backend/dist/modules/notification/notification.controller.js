"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = exports.NotificationController = void 0;
const notification_service_1 = require("./notification.service");
const response_1 = require("../../utils/response");
class NotificationController {
    async getMy(req, res, next) {
        try {
            const [notifications, unreadCount] = await Promise.all([
                notification_service_1.notificationService.getUserNotifications(req.user.userId),
                notification_service_1.notificationService.getUnreadCount(req.user.userId),
            ]);
            return (0, response_1.sendSuccess)(res, 'Notifications retrieved', { notifications, unreadCount }, 200);
        }
        catch (error) {
            next(error);
        }
    }
    async markAsRead(req, res, next) {
        try {
            await notification_service_1.notificationService.markAsRead(req.params.id, req.user.userId);
            return (0, response_1.sendSuccess)(res, 'Notification marked as read', null, 200);
        }
        catch (error) {
            next(error);
        }
    }
    async markAllAsRead(req, res, next) {
        try {
            await notification_service_1.notificationService.markAllAsRead(req.user.userId);
            return (0, response_1.sendSuccess)(res, 'All notifications marked as read', null, 200);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.NotificationController = NotificationController;
exports.notificationController = new NotificationController();
