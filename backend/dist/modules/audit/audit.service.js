"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditService = exports.AuditService = void 0;
const database_1 = require("../../config/database");
class AuditService {
    async getLogs(organizationId, isSuperAdmin, query) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
        const skip = (page - 1) * limit;
        const where = {};
        if (!isSuperAdmin || organizationId) {
            where.organizationId = organizationId;
        }
        if (query.entity)
            where.entity = query.entity;
        if (query.action)
            where.action = query.action;
        if (query.userId)
            where.userId = query.userId;
        if (query.startDate || query.endDate) {
            where.createdAt = {};
            if (query.startDate)
                where.createdAt.gte = new Date(query.startDate);
            if (query.endDate)
                where.createdAt.lte = new Date(query.endDate);
        }
        const [total, data] = await Promise.all([
            database_1.prisma.auditLog.count({ where }),
            database_1.prisma.auditLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            role: true,
                            employee: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    employeeCode: true,
                                },
                            },
                        },
                    },
                },
            }),
        ]);
        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
exports.AuditService = AuditService;
exports.auditService = new AuditService();
