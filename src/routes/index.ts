import { Express, static as expressStatic } from "express";
import path from "path";
import * as jobController from "../controllers/jobController";

export const setupRoutes = (app: Express) => {
  // Serve static files (index.html and other assets)
  app.use(expressStatic(path.join(__dirname, "../static")));

  // Job routes
  app.get("/api/jobs", jobController.getJobs);
  app.post("/api/jobs/new", jobController.createQueuedJob);
  app.get("/api/jobs/updates", jobController.getJobsUpdatedSince);
  app.get("/api/jobs/:id", jobController.getJob);
  app.post("/api/jobs", jobController.createJob);
  app.put("/api/jobs/:id", jobController.updateJob);
  app.delete("/api/jobs/:id", jobController.deleteJob);

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ success: true, message: "Server is running" });
  });

  // Serve dashboard on root
  app.get("/", (_req, res) => {
    res.sendFile(path.join(__dirname, "../static/index.html"));
  });
};
