"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const errorHandler_1 = require("./middlewares/errorHandler");
const notFoundHandler_1 = require("./middlewares/notFoundHandler");
const rateLimiter_1 = require("./middlewares/rateLimiter");
const apiResponse_1 = require("./utils/apiResponse");
const bootstrapRoute = (_req, res) => {
    res.status(200).json((0, apiResponse_1.successResponse)({ status: 'ok' }));
};
const createApp = () => {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)());
    app.use(rateLimiter_1.rateLimiter);
    app.use(express_1.default.json());
    app.get('/', bootstrapRoute);
    app.use(notFoundHandler_1.notFoundHandler);
    app.use(errorHandler_1.errorHandler);
    return app;
};
exports.createApp = createApp;
