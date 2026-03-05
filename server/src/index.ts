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
import { initStorage } from "./lib/storage";

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL ?? "",
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.some((o) => origin.startsWith(o))) {
      return callback(null, true);
    }
    callback(new Error(`CORS blocked: ${origin}`));
  },
}));

app.use(express.json({ limit: "2mb" }));

app.use("/api/readings",      readingsRouter);
app.use("/api/chat",          chatRouter);
app.use("/api/brief",         briefRouter);
app.use("/api/rule-polish",   rulePolishRouter);
app.use("/api/issue-spotter", issueSpotterRouter);
app.use("/api/flashcards",    flashcardsRouter);
app.use("/api/review",        reviewRouter);

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
