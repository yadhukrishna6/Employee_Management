import { Request, Response, NextFunction } from 'express';
import { notificationService } from './notification.service';
import { sendSuccess } from '../../utils/response';

export class NotificationController {
  async getMy(req: Request, res: Response, next: NextFunction) {
    try {
      const [notifications, unreadCount] = await Promise.all([
        notificationService.getUserNotifications(req.user!.userId),
        notificationService.getUnreadCount(req.user!.userId),
      ]);
      return sendSuccess(res, 'Notifications retrieved', { notifications, unreadCount }, 200);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.markAsRead(req.params.id, req.user!.userId);
      return sendSuccess(res, 'Notification marked as read', null, 200);
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllAsRead(req.user!.userId);
      return sendSuccess(res, 'All notifications marked as read', null, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
