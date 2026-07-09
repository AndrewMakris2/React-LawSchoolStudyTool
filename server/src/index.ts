import "dotenv/config";
import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler";
import readingsRouter from "./routes/readings";
import chatRouter from "./routes/chat";
import briefRouter from "./routes/brief";
import rulePolishRouter from "./routes/rulePolish";
import issueSpotterRouter from "./routes/issueSpotter";
import flashcardsRouter from "./routes/flashcards";
import reviewRouter from "./routes/review";
import examRouter from "./routes/exam";
import outlineRouter from "./routes/outline";
import glossaryRouter from "./routes/glossary";
import { initStorage } from "./lib/storage";
import { requireAuth } from "./middleware/auth";

const app = express();
const PORT = process.env.PORT || 3001;

// Allow all Vercel/Netlify preview URLs + localhost
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const allowed =
      origin.includes("vercel.app") ||
      origin.includes("netlify.app") ||
      origin.includes("localhost") ||
      origin.includes("127.0.0.1") ||
      origin === (process.env.CLIENT_URL ?? "");

    if (allowed) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked: ${origin}`);
      callback(null, true);
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: "2mb" }));

app.use("/api/readings",      requireAuth, readingsRouter);
app.use("/api/chat",          requireAuth, chatRouter);
app.use("/api/brief",         requireAuth, briefRouter);
app.use("/api/rule-polish",   requireAuth, rulePolishRouter);
app.use("/api/issue-spotter", requireAuth, issueSpotterRouter);
app.use("/api/flashcards",    requireAuth, flashcardsRouter);
app.use("/api/review",        requireAuth, reviewRouter);
app.use("/api/exam",          requireAuth, examRouter);
app.use("/api/outline",       requireAuth, outlineRouter);
app.use("/api/glossary",      requireAuth, glossaryRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", model: process.env.GROQ_MODEL });
});

app.use(errorHandler);

async function main() {
  await initStorage();
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`   Model: ${process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile"}`);
  });
}

main();
