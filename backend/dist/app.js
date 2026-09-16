"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const routes_1 = require("./routes");
const error_middleware_1 = require("./middleware/error.middleware");
const createApp = () => {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            if (env_1.env.CORS_ORIGIN === '*' || env_1.env.CORS_ORIGIN.split(',').map((o) => o.trim()).includes(origin)) {
                return callback(null, true);
            }
            if (origin.includes('localhost') || origin.endsWith('.vercel.app') || origin.endsWith('.render.com')) {
                return callback(null, true);
            }
            return callback(null, true);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }));
    if (env_1.env.NODE_ENV !== 'test') {
        app.use((0, morgan_1.default)(env_1.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
    }
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use('/api', routes_1.apiRouter);
    app.use('*', (req, res) => {
        res.status(404).json({
            success: false,
            message: `Route ${req.originalUrl} not found`,
        });
    });
    app.use(error_middleware_1.errorHandler);
    return app;
};
exports.createApp = createApp;
