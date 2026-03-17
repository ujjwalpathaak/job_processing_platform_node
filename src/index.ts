import express from "express";
import type { Request, Express, Response, NextFunction } from "express";
import cors from "cors";
import { config } from "./config/config";
import { initializeDatabase } from "./database/migrations";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import { setupRoutes } from "./routes/router";
import { startConsumers } from "./consumer";
import { Logger } from "./services/log-service";
import FileLogHandler from "./handlers/log/file-log-handler";
import { closeRedis } from "./config/redis";
import { Rabbit } from "./config/rabbit";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (req.method === "GET") {
    return next();
  }

  Logger.info(
    `event=http.request.received method=${req.method} path=${req.path} ip=${req.ip} ts=${new Date().toISOString()}`,
  );
  next();
});

const startServer = async () => {
  try {
    console.log("Initializing database...");
    await initializeDatabase();
    console.log("Database initialized successfully");
    Logger.init([new FileLogHandler()]);
    console.log("Logger initialized successfully");
    await startConsumers();
    console.log("RabbitMQ consumers started successfully");
    await Rabbit.getInstance();
    console.log("RabbitMQ initialized");
    setupRoutes(app);
    console.log("Routes initialized successfully");

    app.use(notFoundHandler);
    app.use(errorHandler);

    let shuttingDown = false;
    process.on("SIGINT", async () => {
      if (shuttingDown) return;
      shuttingDown = true;

      try {
        const rabbit = await Rabbit.getInstance();
        await rabbit.close();
        await closeRedis();
      } catch (err) {
        console.error("Shutdown error:", err);
      }

      process.exit(0);
    });

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
