export type UserRole =
  | 'SUPER_ADMIN'
  | 'ORGANIZATION_ADMIN'
  | 'HR'
  | 'MANAGER'
  | 'EMPLOYEE';

export interface User {
  id: string;
  organizationId: string | null;
  employeeId?: string | null;
  email: string;
  role: UserRole;
  status: string;
  organization?: Organization;
  employee?: Employee;
}

export interface Organization {
  id: string;
  name: string;
  code: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export interface Employee {
  id: string;
  organizationId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  designation: string;
  departmentId?: string;
  department?: Department;
  managerId?: string;
  manager?: Employee;
  joiningDate: string;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';
  status: 'ACTIVE' | 'INACTIVE' | 'ON_NOTICE' | 'TERMINATED';
}

export interface Department {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  description?: string;
  managerId?: string;
  manager?: Employee;
  status: string;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
