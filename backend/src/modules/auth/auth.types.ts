import { UserRole, OrganizationStatus, UserStatus } from '@prisma/client';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  organizationId: string | null;
  employeeId?: string | null;
  organization?: {
    id: string;
    name: string;
    code: string;
    status: OrganizationStatus;
  } | null;
  employee?: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    designation: string;
    profileImage?: string | null;
  } | null;
}

export interface LoginResponse {
  user: UserProfileResponse;
  tokens: AuthTokens;
}
