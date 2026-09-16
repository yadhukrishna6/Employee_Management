import api from './api';
import { Organization, ApiResponse } from '../types';

export const organizationService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string }): Promise<ApiResponse<Organization[]>> => {
    const res = await api.get<ApiResponse<Organization[]>>('/organizations', { params });
    return res.data;
  },

  getById: async (id: string): Promise<ApiResponse<Organization>> => {
    const res = await api.get<ApiResponse<Organization>>(`/organizations/${id}`);
    return res.data;
  },

  create: async (data: Partial<Organization>): Promise<ApiResponse<Organization>> => {
    const res = await api.post<ApiResponse<Organization>>('/organizations', data);
    return res.data;
  },

  update: async (id: string, data: Partial<Organization>): Promise<ApiResponse<Organization>> => {
    const res = await api.put<ApiResponse<Organization>>(`/organizations/${id}`, data);
    return res.data;
  },

  updateStatus: async (id: string, status: string): Promise<ApiResponse<Organization>> => {
    const res = await api.patch<ApiResponse<Organization>>(`/organizations/${id}/status`, { status });
    return res.data;
  },
};
