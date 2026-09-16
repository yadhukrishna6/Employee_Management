"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
class AppError extends Error {
    statusCode;
    errors;
    constructor(message, statusCode = 400, errors = []) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    logger_1.logger.error(`${req.method} ${req.originalUrl} - Error:`, err);
    if (err instanceof AppError) {
        return (0, response_1.sendError)(res, err.message, err.statusCode, err.errors);
    }
    if (err.code === 'P2002') {
        const target = err.meta?.target?.join(', ') || 'field';
        return (0, response_1.sendError)(res, `A record with this ${target} already exists.`, 409);
    }
    if (err.code === 'P2003') {
        return (0, response_1.sendError)(res, 'Related record not found.', 400);
    }
    if (err.code === 'P2025') {
        return (0, response_1.sendError)(res, 'Requested record not found.', 404);
    }
    return (0, response_1.sendError)(res, process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message || 'Internal server error', 500);
};
exports.errorHandler = errorHandler;
