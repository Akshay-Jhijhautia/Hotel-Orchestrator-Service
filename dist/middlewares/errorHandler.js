"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const AppError_1 = require("../utils/AppError");
const logger_1 = require("../utils/logger");
const errorHandler = (error, _req, res, _next) => {
    void _next;
    if (error instanceof AppError_1.AppError) {
        res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
        return;
    }
    logger_1.logger.error('Unhandled application error', {
        message: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
        success: false,
        message: 'Internal server error',
    });
};
exports.errorHandler = errorHandler;
