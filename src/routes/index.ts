import { Express, static as expressStatic } from "express";
import path from "path";
import * as jobController from "../controllers/jobController";
import * as userController from "../controllers/userController";

export const setupRoutes = (app: Express) => {
  // Serve static files (index.html and other assets)
  app.use(expressStatic(path.join(__dirname, "../static")));

  // Job routes
  app.get("/api/jobs", jobController.getJobs);
  app.get("/api/jobs/updates", jobController.getJobsUpdatedSince);
  app.get("/api/jobs/:id", jobController.getJob);
  app.post("/api/jobs", jobController.createJob);
  app.put("/api/jobs/:id", jobController.updateJob);
  app.delete("/api/jobs/:id", jobController.deleteJob);

  // User routes
  app.get("/api/users", userController.getUsers);
  app.get("/api/users/:id", userController.getUser);
  app.post("/api/users", userController.createUser);
  app.put("/api/users/:id", userController.updateUser);
  app.delete("/api/users/:id", userController.deleteUser);

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ success: true, message: "Server is running" });
  });

  // Serve dashboard on root
  app.get("/", (_req, res) => {
    res.sendFile(path.join(__dirname, "../static/index.html"));
  });
};
