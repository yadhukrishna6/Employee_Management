import api from './api';
import { ApiResponse } from '../types';

export interface SalaryStructure {
  id: string;
  employeeId: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  status: string;
}

export interface Payslip {
  id: string;
  employeeId: string;
  salaryId: string;
  month: number;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  generatedAt: string;
  employee?: {
    firstName: string;
    lastName: string;
    email?: string;
    profileImage?: string | null;
    employeeCode: string;
    designation: string;
    department?: { name: string };
  };
}

export const payrollService = {
  getSalary: async (employeeId?: string): Promise<ApiResponse<SalaryStructure>> => {
    const url = employeeId ? `/payroll/salary/${employeeId}` : '/payroll/my-salary';
    const res = await api.get<ApiResponse<SalaryStructure>>(url);
    return res.data;
  },

  setSalary: async (data: {
    employeeId: string;
    basicSalary: number;
    allowances: number;
    deductions: number;
    effectiveFrom: string;
  }): Promise<ApiResponse<SalaryStructure>> => {
    const res = await api.post<ApiResponse<SalaryStructure>>('/payroll/salary', data);
    return res.data;
  },

  generatePayslip: async (data: { employeeId: string; month: number; year: number }): Promise<ApiResponse<Payslip>> => {
    const res = await api.post<ApiResponse<Payslip>>('/payroll/payslips/generate', data);
    return res.data;
  },

  generateBulkPayslips: async (data: { month: number; year: number }): Promise<ApiResponse<{ totalGenerated: number }>> => {
    const res = await api.post<ApiResponse<{ totalGenerated: number }>>('/payroll/payslips/bulk-generate', data);
    return res.data;
  },

  getPayslips: async (params?: { page?: number; limit?: number; employeeId?: string; month?: number; year?: number }): Promise<ApiResponse<Payslip[]>> => {
    const res = await api.get<ApiResponse<Payslip[]>>('/payroll/payslips', { params });
    return res.data;
  },

  getMyPayslips: async (): Promise<ApiResponse<Payslip[]>> => {
    const res = await api.get<ApiResponse<Payslip[]>>('/payroll/my-payslips');
    return res.data;
  },

  getPayslipById: async (id: string): Promise<ApiResponse<Payslip>> => {
    const res = await api.get<ApiResponse<Payslip>>(`/payroll/payslips/${id}`);
    return res.data;
  },
};
