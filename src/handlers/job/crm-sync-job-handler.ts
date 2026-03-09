import { JobMessage } from "../../dto/job-dtos";
import * as Job from "../../enums/job-enums";
import { AbstractJobHandler } from "./abstract-job-handler";

export class CrmSyncJobHandler extends AbstractJobHandler {
  public identify(): Job.JobHandlerTypes {
    return Job.JobHandlerTypes.CRM_SYNC;
  }

  public category(): Job.JobCategories {
    return Job.JobCategories.EXTERNAL;
  }

  public retries(): number {
    return 2;
  }

  public backoff(): string[] {
    return ["5s", "60s"];
  }

  protected async execute(_message: JobMessage): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 4000));
    throw new Error("CRM API timeout");
  }
}
