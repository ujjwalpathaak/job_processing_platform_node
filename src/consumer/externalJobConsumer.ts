import { Worker } from "bullmq";
import { config } from "../config";
import { JobMessage } from "../dto/JobMessage";
import { JobCategory } from "../enums";
import { jobHandlerFactory } from "../factory/jobHandlerFactory";
import { AbstractJobConsumer } from "./abstractJobConsumer";

export class ExternalJobConsumer extends AbstractJobConsumer {
  protected consumerName = "ExternalJobConsumer";
  protected category = JobCategory.EXTERNAL;

  public readonly worker: Worker<JobMessage>;

  constructor() {
    super(jobHandlerFactory);
    this.worker = new Worker<JobMessage>("external.jobs", (job) => this.consumeInternal(job), {
      connection: {
        host: config.redis.host,
        port: config.redis.port,
      },
    });

    this.worker.on("completed", (job) => {
      console.log(`${this.consumerName} - completed job=${job.id}`);
    });

    this.worker.on("failed", (job, err) => {
      console.log(`${this.consumerName} - failed job=${job?.id} error=${err.message}`);
    });
  }
}
