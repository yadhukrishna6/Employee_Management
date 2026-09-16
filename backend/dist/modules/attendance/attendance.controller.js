"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendanceController = exports.AttendanceController = void 0;
const attendance_service_1 = require("./attendance.service");
const response_1 = require("../../utils/response");
const error_middleware_1 = require("../../middleware/error.middleware");
class AttendanceController {
    async checkIn(req, res, next) {
        try {
            if (!req.user.employeeId) {
                throw new error_middleware_1.AppError('Only linked employees can perform attendance check-in.', 400);
            }
            const attendance = await attendance_service_1.attendanceService.checkIn(req.user.employeeId, req.user.organizationId, req.body);
            return (0, response_1.sendSuccess)(res, 'Checked in successfully', attendance, 200);
        }
        catch (error) {
            next(error);
        }
    }
    async checkOut(req, res, next) {
        try {
            if (!req.user.employeeId) {
                throw new error_middleware_1.AppError('Only linked employees can perform attendance check-out.', 400);
            }
            const attendance = await attendance_service_1.attendanceService.checkOut(req.user.employeeId, req.body);
            return (0, response_1.sendSuccess)(res, 'Checked out successfully', attendance, 200);
        }
        catch (error) {
            next(error);
        }
    }
    async getMy(req, res, next) {
        try {
            if (!req.user.employeeId) {
                throw new error_middleware_1.AppError('No employee profile linked to your account.', 400);
            }
            const result = await attendance_service_1.attendanceService.getMyAttendance(req.user.employeeId, {
                page: Number(req.query.page),
                limit: Number(req.query.limit),
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                status: req.query.status,
            });
            return (0, response_1.sendSuccess)(res, 'Attendance history retrieved', result.data, 200, result.pagination);
        }
        catch (error) {
            next(error);
        }
    }
    async getAll(req, res, next) {
        try {
            if (!req.user.organizationId) {
                throw new error_middleware_1.AppError('Organization context required', 400);
            }
            const result = await attendance_service_1.attendanceService.getAllAttendance(req.user.organizationId, {
                page: Number(req.query.page),
                limit: Number(req.query.limit),
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                status: req.query.status,
                employeeId: req.query.employeeId,
                departmentId: req.query.departmentId,
            });
            return (0, response_1.sendSuccess)(res, 'Attendance records retrieved', result.data, 200, result.pagination);
        }
        catch (error) {
            next(error);
        }
    }
    async getByEmployee(req, res, next) {
        try {
            const result = await attendance_service_1.attendanceService.getMyAttendance(req.params.employeeId, {
                page: Number(req.query.page),
                limit: Number(req.query.limit),
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                status: req.query.status,
            });
            return (0, response_1.sendSuccess)(res, 'Employee attendance retrieved', result.data, 200, result.pagination);
        }
        catch (error) {
            next(error);
        }
    }
    async getSummary(req, res, next) {
        try {
            if (!req.user.organizationId) {
                throw new error_middleware_1.AppError('Organization context required', 400);
            }
            const targetEmployeeId = req.user.role === 'EMPLOYEE'
                ? req.user.employeeId || undefined
                : req.query.employeeId || undefined;
            const summary = await attendance_service_1.attendanceService.getMonthlySummary(req.user.organizationId, {
                month: req.query.month ? Number(req.query.month) : undefined,
                year: req.query.year ? Number(req.query.year) : undefined,
                employeeId: targetEmployeeId,
            });
            return (0, response_1.sendSuccess)(res, 'Attendance summary retrieved', summary, 200);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AttendanceController = AttendanceController;
exports.attendanceController = new AttendanceController();
