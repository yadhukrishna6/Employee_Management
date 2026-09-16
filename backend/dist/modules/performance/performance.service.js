"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceService = exports.PerformanceService = void 0;
const database_1 = require("../../config/database");
const error_middleware_1 = require("../../middleware/error.middleware");
class PerformanceService {
    calculateOverall(tech, comm, team, prob) {
        return Math.round(((tech + comm + team + prob) / 4) * 10) / 10;
    }
    async createReview(input, reviewerId, organizationId, currentUserId) {
        const employee = await database_1.prisma.employee.findFirst({
            where: { id: input.employeeId, organizationId },
            include: { user: true },
        });
        if (!employee) {
            throw new error_middleware_1.AppError('Employee not found.', 404);
        }
        const overallRating = this.calculateOverall(input.technicalSkill, input.communication, input.teamwork, input.problemSolving);
        const review = await database_1.prisma.performanceReview.create({
            data: {
                organizationId,
                employeeId: input.employeeId,
                reviewerId,
                reviewPeriod: input.reviewPeriod,
                technicalSkill: input.technicalSkill,
                communication: input.communication,
                teamwork: input.teamwork,
                problemSolving: input.problemSolving,
                overallRating,
                comments: input.comments,
                status: input.status,
            },
            include: {
                employee: { select: { firstName: true, lastName: true, employeeCode: true } },
                reviewer: { select: { firstName: true, lastName: true, designation: true } },
            },
        });
        if (employee.user && input.status === 'SUBMITTED') {
            await database_1.prisma.notification.create({
                data: {
                    organizationId,
                    userId: employee.user.id,
                    title: 'Performance Review Submitted',
                    message: `Your performance review for ${input.reviewPeriod} has been submitted with a rating of ${overallRating}/5.`,
                    type: 'INFO',
                },
            });
        }
        await database_1.prisma.auditLog.create({
            data: {
                organizationId,
                userId: currentUserId,
                action: 'CREATE_PERFORMANCE_REVIEW',
                entity: 'PerformanceReview',
                entityId: review.id,
                newValue: { employeeId: input.employeeId, overallRating, period: input.reviewPeriod },
            },
        });
        return review;
    }
    async updateReview(id, input, organizationId, currentUserId) {
        const existing = await database_1.prisma.performanceReview.findFirst({
            where: { id, organizationId },
        });
        if (!existing) {
            throw new error_middleware_1.AppError('Performance review not found.', 404);
        }
        const tech = input.technicalSkill ?? existing.technicalSkill;
        const comm = input.communication ?? existing.communication;
        const team = input.teamwork ?? existing.teamwork;
        const prob = input.problemSolving ?? existing.problemSolving;
        const overallRating = this.calculateOverall(tech, comm, team, prob);
        const updated = await database_1.prisma.performanceReview.update({
            where: { id },
            data: {
                ...input,
                overallRating,
            },
            include: {
                employee: { select: { firstName: true, lastName: true } },
                reviewer: { select: { firstName: true, lastName: true } },
            },
        });
        await database_1.prisma.auditLog.create({
            data: {
                organizationId,
                userId: currentUserId,
                action: 'UPDATE_PERFORMANCE_REVIEW',
                entity: 'PerformanceReview',
                entityId: id,
                newValue: { overallRating },
            },
        });
        return updated;
    }
    async getReviews(organizationId, query) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
        const skip = (page - 1) * limit;
        const where = {
            organizationId,
        };
        if (query.employeeId)
            where.employeeId = query.employeeId;
        if (query.reviewerId)
            where.reviewerId = query.reviewerId;
        if (query.reviewPeriod)
            where.reviewPeriod = query.reviewPeriod;
        const [total, data] = await Promise.all([
            database_1.prisma.performanceReview.count({ where }),
            database_1.prisma.performanceReview.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    employee: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            profileImage: true,
                            employeeCode: true,
                            designation: true,
                            department: { select: { name: true } },
                        },
                    },
                    reviewer: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            employeeCode: true,
                            designation: true,
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
    async getReviewById(id, organizationId) {
        const review = await database_1.prisma.performanceReview.findFirst({
            where: { id, organizationId },
            include: {
                employee: {
                    include: {
                        department: true,
                    },
                },
                reviewer: true,
            },
        });
        if (!review) {
            throw new error_middleware_1.AppError('Performance review not found.', 404);
        }
        return review;
    }
}
exports.PerformanceService = PerformanceService;
exports.performanceService = new PerformanceService();
