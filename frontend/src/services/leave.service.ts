import api from './api';
import { ApiResponse } from '../types';

export interface LeaveType {
  id: string;
  name: string;
  code: string;
  description?: string;
  annualLimit: number;
}

export interface LeaveBalance {
  id: string;
  leaveTypeId: string;
  year: number;
  allocated: number;
  used: number;
  remaining: number;
  leaveType: LeaveType;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  leaveType: LeaveType;
  employee?: {
    firstName: string;
    lastName: string;
    email?: string;
    profileImage?: string | null;
    employeeCode: string;
    department?: { name: string };
  };
}

export const leaveService = {
  getTypes: async (): Promise<ApiResponse<LeaveType[]>> => {
    const res = await api.get<ApiResponse<LeaveType[]>>('/leaves/types');
    return res.data;
  },

  getBalances: async (employeeId?: string, year?: number): Promise<ApiResponse<LeaveBalance[]>> => {
    const res = await api.get<ApiResponse<LeaveBalance[]>>('/leaves/balance', { params: { employeeId, year } });
    return res.data;
  },

  getMyLeaves: async (params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<LeaveRequest[]>> => {
    const res = await api.get<ApiResponse<LeaveRequest[]>>('/leaves/my', { params });
    return res.data;
  },

  getAllLeaves: async (params?: { page?: number; limit?: number; status?: string; employeeId?: string }): Promise<ApiResponse<LeaveRequest[]>> => {
    const res = await api.get<ApiResponse<LeaveRequest[]>>('/leaves', { params });
    return res.data;
  },

  apply: async (data: { leaveTypeId: string; startDate: string; endDate: string; reason: string }): Promise<ApiResponse<LeaveRequest>> => {
    const res = await api.post<ApiResponse<LeaveRequest>>('/leaves', data);
    return res.data;
  },

  approve: async (id: string): Promise<ApiResponse<LeaveRequest>> => {
    const res = await api.patch<ApiResponse<LeaveRequest>>(`/leaves/${id}/approve`);
    return res.data;
  },

  reject: async (id: string, rejectionReason: string): Promise<ApiResponse<LeaveRequest>> => {
    const res = await api.patch<ApiResponse<LeaveRequest>>(`/leaves/${id}/reject`, { rejectionReason });
    return res.data;
  },

  cancel: async (id: string): Promise<ApiResponse<null>> => {
    const res = await api.patch<ApiResponse<null>>(`/leaves/${id}/cancel`);
    return res.data;
  },
};
