import api from './api';
import { Department, ApiResponse } from '../types';

export const departmentService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string }): Promise<ApiResponse<Department[]>> => {
    const res = await api.get<ApiResponse<Department[]>>('/departments', { params });
    return res.data;
  },

  getById: async (id: string): Promise<ApiResponse<Department>> => {
    const res = await api.get<ApiResponse<Department>>(`/departments/${id}`);
    return res.data;
  },

  create: async (data: { name: string; code: string; description?: string; managerId?: string }): Promise<ApiResponse<Department>> => {
    const res = await api.post<ApiResponse<Department>>('/departments', data);
    return res.data;
  },

  update: async (id: string, data: Partial<Department>): Promise<ApiResponse<Department>> => {
    const res = await api.put<ApiResponse<Department>>(`/departments/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const res = await api.delete<ApiResponse<null>>(`/departments/${id}`);
    return res.data;
  },
};
