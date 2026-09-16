"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, message, data, statusCode = 200, pagination) => {
    const body = {
        success: true,
        message,
        data,
        ...(pagination && { pagination }),
    };
    return res.status(statusCode).json(body);
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message, statusCode = 400, errors = []) => {
    const body = {
        success: false,
        message,
        errors,
    };
    return res.status(statusCode).json(body);
};
exports.sendError = sendError;
