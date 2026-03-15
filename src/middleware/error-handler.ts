import { Request, Response, NextFunction } from "express";
import { Logger } from "../services/log-service";

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  Logger.error(
    `event=http.request.error method=${_req.method} path=${_req.path} error=${err.message} stack=${err.stack}`,
  );
  res.status(500).json({ success: false, error: "Internal server error" });
};

export const notFoundHandler = (_req: Request, res: Response) => {
  Logger.error(`event=http.route.not_found method=${_req.method} path=${_req.path}`);
  res.status(404).json({ success: false, error: "Route not found" });
};
