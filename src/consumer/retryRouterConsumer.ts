import { Worker } from "bullmq";
import { config } from "../config";
import { JobMessage } from "../dto/JobMessage";
import { AbstractRetryRouterConsumer } from "./abstractRetryRouterConsumer";

export class RetryRouterConsumer extends AbstractRetryRouterConsumer {
  protected routerName = "RetryRouterConsumer";

  public readonly worker: Worker<JobMessage>;

  constructor() {
    super();
    this.worker = new Worker<JobMessage>(
      "retry.route.queue",
      async (job) => {
        await this.routeInternal(job, "retry.route.queue");
      },
      {
        connection: {
          host: config.redis.host,
          port: config.redis.port,
        },
      },
    );

    this.worker.on("completed", (job) => {
      console.log(`${this.routerName} - completed route job=${job.id}`);
    });

    this.worker.on("failed", (job, err) => {
      console.log(`${this.routerName} - failed route job=${job?.id} error=${err.message}`);
    });
  }
}
