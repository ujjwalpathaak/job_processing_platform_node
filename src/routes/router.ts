import { Express, static as expressStatic } from "express";
import path from "path";
import { createJob, getJobDetails, getJobs, getJobsUpdates } from "../controllers/job-controller";

export const setupRoutes = (app: Express) => {
  setupMainRoutes(app);
  setupJobRoutes(app);
};

const setupMainRoutes = (app: Express) => {
  app.use(expressStatic(path.join(process.cwd(), "static")));

  app.get("/api/health", (_req, res) => {
    res.json({ success: true, message: "Server is running" });
  });

  app.get("/", (_req, res) => {
    res.sendFile(path.join(process.cwd(), "static/index.html"));
  });
};

const setupJobRoutes = (app: Express) => {
  app.get("/jobs", getJobs);
  app.get("/jobs/updates", getJobsUpdates);
  app.get("/jobs/:id", getJobDetails);

  app.get("/api/jobs", getJobs);
  app.get("/api/jobs/updates", getJobsUpdates);
  app.get("/api/jobs/:id", getJobDetails);
  app.post("/api/new/:handler", createJob);
};
