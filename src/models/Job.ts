import * as JobEnums from "../enums/Job";
import { jobData } from "../types/job";

export class Job {
  // private readonly _id?: number;
  private readonly _createdAt: Date;
  private _status: JobEnums.Statuses;
  private readonly _jobCategory: JobEnums.Categories;
  private readonly _jobHandler: JobEnums.HandlerTypes;
  private readonly _data: jobData;

  constructor(jobHandler: JobEnums.HandlerTypes, category: JobEnums.Categories, data: jobData) {
    this._status = JobEnums.Statuses.SCHEDULED;
    this._jobCategory = category;
    this._jobHandler = jobHandler;
    this._data = data ?? {};
    this._createdAt = new Date();
  }

  get status(): JobEnums.Statuses {
    return this._status;
  }

  get data(): Record<string, unknown> {
    return this._data;
  }

  get category(): JobEnums.Categories {
    return this._jobCategory;
  }

  get handler(): JobEnums.HandlerTypes {
    return this._jobHandler;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
