"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveService = exports.LeaveService = void 0;
const database_1 = require("../../config/database");
const error_middleware_1 = require("../../middleware/error.middleware");
const client_1 = require("@prisma/client");
class LeaveService {
    calculateWorkingDays(startDate, endDate) {
        let count = 0;
        const cur = new Date(startDate);
        while (cur <= endDate) {
            const dayOfWeek = cur.getUTCDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                count++;
            }
            cur.setUTCDate(cur.getUTCDate() + 1);
        }
        return Math.max(1, count);
    }
    async createLeaveType(input, organizationId) {
        const code = input.code.toUpperCase();
        const existing = await database_1.prisma.leaveType.findUnique({
            where: {
                organizationId_code: {
                    organizationId,
                    code,
                },
            },
        });
        if (existing) {
            throw new error_middleware_1.AppError('A leave type with this code already exists.', 409);
        }
        return database_1.prisma.leaveType.create({
            data: {
                organizationId,
                name: input.name,
                code,
                description: input.description,
                annualLimit: input.annualLimit,
                status: input.status,
            },
        });
    }
    async getLeaveTypes(organizationId) {
        return database_1.prisma.leaveType.findMany({
            where: { organizationId, status: 'ACTIVE' },
            orderBy: { name: 'asc' },
        });
    }
    async applyLeave(employeeId, organizationId, input) {
        const start = new Date(input.startDate);
        const end = new Date(input.endDate);
        start.setUTCHours(0, 0, 0, 0);
        end.setUTCHours(0, 0, 0, 0);
        if (start > end) {
            throw new error_middleware_1.AppError('Start date cannot be after end date.', 400);
        }
        const numberOfDays = this.calculateWorkingDays(start, end);
        const currentYear = start.getFullYear();
        const overlapping = await database_1.prisma.leaveRequest.findFirst({
            where: {
                employeeId,
                status: { in: [client_1.LeaveRequestStatus.PENDING, client_1.LeaveRequestStatus.APPROVED] },
                OR: [
                    {
                        startDate: { lte: end },
                        endDate: { gte: start },
                    },
                ],
            },
        });
        if (overlapping) {
            throw new error_middleware_1.AppError('You already have an active or pending leave request overlapping with these dates.', 400);
        }
        const leaveType = await database_1.prisma.leaveType.findFirst({
            where: { id: input.leaveTypeId, organizationId },
        });
        if (!leaveType) {
            throw new error_middleware_1.AppError('Invalid leave type.', 404);
        }
        if (leaveType.code !== 'UNPAID') {
            let balance = await database_1.prisma.leaveBalance.findUnique({
                where: {
                    employeeId_leaveTypeId_year: {
                        employeeId,
                        leaveTypeId: leaveType.id,
                        year: currentYear,
                    },
                },
            });
            if (!balance) {
                balance = await database_1.prisma.leaveBalance.create({
                    data: {
                        organizationId,
                        employeeId,
                        leaveTypeId: leaveType.id,
                        year: currentYear,
                        allocated: leaveType.annualLimit,
                        used: 0,
                        remaining: leaveType.annualLimit,
                    },
                });
            }
            if (balance.remaining < numberOfDays) {
                throw new error_middleware_1.AppError(`Insufficient leave balance. You have ${balance.remaining} day(s) remaining for ${leaveType.name}, but requested ${numberOfDays} day(s).`, 400);
            }
        }
        const leaveRequest = await database_1.prisma.leaveRequest.create({
            data: {
                organizationId,
                employeeId,
                leaveTypeId: leaveType.id,
                startDate: start,
                endDate: end,
                numberOfDays,
                reason: input.reason,
                status: client_1.LeaveRequestStatus.PENDING,
            },
            include: {
                leaveType: true,
                employee: {
                    select: { firstName: true, lastName: true, employeeCode: true, managerId: true },
                },
            },
        });
        return leaveRequest;
    }
    async approveLeave(id, organizationId, approverUserId) {
        const leave = await database_1.prisma.leaveRequest.findFirst({
            where: { id, organizationId },
            include: {
                leaveType: true,
                employee: { include: { user: true } },
            },
        });
        if (!leave) {
            throw new error_middleware_1.AppError('Leave request not found.', 404);
        }
        if (leave.status !== client_1.LeaveRequestStatus.PENDING) {
            throw new error_middleware_1.AppError(`Cannot approve a leave request with status ${leave.status}.`, 400);
        }
        const year = new Date(leave.startDate).getFullYear();
        const result = await database_1.prisma.$transaction(async (tx) => {
            if (leave.leaveType.code !== 'UNPAID') {
                const balance = await tx.leaveBalance.findUnique({
                    where: {
                        employeeId_leaveTypeId_year: {
                            employeeId: leave.employeeId,
                            leaveTypeId: leave.leaveTypeId,
                            year,
                        },
                    },
                });
                if (balance && balance.remaining < leave.numberOfDays) {
                    throw new error_middleware_1.AppError('Employee has insufficient remaining leave balance to approve this request.', 400);
                }
                if (balance) {
                    await tx.leaveBalance.update({
                        where: { id: balance.id },
                        data: {
                            used: { increment: leave.numberOfDays },
                            remaining: { decrement: leave.numberOfDays },
                        },
                    });
                }
            }
            const updated = await tx.leaveRequest.update({
                where: { id },
                data: {
                    status: client_1.LeaveRequestStatus.APPROVED,
                    approvedBy: approverUserId,
                    approvedAt: new Date(),
                },
                include: { leaveType: true, employee: true },
            });
            if (leave.employee.user) {
                await tx.notification.create({
                    data: {
                        organizationId,
                        userId: leave.employee.user.id,
                        title: 'Leave Request Approved',
                        message: `Your ${leave.leaveType.name} request from ${leave.startDate.toISOString().split('T')[0]} to ${leave.endDate.toISOString().split('T')[0]} has been approved.`,
                        type: 'LEAVE',
                    },
                });
            }
            await tx.auditLog.create({
                data: {
                    organizationId,
                    userId: approverUserId,
                    action: 'APPROVE_LEAVE',
                    entity: 'LeaveRequest',
                    entityId: id,
                    newValue: { status: 'APPROVED', approvedBy: approverUserId },
                },
            });
            return updated;
        });
        return result;
    }
    async rejectLeave(id, organizationId, input, rejecterUserId) {
        const leave = await database_1.prisma.leaveRequest.findFirst({
            where: { id, organizationId },
            include: { leaveType: true, employee: { include: { user: true } } },
        });
        if (!leave) {
            throw new error_middleware_1.AppError('Leave request not found.', 404);
        }
        if (leave.status !== client_1.LeaveRequestStatus.PENDING) {
            throw new error_middleware_1.AppError(`Cannot reject a leave request with status ${leave.status}.`, 400);
        }
        const updated = await database_1.prisma.leaveRequest.update({
            where: { id },
            data: {
                status: client_1.LeaveRequestStatus.REJECTED,
                approvedBy: rejecterUserId,
                approvedAt: new Date(),
                rejectionReason: input.rejectionReason,
            },
            include: { leaveType: true, employee: true },
        });
        if (leave.employee.user) {
            await database_1.prisma.notification.create({
                data: {
                    organizationId,
                    userId: leave.employee.user.id,
                    title: 'Leave Request Rejected',
                    message: `Your ${leave.leaveType.name} request was rejected. Reason: ${input.rejectionReason}`,
                    type: 'LEAVE',
                },
            });
        }
        await database_1.prisma.auditLog.create({
            data: {
                organizationId,
                userId: rejecterUserId,
                action: 'REJECT_LEAVE',
                entity: 'LeaveRequest',
                entityId: id,
                newValue: { status: 'REJECTED', reason: input.rejectionReason },
            },
        });
        return updated;
    }
    async cancelLeave(id, employeeId, organizationId) {
        const leave = await database_1.prisma.leaveRequest.findFirst({
            where: { id, employeeId, organizationId },
            include: { leaveType: true },
        });
        if (!leave) {
            throw new error_middleware_1.AppError('Leave request not found.', 404);
        }
        if (leave.status === client_1.LeaveRequestStatus.CANCELLED || leave.status === client_1.LeaveRequestStatus.REJECTED) {
            throw new error_middleware_1.AppError(`Leave request is already ${leave.status.toLowerCase()}.`, 400);
        }
        const year = new Date(leave.startDate).getFullYear();
        await database_1.prisma.$transaction(async (tx) => {
            if (leave.status === client_1.LeaveRequestStatus.APPROVED && leave.leaveType.code !== 'UNPAID') {
                const balance = await tx.leaveBalance.findUnique({
                    where: {
                        employeeId_leaveTypeId_year: {
                            employeeId: leave.employeeId,
                            leaveTypeId: leave.leaveTypeId,
                            year,
                        },
                    },
                });
                if (balance) {
                    await tx.leaveBalance.update({
                        where: { id: balance.id },
                        data: {
                            used: { decrement: leave.numberOfDays },
                            remaining: { increment: leave.numberOfDays },
                        },
                    });
                }
            }
            await tx.leaveRequest.update({
                where: { id },
                data: { status: client_1.LeaveRequestStatus.CANCELLED },
            });
        });
    }
    async getLeaveBalances(employeeId, organizationId, year) {
        const targetYear = year || new Date().getFullYear();
        return database_1.prisma.leaveBalance.findMany({
            where: {
                employeeId,
                organizationId,
                year: targetYear,
            },
            include: {
                leaveType: true,
            },
        });
    }
    async getAllLeaveRequests(organizationId, query) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
        const skip = (page - 1) * limit;
        const where = {
            organizationId,
        };
        if (query.status)
            where.status = query.status;
        if (query.employeeId)
            where.employeeId = query.employeeId;
        if (query.leaveTypeId)
            where.leaveTypeId = query.leaveTypeId;
        const [total, data] = await Promise.all([
            database_1.prisma.leaveRequest.count({ where }),
            database_1.prisma.leaveRequest.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    leaveType: true,
                    employee: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            employeeCode: true,
                            designation: true,
                            department: { select: { name: true } },
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
exports.LeaveService = LeaveService;
exports.leaveService = new LeaveService();
