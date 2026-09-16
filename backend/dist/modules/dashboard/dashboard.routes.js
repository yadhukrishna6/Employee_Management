"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRouter = void 0;
const express_1 = require("express");
const dashboard_controller_1 = require("./dashboard.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
exports.dashboardRouter = (0, express_1.Router)();
exports.dashboardRouter.use(auth_middleware_1.authenticate);
exports.dashboardRouter.get('/', dashboard_controller_1.dashboardController.getDashboard);
