"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationService = exports.OrganizationService = void 0;
const database_1 = require("../../config/database");
const error_middleware_1 = require("../../middleware/error.middleware");
class OrganizationService {
    async createOrganization(input, adminUserId) {
        const existing = await database_1.prisma.organization.findUnique({
            where: { code: input.code.toUpperCase() },
        });
        if (existing) {
            throw new error_middleware_1.AppError('An organization with this code already exists.', 409);
        }
        const org = await database_1.prisma.organization.create({
            data: {
                ...input,
                code: input.code.toUpperCase(),
            },
        });
        await database_1.prisma.leaveType.createMany({
            data: [
                { organizationId: org.id, name: 'Casual Leave', code: 'CASUAL', annualLimit: 12 },
                { organizationId: org.id, name: 'Sick Leave', code: 'SICK', annualLimit: 10 },
                { organizationId: org.id, name: 'Annual Leave', code: 'ANNUAL', annualLimit: 15 },
                { organizationId: org.id, name: 'Unpaid Leave', code: 'UNPAID', annualLimit: 0 },
            ],
        });
        await database_1.prisma.auditLog.create({
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
    async getAllOrganizations(query) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
        const skip = (page - 1) * limit;
        const where = {};
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
            database_1.prisma.organization.count({ where }),
            database_1.prisma.organization.findMany({
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
    async getOrganizationById(id) {
        const organization = await database_1.prisma.organization.findUnique({
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
            throw new error_middleware_1.AppError('Organization not found.', 404);
        }
        return organization;
    }
    async updateOrganization(id, input, userId) {
        const org = await database_1.prisma.organization.findUnique({ where: { id } });
        if (!org) {
            throw new error_middleware_1.AppError('Organization not found.', 404);
        }
        const updated = await database_1.prisma.organization.update({
            where: { id },
            data: input,
        });
        await database_1.prisma.auditLog.create({
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
    async updateStatus(id, input, userId) {
        const org = await database_1.prisma.organization.findUnique({ where: { id } });
        if (!org) {
            throw new error_middleware_1.AppError('Organization not found.', 404);
        }
        const updated = await database_1.prisma.organization.update({
            where: { id },
            data: { status: input.status },
        });
        await database_1.prisma.auditLog.create({
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
exports.OrganizationService = OrganizationService;
exports.organizationService = new OrganizationService();
