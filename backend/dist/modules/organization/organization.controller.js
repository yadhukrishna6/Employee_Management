"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationController = exports.OrganizationController = void 0;
const organization_service_1 = require("./organization.service");
const response_1 = require("../../utils/response");
const error_middleware_1 = require("../../middleware/error.middleware");
class OrganizationController {
    async create(req, res, next) {
        try {
            const org = await organization_service_1.organizationService.createOrganization(req.body, req.user.userId);
            return (0, response_1.sendSuccess)(res, 'Organization created successfully', org, 201);
        }
        catch (error) {
            next(error);
        }
    }
    async getAll(req, res, next) {
        try {
            const result = await organization_service_1.organizationService.getAllOrganizations({
                page: Number(req.query.page),
                limit: Number(req.query.limit),
                search: req.query.search,
                status: req.query.status,
            });
            return (0, response_1.sendSuccess)(res, 'Organizations retrieved successfully', result.organizations, 200, result.pagination);
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            if (req.user.role !== 'SUPER_ADMIN' && req.user.organizationId !== id) {
                throw new error_middleware_1.AppError('Forbidden. You do not have permission to view this organization.', 403);
            }
            const org = await organization_service_1.organizationService.getOrganizationById(id);
            return (0, response_1.sendSuccess)(res, 'Organization retrieved successfully', org, 200);
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const { id } = req.params;
            if (req.user.role !== 'SUPER_ADMIN' && req.user.organizationId !== id) {
                throw new error_middleware_1.AppError('Forbidden. You do not have permission to modify this organization.', 403);
            }
            const updated = await organization_service_1.organizationService.updateOrganization(id, req.body, req.user.userId);
            return (0, response_1.sendSuccess)(res, 'Organization updated successfully', updated, 200);
        }
        catch (error) {
            next(error);
        }
    }
    async updateStatus(req, res, next) {
        try {
            const { id } = req.params;
            const updated = await organization_service_1.organizationService.updateStatus(id, req.body, req.user.userId);
            return (0, response_1.sendSuccess)(res, 'Organization status updated successfully', updated, 200);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.OrganizationController = OrganizationController;
exports.organizationController = new OrganizationController();
