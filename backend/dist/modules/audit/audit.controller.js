"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditController = exports.AuditController = void 0;
const audit_service_1 = require("./audit.service");
const response_1 = require("../../utils/response");
class AuditController {
    async getLogs(req, res, next) {
        try {
            const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
            const result = await audit_service_1.auditService.getLogs(req.user.organizationId, isSuperAdmin, {
                page: Number(req.query.page),
                limit: Number(req.query.limit),
                entity: req.query.entity,
                action: req.query.action,
                userId: req.query.userId,
                startDate: req.query.startDate,
                endDate: req.query.endDate,
            });
            return (0, response_1.sendSuccess)(res, 'Audit logs retrieved', result.data, 200, result.pagination);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuditController = AuditController;
exports.auditController = new AuditController();
