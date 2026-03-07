import * as JobEnums from "../enums/Job";

export class Job {
  id: number | undefined;
  createdAt: Date;
  status: JobEnums.Statuses;
  jobCategory: JobEnums.Categories;
  jobHandler: JobEnums.HandlerTypes;
  data: Record<string, unknown>;

  constructor(
    jobHandler: { category: () => JobEnums.Categories; identify: () => JobEnums.HandlerTypes },
    data: Record<string, unknown>,
  ) {
    this.status = JobEnums.Statuses.SCHEDULED;
    this.jobCategory = jobHandler.category();
    this.jobHandler = jobHandler.identify();
    this.data = data;
    this.createdAt = new Date();
  }
}
