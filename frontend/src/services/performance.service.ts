import api from './api';
import { ApiResponse } from '../types';

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  reviewPeriod: string;
  technicalSkill: number;
  communication: number;
  teamwork: number;
  problemSolving: number;
  overallRating: number;
  comments?: string;
  status: string;
  createdAt: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    profileImage?: string | null;
    employeeCode: string;
    designation: string;
    department?: { name: string };
  };
  reviewer?: {
    firstName: string;
    lastName: string;
    designation: string;
  };
}

export const performanceService = {
  create: async (data: {
    employeeId: string;
    reviewPeriod: string;
    technicalSkill: number;
    communication: number;
    teamwork: number;
    problemSolving: number;
    comments?: string;
  }): Promise<ApiResponse<PerformanceReview>> => {
    const res = await api.post<ApiResponse<PerformanceReview>>('/performance', data);
    return res.data;
  },

  update: async (id: string, data: Partial<PerformanceReview>): Promise<ApiResponse<PerformanceReview>> => {
    const res = await api.put<ApiResponse<PerformanceReview>>(`/performance/${id}`, data);
    return res.data;
  },

  getAll: async (params?: { page?: number; limit?: number; employeeId?: string; reviewPeriod?: string }): Promise<ApiResponse<PerformanceReview[]>> => {
    const res = await api.get<ApiResponse<PerformanceReview[]>>('/performance', { params });
    return res.data;
  },

  getMy: async (): Promise<ApiResponse<PerformanceReview[]>> => {
    const res = await api.get<ApiResponse<PerformanceReview[]>>('/performance/my');
    return res.data;
  },

  getById: async (id: string): Promise<ApiResponse<PerformanceReview>> => {
    const res = await api.get<ApiResponse<PerformanceReview>>(`/performance/${id}`);
    return res.data;
  },
};
