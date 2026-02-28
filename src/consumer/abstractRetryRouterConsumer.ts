import { Job } from "bullmq";
import { JobMessage } from "../dto/JobMessage";
import { getQueueByCategory } from "../queues/jobQueue";

export abstract class AbstractRetryRouterConsumer {
  protected abstract routerName: string;

  protected async routeInternal(job: Job<JobMessage>, backoff: string): Promise<void> {
    const payload = job.data;
    const queue = getQueueByCategory(payload.jobCategory);

    await queue.add("retry-job", payload);

    console.log(
      `${this.routerName} - ROUTED - from: ${backoff}, to: category=${payload.jobCategory}, jobId=${payload.jobId}`,
    );
  }
}
