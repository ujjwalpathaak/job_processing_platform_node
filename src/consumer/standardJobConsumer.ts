import { Worker } from "bullmq";
import { config } from "../config/config";
import { JobMessage } from "../dto/JobMessage";
import * as Job from "../enums/Job";
import { jobHandlerFactory } from "../factory/jobHandlerFactory";
import { AbstractJobConsumer } from "./abstractJobConsumer";

export class StandardJobConsumer extends AbstractJobConsumer {
  protected consumerName = "StandardJobConsumer";
  protected category = Job.Categories.STANDARD;

  public readonly worker: Worker<JobMessage>;

  constructor() {
    super(jobHandlerFactory);
    this.worker = new Worker<JobMessage>("standard.jobs", (job) => this.consumeInternal(job), {
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
