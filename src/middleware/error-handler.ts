import { Request, Response, NextFunction } from "express";
import { Logger } from "../services/log-service";

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  Logger.error(`Error processing request: ${err.message} stack: ${err.stack}`);
  res.status(500).json({ success: false, error: "Internal server error" });
};

export const notFoundHandler = (_req: Request, res: Response) => {
  Logger.error(`Route not found: ${_req.method} ${_req.path}`);
  res.status(404).json({ success: false, error: "Route not found" });
};
