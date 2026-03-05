import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode?: number;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = err.statusCode ?? 500;
  const message = err.message ?? "Internal server error";
  console.error(`[ERROR ${status}]`, message);
  res.status(status).json({ error: message });
}

export function createError(message: string, statusCode = 500): AppError {
  const err = new Error(message) as AppError;
  err.statusCode = statusCode;
  return err;
}