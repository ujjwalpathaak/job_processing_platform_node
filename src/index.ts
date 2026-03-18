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
    `app | http request received | method=${req.method} | path=${req.path} | ip=${req.ip} | ts=${new Date().toISOString()}`,
  );
  next();
});

const startServer = async () => {
  try {
    Logger.init([new FileLogHandler()]);
    Logger.info("app | bootstrap | logger initialized");

    Logger.info("app | bootstrap | database initializing");
    await initializeDatabase();
    Logger.info("app | bootstrap | database initialized");

    Logger.info("app | bootstrap | consumers starting");
    await startConsumers();
    Logger.info("app | bootstrap | consumers started");

    Logger.info("app | bootstrap | rabbit initializing");
    await Rabbit.getInstance();
    Logger.info("app | bootstrap | rabbit initialized");

    setupRoutes(app);
    Logger.info("app | bootstrap | routes initialized");

    app.use(notFoundHandler);
    app.use(errorHandler);

    let shuttingDown = false;
    process.on("SIGINT", async () => {
      if (shuttingDown) return;
      shuttingDown = true;
      Logger.info("app | shutdown | signal=SIGINT | state=started");

      try {
        const rabbit = await Rabbit.getInstance();
        await rabbit.close();
        await closeRedis();
        Logger.info("app | shutdown | signal=SIGINT | state=completed");
      } catch (err) {
        Logger.error(`app | shutdown | signal=SIGINT | state=failed | error=${err}`);
      }

      process.exit(0);
    });

    const port = config.port as number;
    app.listen(port, () => {
      Logger.info(`app | server started | url=http://localhost:${port} | env=${config.nodeEnv}`);
    });
  } catch (error) {
    Logger.error(`app | bootstrap | state=failed | error=${error}`);
    process.exit(1);
  }
};

startServer();

export default app;
