import api from './api';
import { ApiResponse } from '../types';

export const dashboardService = {
  getDashboardData: async (): Promise<ApiResponse<any>> => {
    const res = await api.get<ApiResponse<any>>('/dashboard');
    return res.data;
  },
};
