"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const response_1 = require("../utils/response");
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return (0, response_1.sendError)(res, 'Unauthorized access', 401);
        }
        if (!allowedRoles.includes(req.user.role)) {
            return (0, response_1.sendError)(res, `Access denied. Requires one of the following roles: [${allowedRoles.join(', ')}]`, 403);
        }
        next();
    };
};
exports.authorize = authorize;
