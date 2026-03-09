import { JobHandlerTypes, JobStatuses, JobCategories } from "../enums/job-enums";
import { jobData } from "../types/job-types";

export class Job {
  private readonly _id?: number;
  private readonly _createdAt: Date;
  private _status: JobStatuses;
  private readonly _jobCategory: JobCategories;
  private readonly _jobHandler: JobHandlerTypes;
  private readonly _data: jobData;

  constructor(jobHandler: JobHandlerTypes, category: JobCategories, data: jobData) {
    this._status = JobStatuses.SCHEDULED;
    this._jobCategory = category;
    this._jobHandler = jobHandler;
    this._data = data ?? {};
    this._createdAt = new Date();
  }

  get id(): number {
    return this._id!;
  }

  get status(): JobStatuses {
    return this._status;
  }

  get data(): Record<string, unknown> {
    return this._data;
  }

  get category(): JobCategories {
    return this._jobCategory;
  }

  get handler(): JobHandlerTypes {
    return this._jobHandler;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
