import { Express, static as expressStatic } from "express";
import path from "path";
import JobController from "../controllers/job-controller";

export const setupRoutes = (app: Express) => {
  setupMainRoutes(app);
  setupJobRoutes(app);
};

const setupMainRoutes = (app: Express) => {
  app.use(expressStatic(path.join(__dirname, "../static")));

  app.get("/api/health", (_req, res) => {
    res.json({ success: true, message: "Server is running" });
  });

  app.get("/", (_req, res) => {
    res.sendFile(path.join(__dirname, "../static/index.html"));
  });
};

const setupJobRoutes = (app: Express) => {
  app.post("/api/new/:handler", JobController.createNewJob);
};
