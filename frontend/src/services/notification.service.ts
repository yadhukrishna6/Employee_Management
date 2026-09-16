import api from './api';
import { ApiResponse } from '../types';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'LEAVE' | 'ATTENDANCE' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  getMy: async (): Promise<ApiResponse<{ notifications: NotificationItem[]; unreadCount: number }>> => {
    const res = await api.get<ApiResponse<{ notifications: NotificationItem[]; unreadCount: number }>>('/notifications/my');
    return res.data;
  },

  markAsRead: async (id: string): Promise<ApiResponse<null>> => {
    const res = await api.patch<ApiResponse<null>>(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async (): Promise<ApiResponse<null>> => {
    const res = await api.patch<ApiResponse<null>>('/notifications/read-all');
    return res.data;
  },
};
