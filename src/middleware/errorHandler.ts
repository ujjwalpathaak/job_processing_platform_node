import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error("Error:", err);
  res.status(500).json({ success: false, error: "Internal server error" });
};

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: "Route not found" });
};
