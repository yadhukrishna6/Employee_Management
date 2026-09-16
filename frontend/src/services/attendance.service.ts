import api from './api';
import { ApiResponse } from '../types';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'ON_LEAVE' | 'WEEKEND';
  workingHours: number;
  remarks?: string | null;
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
}

export interface AttendanceSummary {
  month: number;
  year: number;
  totalRecords: number;
  present: number;
  absent: number;
  halfDay: number;
  onLeave: number;
  totalWorkingHours: number;
}

export const attendanceService = {
  checkIn: async (data?: { remarks?: string; date?: string }): Promise<ApiResponse<AttendanceRecord>> => {
    const res = await api.post<ApiResponse<AttendanceRecord>>('/attendance/check-in', data || {});
    return res.data;
  },

  checkOut: async (data?: { remarks?: string }): Promise<ApiResponse<AttendanceRecord>> => {
    const res = await api.post<ApiResponse<AttendanceRecord>>('/attendance/check-out', data || {});
    return res.data;
  },

  getMy: async (params?: { page?: number; limit?: number; startDate?: string; endDate?: string }): Promise<ApiResponse<AttendanceRecord[]>> => {
    const res = await api.get<ApiResponse<AttendanceRecord[]>>('/attendance/my', { params });
    return res.data;
  },

  getAll: async (params?: { page?: number; limit?: number; startDate?: string; endDate?: string; departmentId?: string; status?: string }): Promise<ApiResponse<AttendanceRecord[]>> => {
    const res = await api.get<ApiResponse<AttendanceRecord[]>>('/attendance', { params });
    return res.data;
  },

  getSummary: async (params?: { month?: number; year?: number; employeeId?: string }): Promise<ApiResponse<AttendanceSummary>> => {
    const res = await api.get<ApiResponse<AttendanceSummary>>('/attendance/summary', { params });
    return res.data;
  },
};
