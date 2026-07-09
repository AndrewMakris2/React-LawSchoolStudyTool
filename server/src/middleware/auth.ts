import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { createError } from "./errorHandler";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      apiKey: string;
      userId: string;
    }
  }
}

const DEV_USER_ID = "local-dev";

// Derives a stable, non-reversible per-user id from the caller's Groq API key.
// The key itself is never stored — only used to partition each user's data
// so visitors can't see or delete each other's readings, briefs, decks, etc.
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const headerKey = req.headers["x-groq-api-key"] as string | undefined;

  if (headerKey) {
    req.apiKey = headerKey;
    req.userId = crypto.createHash("sha256").update(headerKey).digest("hex").slice(0, 24);
    return next();
  }

  // Convenience fallback for local development only — never in production,
  // so every visitor to the deployed site must supply their own key.
  if (process.env.NODE_ENV !== "production" && process.env.GROQ_API_KEY) {
    req.apiKey = process.env.GROQ_API_KEY;
    req.userId = DEV_USER_ID;
    return next();
  }

  next(createError("No Groq API key provided. Set your key in the app settings.", 401));
}
