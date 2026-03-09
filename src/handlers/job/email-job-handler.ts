import { JobMessage } from "../../dto/job-dtos";
import { JobHandlerTypes, JobCategories } from "../../enums/job-enums";
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

  protected execute(message: JobMessage): void {
    if (Math.random() < 0.3) {
      throw new Error("Invalid emailId");
    }

    console.log(`Email sent for job ${message.id}`);
  }
}
