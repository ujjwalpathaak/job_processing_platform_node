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
    `Incoming HTTP request | method=${req.method} | path=${req.path} | ip=${req.ip} | ts=${new Date().toISOString()}`,
  );
  next();
});

const startServer = async () => {
  try {
    Logger.init([new FileLogHandler()]);
    Logger.info("Logger handlers initialized");

    Logger.info("Database initialization started");
    await initializeDatabase();
    Logger.info("Database initialization completed");

    Logger.info("Queue consumers startup started");
    await startConsumers();
    Logger.info("Queue consumers startup completed");

    Logger.info("RabbitMQ bootstrap started");
    await Rabbit.getInstance();
    Logger.info("RabbitMQ bootstrap completed");

    setupRoutes(app);
    Logger.info("HTTP routes initialized");

    app.use(notFoundHandler);
    app.use(errorHandler);

    let shuttingDown = false;
    process.on("SIGINT", async () => {
      if (shuttingDown) return;
      shuttingDown = true;
      Logger.info("Application shutdown started | signal=SIGINT");

      try {
        const rabbit = await Rabbit.getInstance();
        await rabbit.close();
        await closeRedis();
        Logger.info("Application shutdown completed | signal=SIGINT");
      } catch (err) {
        Logger.error(`Application shutdown failed | signal=SIGINT | error=${err}`);
      }

      process.exit(0);
    });

    const port = config.port as number;
    app.listen(port, () => {
      Logger.info(`HTTP server started | url=http://localhost:${port} | env=${config.nodeEnv}`);
    });
  } catch (error) {
    Logger.error(`Application bootstrap failed | error=${error}`);
    process.exit(1);
  }
};

startServer();

export default app;
