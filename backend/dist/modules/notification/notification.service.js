"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationService = void 0;
const database_1 = require("../../config/database");
class NotificationService {
    async getUserNotifications(userId) {
        return database_1.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 30,
        });
    }
    async getUnreadCount(userId) {
        return database_1.prisma.notification.count({
            where: { userId, isRead: false },
        });
    }
    async markAsRead(id, userId) {
        return database_1.prisma.notification.updateMany({
            where: { id, userId },
            data: { isRead: true },
        });
    }
    async markAllAsRead(userId) {
        return database_1.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }
}
exports.NotificationService = NotificationService;
exports.notificationService = new NotificationService();
