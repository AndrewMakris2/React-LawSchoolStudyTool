"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const errorHandler_1 = require("./middleware/errorHandler");
const readings_1 = __importDefault(require("./routes/readings"));
const chat_1 = __importDefault(require("./routes/chat"));
const brief_1 = __importDefault(require("./routes/brief"));
const rulePolish_1 = __importDefault(require("./routes/rulePolish"));
const issueSpotter_1 = __importDefault(require("./routes/issueSpotter"));
const flashcards_1 = __importDefault(require("./routes/flashcards"));
const review_1 = __importDefault(require("./routes/review"));
const storage_1 = require("./lib/storage");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const allowedOrigins = [
    "http://localhost:5173",
    process.env.CLIENT_URL ?? "",
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.some((o) => origin.startsWith(o))) {
            return callback(null, true);
        }
        callback(new Error(`CORS blocked: ${origin}`));
    },
}));
app.use(express_1.default.json({ limit: "2mb" }));
app.use("/api/readings", readings_1.default);
app.use("/api/chat", chat_1.default);
app.use("/api/brief", brief_1.default);
app.use("/api/rule-polish", rulePolish_1.default);
app.use("/api/issue-spotter", issueSpotter_1.default);
app.use("/api/flashcards", flashcards_1.default);
app.use("/api/review", review_1.default);
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", model: process.env.GROQ_MODEL });
});
app.use(errorHandler_1.errorHandler);
async function main() {
    await (0, storage_1.initStorage)();
    app.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT}`);
        console.log(`   Model: ${process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile"}`);
    });
}
main();
