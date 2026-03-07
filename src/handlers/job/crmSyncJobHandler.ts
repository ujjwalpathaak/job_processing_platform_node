import { JobMessage } from "../../dto/JobMessage";
import * as Job from "../../enums/Job";
import { AbstractJobHandler } from "./abstractJobHandler";

export class CrmSyncJobHandler extends AbstractJobHandler {
  public identify(): Job.HandlerTypes {
    return Job.HandlerTypes.CRM_SYNC;
  }

  public category(): Job.Categories {
    return Job.Categories.EXTERNAL;
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
