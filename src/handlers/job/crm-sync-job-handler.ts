import * as Job from "../../enums/job-enums";
import { config } from "../../config/config";
import { Logger } from "../../services/log-service";
import { jobData } from "../../types/job-types";
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

  public process(data: jobData): Promise<void> {
    return super.process(data);
  }

  protected async execute(_data: jobData): Promise<void> {
    await this.waitRandomMs(config.handlerDelayMs.crmSyncMin, config.handlerDelayMs.crmSyncMax);

    if (Math.random() < config.handlerFailureRate.crmSync) {
      throw new Error("CRM API timeout");
    }

    Logger.handlerInfo(
      "CRM sync handler completed successfully | action=crm_sync_completed",
      undefined,
      this.identify(),
    );
  }
}
