import { JobHandlerTypes, JobStatuses, JobCategories } from "../enums/job-enums";
import { jobData } from "../types/job-types";
import { v4 as uuidv4 } from "uuid";

export class Job {
  private readonly _id: string;
  private readonly _createdAt: Date;
  private _status: JobStatuses;
  private readonly _category: JobCategories;
  private readonly _handler: JobHandlerTypes;
  private readonly _data: jobData;

  constructor(jobHandler: JobHandlerTypes, category: JobCategories, data: jobData) {
    this._id = uuidv4();
    this._status = JobStatuses.SCHEDULED;
    this._category = category;
    this._handler = jobHandler;
    this._data = data ?? {};
    this._createdAt = new Date();
  }

  get id(): string {
    return this._id!;
  }

  get status(): JobStatuses {
    return this._status;
  }

  get data(): Record<string, unknown> {
    return this._data;
  }

  get stringData(): string {
    return JSON.stringify(this._data);
  }

  get category(): JobCategories {
    return this._category;
  }

  get handler(): JobHandlerTypes {
    return this._handler;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
