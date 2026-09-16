import { z } from 'zod';

// Schema for registering a new Organization + Initial Admin User
export const registerSchema = z.object({
  body: z.object({
    // Organization fields
    organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
    organizationCode: z
      .string()
      .min(2, 'Organization code must be at least 2 characters')
      .max(20, 'Organization code must not exceed 20 characters')
      .regex(/^[A-Z0-9_-]+$/i, 'Organization code can only contain letters, numbers, hyphens, and underscores'),
    organizationEmail: z.string().email('Invalid organization email address'),
    phone: z.string().optional(),
    website: z.string().url('Invalid website URL').optional().or(z.literal('')),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),

    // Admin user fields
    adminEmail: z.string().email('Invalid admin email address'),
    adminPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    adminFirstName: z.string().min(1, 'First name is required'),
    adminLastName: z.string().min(1, 'Last name is required'),
  }),
});

// Schema for User Login
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
    organizationCode: z.string().optional(), // Optional for Super Admins, required for tenant users if email is shared across orgs
  }),
});

// Schema for Refreshing JWT Token
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

// Schema for Changing Password
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
  }),
});

// TypeScript Types automatically derived from Zod schemas
export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
