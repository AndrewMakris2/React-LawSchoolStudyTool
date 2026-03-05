"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.createError = createError;
function errorHandler(err, _req, res, _next) {
    const status = err.statusCode ?? 500;
    const message = err.message ?? "Internal server error";
    console.error(`[ERROR ${status}]`, message);
    res.status(status).json({ error: message });
}
function createError(message, statusCode = 500) {
    const err = new Error(message);
    err.statusCode = statusCode;
    return err;
}
