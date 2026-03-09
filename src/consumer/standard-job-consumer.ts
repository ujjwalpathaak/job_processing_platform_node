import { Worker } from "bullmq";
import { config } from "../config/config";
import { JobMessage } from "../dto/job-dtos";
import * as Job from "../enums/job-enums";
import { AbstractJobConsumer } from "./abstract-job-consumer";

export class StandardJobConsumer extends AbstractJobConsumer {
  protected consumerName = "StandardJobConsumer";
  protected category = Job.JobCategories.STANDARD;

  public readonly worker: Worker<JobMessage>;

  constructor() {
    super();
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
