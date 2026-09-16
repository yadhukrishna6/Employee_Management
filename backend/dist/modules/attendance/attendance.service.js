"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendanceService = exports.AttendanceService = void 0;
const database_1 = require("../../config/database");
const error_middleware_1 = require("../../middleware/error.middleware");
const client_1 = require("@prisma/client");
class AttendanceService {
    getMidnightDate(dateStr) {
        const d = dateStr ? new Date(dateStr) : new Date();
        d.setUTCHours(0, 0, 0, 0);
        return d;
    }
    async checkIn(employeeId, organizationId, input) {
        const today = this.getMidnightDate(input.date);
        const now = new Date();
        const existing = await database_1.prisma.attendance.findUnique({
            where: {
                employeeId_date: {
                    employeeId,
                    date: today,
                },
            },
        });
        if (existing && existing.checkIn) {
            throw new error_middleware_1.AppError('You have already checked in for this date.', 400);
        }
        const attendance = await database_1.prisma.attendance.upsert({
            where: {
                employeeId_date: {
                    employeeId,
                    date: today,
                },
            },
            update: {
                checkIn: now,
                status: client_1.AttendanceStatus.PRESENT,
                remarks: input.remarks || existing?.remarks,
            },
            create: {
                organizationId,
                employeeId,
                date: today,
                checkIn: now,
                status: client_1.AttendanceStatus.PRESENT,
                remarks: input.remarks,
            },
        });
        return attendance;
    }
    async checkOut(employeeId, input) {
        const today = this.getMidnightDate();
        const now = new Date();
        const existing = await database_1.prisma.attendance.findUnique({
            where: {
                employeeId_date: {
                    employeeId,
                    date: today,
                },
            },
        });
        if (!existing || !existing.checkIn) {
            throw new error_middleware_1.AppError('No check-in record found for today. Please check in first.', 400);
        }
        if (existing.checkOut) {
            throw new error_middleware_1.AppError('You have already checked out for today.', 400);
        }
        const diffMs = now.getTime() - new Date(existing.checkIn).getTime();
        const workingHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
        let status = existing.status;
        if (workingHours < 4) {
            status = client_1.AttendanceStatus.HALF_DAY;
        }
        else {
            status = client_1.AttendanceStatus.PRESENT;
        }
        const updated = await database_1.prisma.attendance.update({
            where: { id: existing.id },
            data: {
                checkOut: now,
                workingHours,
                status,
                remarks: input.remarks ? `${existing.remarks ? existing.remarks + ' | ' : ''}${input.remarks}` : existing.remarks,
            },
        });
        return updated;
    }
    async getMyAttendance(employeeId, query) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
        const skip = (page - 1) * limit;
        const where = {
            employeeId,
        };
        if (query.status)
            where.status = query.status;
        if (query.startDate || query.endDate) {
            where.date = {};
            if (query.startDate)
                where.date.gte = this.getMidnightDate(query.startDate);
            if (query.endDate)
                where.date.lte = this.getMidnightDate(query.endDate);
        }
        const [total, data] = await Promise.all([
            database_1.prisma.attendance.count({ where }),
            database_1.prisma.attendance.findMany({
                where,
                skip,
                take: limit,
                orderBy: { date: 'desc' },
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
    async getAllAttendance(organizationId, query) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
        const skip = (page - 1) * limit;
        const where = {
            organizationId,
        };
        if (query.status)
            where.status = query.status;
        if (query.employeeId)
            where.employeeId = query.employeeId;
        if (query.departmentId) {
            where.employee = { departmentId: query.departmentId };
        }
        if (query.startDate || query.endDate) {
            where.date = {};
            if (query.startDate)
                where.date.gte = this.getMidnightDate(query.startDate);
            if (query.endDate)
                where.date.lte = this.getMidnightDate(query.endDate);
        }
        const [total, data] = await Promise.all([
            database_1.prisma.attendance.count({ where }),
            database_1.prisma.attendance.findMany({
                where,
                skip,
                take: limit,
                orderBy: { date: 'desc' },
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
                            department: {
                                select: { id: true, name: true, code: true },
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
    async getMonthlySummary(organizationId, params) {
        const now = new Date();
        const month = params.month || now.getMonth() + 1;
        const year = params.year || now.getFullYear();
        const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
        const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59));
        const where = {
            organizationId,
            date: {
                gte: startOfMonth,
                lte: endOfMonth,
            },
        };
        if (params.employeeId) {
            where.employeeId = params.employeeId;
        }
        const records = await database_1.prisma.attendance.findMany({
            where,
            select: {
                status: true,
                workingHours: true,
                date: true,
            },
        });
        const summary = {
            month,
            year,
            totalRecords: records.length,
            present: records.filter((r) => r.status === client_1.AttendanceStatus.PRESENT).length,
            absent: records.filter((r) => r.status === client_1.AttendanceStatus.ABSENT).length,
            halfDay: records.filter((r) => r.status === client_1.AttendanceStatus.HALF_DAY).length,
            onLeave: records.filter((r) => r.status === client_1.AttendanceStatus.ON_LEAVE).length,
            totalWorkingHours: Math.round(records.reduce((acc, r) => acc + r.workingHours, 0) * 10) / 10,
        };
        return summary;
    }
}
exports.AttendanceService = AttendanceService;
exports.attendanceService = new AttendanceService();
