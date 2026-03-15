import { JobHandler } from "../../interfaces/job-interfaces";
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

  protected abstract execute(data: jobData): Promise<void> | void;
}
