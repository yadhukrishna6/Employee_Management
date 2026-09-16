import api from './api';
import { User, ApiResponse } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
  organizationCode?: string;
}

export interface RegisterPayload {
  organizationName: string;
  organizationCode: string;
  organizationEmail: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  adminEmail: string;
  adminPassword: string;
  adminFirstName: string;
  adminLastName: string;
}

export interface AuthResponseData {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export const authService = {
  login: async (data: LoginPayload): Promise<ApiResponse<AuthResponseData>> => {
    const res = await api.post<ApiResponse<AuthResponseData>>('/auth/login', data);
    return res.data;
  },

  register: async (data: RegisterPayload): Promise<ApiResponse<AuthResponseData>> => {
    const res = await api.post<ApiResponse<AuthResponseData>>('/auth/register', data);
    return res.data;
  },

  getMe: async (): Promise<ApiResponse<{ user: User }>> => {
    const res = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return res.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<null>> => {
    const res = await api.post<ApiResponse<null>>('/auth/change-password', data);
    return res.data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },
};
