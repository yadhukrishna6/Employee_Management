import api from './api';
import { ApiResponse } from '../types';

export interface AuditLogItem {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  createdAt: string;
  user?: {
    email: string;
    role: string;
    employee?: {
      firstName: string;
      lastName: string;
      employeeCode: string;
    };
  };
}

export const auditService = {
  getAll: async (params?: { page?: number; limit?: number; entity?: string; action?: string; userId?: string }): Promise<ApiResponse<AuditLogItem[]>> => {
    const res = await api.get<ApiResponse<AuditLogItem[]>>('/audit-logs', { params });
    return res.data;
  },
};
