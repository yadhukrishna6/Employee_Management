import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import {
  CreateOrganizationInput,
  UpdateOrganizationInput,
  UpdateOrgStatusInput,
} from './organization.schema';
import { OrganizationStatus, Prisma } from '@prisma/client';

export class OrganizationService {
  async createOrganization(input: CreateOrganizationInput, adminUserId: string) {
    const existing = await prisma.organization.findUnique({
      where: { code: input.code.toUpperCase() },
    });

    if (existing) {
      throw new AppError('An organization with this code already exists.', 409);
    }

    const org = await prisma.organization.create({
      data: {
        name: input.name,
        code: input.code.toUpperCase(),
        email: input.email,
        phone: input.phone,
        website: input.website,
        address: input.address,
        city: input.city,
        state: input.state,
        country: input.country,
        status: input.status,
      },
    });

    // Create default leave types for the organization
    await prisma.leaveType.createMany({
      data: [
        { organizationId: org.id, name: 'Casual Leave', code: 'CASUAL', annualLimit: 12 },
        { organizationId: org.id, name: 'Sick Leave', code: 'SICK', annualLimit: 10 },
        { organizationId: org.id, name: 'Annual Leave', code: 'ANNUAL', annualLimit: 15 },
        { organizationId: org.id, name: 'Unpaid Leave', code: 'UNPAID', annualLimit: 0 },
      ],
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        organizationId: org.id,
        userId: adminUserId,
        action: 'CREATE_ORGANIZATION',
        entity: 'Organization',
        entityId: org.id,
        newValue: { name: org.name, code: org.code },
      },
    });

    return org;
  }

  async getAllOrganizations(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: OrganizationStatus;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.OrganizationWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, organizations] = await Promise.all([
      prisma.organization.count({ where }),
      prisma.organization.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              employees: true,
              departments: true,
              users: true,
            },
          },
        },
      }),
    ]);

    return {
      organizations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOrganizationById(id: string) {
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            employees: true,
            departments: true,
            users: true,
          },
        },
      },
    });

    if (!organization) {
      throw new AppError('Organization not found.', 404);
    }

    return organization;
  }

  async updateOrganization(
    id: string,
    input: UpdateOrganizationInput,
    userId: string
  ) {
    const org = await prisma.organization.findUnique({ where: { id } });
    if (!org) {
      throw new AppError('Organization not found.', 404);
    }

    const updated = await prisma.organization.update({
      where: { id },
      data: input,
    });

    await prisma.auditLog.create({
      data: {
        organizationId: id,
        userId,
        action: 'UPDATE_ORGANIZATION',
        entity: 'Organization',
        entityId: id,
        oldValue: { name: org.name, email: org.email, status: org.status },
        newValue: input,
      },
    });

    return updated;
  }

  async updateStatus(id: string, input: UpdateOrgStatusInput, userId: string) {
    const org = await prisma.organization.findUnique({ where: { id } });
    if (!org) {
      throw new AppError('Organization not found.', 404);
    }

    const updated = await prisma.organization.update({
      where: { id },
      data: { status: input.status },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: id,
        userId,
        action: 'UPDATE_ORGANIZATION_STATUS',
        entity: 'Organization',
        entityId: id,
        oldValue: { status: org.status },
        newValue: { status: input.status },
      },
    });

    return updated;
  }
}

export const organizationService = new OrganizationService();
