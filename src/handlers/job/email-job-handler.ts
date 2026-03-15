import { JobHandlerTypes, JobCategories } from "../../enums/job-enums";
import { Logger } from "../../services/log-service";
import { jobData } from "../../types/job-types";
import { AbstractJobHandler } from "./abstract-job-handler";

export class EmailJobHandler extends AbstractJobHandler {
  public identify(): JobHandlerTypes {
    return JobHandlerTypes.EMAIL;
  }

  public category(): JobCategories {
    return JobCategories.STANDARD;
  }

  public retries(): number {
    return 2;
  }

  public backoff(): string[] {
    return ["5s", "30s"];
  }

  public process(data: jobData): Promise<void> {
    return super.process(data);
  }

  protected execute(data: jobData): void {
    if (Math.random() < 0.3) {
      throw new Error("Invalid emailId");
    }

    Logger.handlerInfo(`Email sent to ${data.emailId} with subject: ${data.subject}`);
  }
}
