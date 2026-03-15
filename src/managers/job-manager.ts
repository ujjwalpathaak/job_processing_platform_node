import { JobCategories, JobHandlerTypes } from "../enums/job-enums";
import { jobHandlers } from "../handlers/job";
import { JobHandler } from "../interfaces/job-interfaces";

export const getJobHandlerCategoryFromType = (jobHandlerType: JobHandlerTypes): JobCategories => {
  const handler: JobHandler | undefined = jobHandlers[jobHandlerType]
    ? jobHandlers[jobHandlerType]
    : undefined;
  if (!handler) {
    throw new Error("Unsupported handler for type: " + jobHandlerType);
  }

  return handler.category();
};

export const isValidJobHandlerType = (value: string): boolean => {
  const handlerType = Object.values(JobHandlerTypes).find(
    (type) => type.toLowerCase() === value.toLowerCase(),
  );
  return !!handlerType;
};
