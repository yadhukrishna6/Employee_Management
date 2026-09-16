import api from './api';
import { Employee, ApiResponse } from '../types';

export interface EmployeeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  departmentId?: string;
  designation?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const employeeService = {
  getAll: async (params?: EmployeeQueryParams): Promise<ApiResponse<Employee[]>> => {
    const res = await api.get<ApiResponse<Employee[]>>('/employees', { params });
    return res.data;
  },

  getById: async (id: string): Promise<ApiResponse<Employee>> => {
    const res = await api.get<ApiResponse<Employee>>(`/employees/${id}`);
    return res.data;
  },

  create: async (data: Partial<Employee> & { createUserAccount?: boolean; userPassword?: string; userRole?: string }): Promise<ApiResponse<Employee>> => {
    const res = await api.post<ApiResponse<Employee>>('/employees', data);
    return res.data;
  },

  update: async (id: string, data: Partial<Employee>): Promise<ApiResponse<Employee>> => {
    const res = await api.put<ApiResponse<Employee>>(`/employees/${id}`, data);
    return res.data;
  },

  updateStatus: async (id: string, status: string): Promise<ApiResponse<Employee>> => {
    const res = await api.patch<ApiResponse<Employee>>(`/employees/${id}/status`, { status });
    return res.data;
  },

  getHierarchy: async (organizationId?: string): Promise<ApiResponse<EmployeeHierarchyNode[]>> => {
    const res = await api.get<ApiResponse<EmployeeHierarchyNode[]>>('/employees/hierarchy', {
      params: organizationId ? { organizationId } : undefined,
    });
    return res.data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const res = await api.delete<ApiResponse<null>>(`/employees/${id}`);
    return res.data;
  },
};

export interface EmployeeHierarchyNode {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  profileImage?: string | null;
  department?: { id: string; name: string; code: string };
  subordinates: EmployeeHierarchyNode[];
}
