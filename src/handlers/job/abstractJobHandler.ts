import { JobMessage } from "../../dto/JobMessage";
import { JobHandler } from "../../interfaces/JobHandler";

export abstract class AbstractJobHandler implements JobHandler {
  public abstract identify(): ReturnType<JobHandler["identify"]>;

  public abstract category(): ReturnType<JobHandler["category"]>;

  public abstract retries(): number;

  public abstract backoff(): string[];

  public async process(message: JobMessage): Promise<void> {
    this.validate(message);

    try {
      await this.beforeExecute(message);
      await this.execute(message);
      await this.afterExecute(message);
    } catch (error) {
      await this.onFailure(message, error);
      throw error;
    }
  }

  protected async beforeExecute(_message: JobMessage): Promise<void> {
    // no-op by default
  }

  protected async afterExecute(_message: JobMessage): Promise<void> {
    // no-op by default
  }

  protected async onFailure(_message: JobMessage, _error: unknown): Promise<void> {
    // no-op by default
  }

  protected validate(_message: JobMessage): void {
    // no-op by default
  }

  protected abstract execute(message: JobMessage): Promise<void> | void;
}
