import express, { Express } from "express";
import cors from "cors";
import { config } from "./config";
import { initializeDatabase } from "./database/migrations";
import { requestLogger } from "./middleware/logger";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { setupRoutes } from "./routes";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

const startServer = async () => {
  try {
    console.log("Initializing database...");
    await initializeDatabase();
    console.log("Database initialized successfully");

    setupRoutes(app);

    app.use(notFoundHandler);
    app.use(errorHandler);

    const port = config.port as number;
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
