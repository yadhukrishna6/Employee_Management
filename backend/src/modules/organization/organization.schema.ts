import { z } from 'zod';
import { OrganizationStatus } from '@prisma/client';

export const createOrganizationSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Organization name must be at least 2 characters'),
    code: z
      .string()
      .min(2, 'Organization code must be at least 2 characters')
      .max(20, 'Organization code must not exceed 20 characters')
      .regex(/^[A-Z0-9_-]+$/i, 'Organization code can only contain alphanumeric characters, hyphens and underscores'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    website: z.string().url('Invalid website URL').optional().or(z.literal('')),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    status: z.nativeEnum(OrganizationStatus).optional(),
  }),
});

export const updateOrganizationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid organization ID format'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    website: z.string().url().optional().or(z.literal('')),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    status: z.nativeEnum(OrganizationStatus).optional(),
  }),
});

export const updateOrgStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid organization ID format'),
  }),
  body: z.object({
    status: z.nativeEnum(OrganizationStatus),
  }),
});

export const getOrgParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid organization ID format'),
  }),
});

export const listOrganizationsSchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    search: z.string().optional(),
    status: z.nativeEnum(OrganizationStatus).optional(),
  }),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>['body'];
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>['body'];
export type UpdateOrgStatusInput = z.infer<typeof updateOrgStatusSchema>['body'];
