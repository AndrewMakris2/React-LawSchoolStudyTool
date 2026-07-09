"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const crypto_1 = __importDefault(require("crypto"));
const errorHandler_1 = require("./errorHandler");
const DEV_USER_ID = "local-dev";
// Derives a stable, non-reversible per-user id from the caller's Groq API key.
// The key itself is never stored — only used to partition each user's data
// so visitors can't see or delete each other's readings, briefs, decks, etc.
function requireAuth(req, _res, next) {
    const headerKey = req.headers["x-groq-api-key"];
    if (headerKey) {
        req.apiKey = headerKey;
        req.userId = crypto_1.default.createHash("sha256").update(headerKey).digest("hex").slice(0, 24);
        return next();
    }
    // Convenience fallback for local development only — never in production,
    // so every visitor to the deployed site must supply their own key.
    if (process.env.NODE_ENV !== "production" && process.env.GROQ_API_KEY) {
        req.apiKey = process.env.GROQ_API_KEY;
        req.userId = DEV_USER_ID;
        return next();
    }
    next((0, errorHandler_1.createError)("No Groq API key provided. Set your key in the app settings.", 401));
}
