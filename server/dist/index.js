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
const exam_1 = __importDefault(require("./routes/exam"));
const outline_1 = __importDefault(require("./routes/outline"));
const glossary_1 = __importDefault(require("./routes/glossary"));
const storage_1 = require("./lib/storage");
const auth_1 = require("./middleware/auth");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Allow all Vercel/Netlify preview URLs + localhost
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        const allowed = origin.includes("vercel.app") ||
            origin.includes("netlify.app") ||
            origin.includes("localhost") ||
            origin.includes("127.0.0.1") ||
            origin === (process.env.CLIENT_URL ?? "");
        if (allowed) {
            callback(null, true);
        }
        else {
            console.warn(`CORS blocked: ${origin}`);
            callback(null, true);
        }
    },
    credentials: true,
}));
app.use(express_1.default.json({ limit: "2mb" }));
app.use("/api/readings", auth_1.requireAuth, readings_1.default);
app.use("/api/chat", auth_1.requireAuth, chat_1.default);
app.use("/api/brief", auth_1.requireAuth, brief_1.default);
app.use("/api/rule-polish", auth_1.requireAuth, rulePolish_1.default);
app.use("/api/issue-spotter", auth_1.requireAuth, issueSpotter_1.default);
app.use("/api/flashcards", auth_1.requireAuth, flashcards_1.default);
app.use("/api/review", auth_1.requireAuth, review_1.default);
app.use("/api/exam", auth_1.requireAuth, exam_1.default);
app.use("/api/outline", auth_1.requireAuth, outline_1.default);
app.use("/api/glossary", auth_1.requireAuth, glossary_1.default);
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
