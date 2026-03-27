import { JobHandler } from "../../interfaces/job-interfaces";
import { Logger } from "../../services/log-service";
import { jobData } from "../../types/job-types";

export abstract class AbstractJobHandler implements JobHandler {
  public abstract identify(): ReturnType<JobHandler["identify"]>;

  public abstract category(): ReturnType<JobHandler["category"]>;

  public abstract retries(): number;

  public abstract backoff(): string[];

  public async process(data: jobData): Promise<void> {
    this.validate(data);

    try {
      await this.beforeExecute(data);
      await this.execute(data);
      await this.afterExecute(data);
    } catch (error) {
      Logger.handlerError(
        `Handler execution failed during process step | error=${(error as Error).message}`,
        undefined,
        this.identify(),
      );
      await this.onFailure(data, error);
      throw error;
    }
  }

  protected async beforeExecute(_data: jobData): Promise<void> {
    // no-op by default
  }

  protected async afterExecute(_data: jobData): Promise<void> {
    // no-op by default
  }

  protected async onFailure(_data: jobData, _error: unknown): Promise<void> {
    // no-op by default
  }

  protected validate(_data: jobData): void {
    // no-op by default
  }

  protected async waitMs(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  protected randomBetween(minMs: number, maxMs: number): number {
    if (maxMs <= minMs) {
      return minMs;
    }

    return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  }

  protected async waitRandomMs(minMs: number, maxMs: number): Promise<void> {
    await this.waitMs(this.randomBetween(minMs, maxMs));
  }

  protected abstract execute(data: jobData): Promise<void> | void;
}
