import * as JobEnums from "../enums/job-enums";
import { jobHandlers } from "../handlers/job";
import { JobHandler } from "../interfaces/job-interfaces";

const JobManager = {
  getJobHandlerCategoryFromType(jobHandlerType: JobEnums.HandlerTypes): JobEnums.Categories {
    const handler: JobHandler | undefined = jobHandlers[jobHandlerType]
      ? jobHandlers[jobHandlerType]
      : undefined;
    if (!handler) {
      throw new Error("Unsupported handler");
    }

    return handler.category();
  },
  isValidHandler(value: string): boolean {
    const handlerType = Object.values(JobEnums.HandlerTypes).find(
      (type) => type.toLowerCase() === value.toLowerCase(),
    );
    return !!handlerType;
  },
};

export default JobManager;
