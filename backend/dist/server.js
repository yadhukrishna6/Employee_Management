"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const logger_1 = require("./utils/logger");
const app = (0, app_1.createApp)();
const startServer = async () => {
    try {
        await database_1.prisma.$connect();
        logger_1.logger.info('🐘 Database connected successfully via Prisma');
        const server = app.listen(env_1.env.PORT, () => {
            logger_1.logger.info(`🚀 Server running in ${env_1.env.NODE_ENV} mode on port ${env_1.env.PORT}`);
        });
        const shutdown = async (signal) => {
            logger_1.logger.info(`${signal} signal received. Closing HTTP server and database pool...`);
            server.close(async () => {
                await database_1.prisma.$disconnect();
                logger_1.logger.info('HTTP server and Database connection closed.');
                process.exit(0);
            });
        };
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }
    catch (err) {
        logger_1.logger.error('Failed to start server:', err);
        await database_1.prisma.$disconnect();
        process.exit(1);
    }
};
startServer();
