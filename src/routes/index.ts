import { Express, static as expressStatic } from "express";
import path from "path";
import * as jobController from "../controllers/jobController";

export const setupMainRoutes = (app: Express) => {
  app.use(expressStatic(path.join(__dirname, "../static")));

  app.get("/api/health", (_req, res) => {
    res.json({ success: true, message: "Server is running" });
  });

  app.get("/", (_req, res) => {
    res.sendFile(path.join(__dirname, "../static/index.html"));
  });
};

export const setupJobRoutes = (app: Express) => {
  app.get("/api/new/:handler", jobController.createJob);
};
