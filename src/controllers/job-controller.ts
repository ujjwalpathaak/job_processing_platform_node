import { Request, Response } from "express";
import {
  createAndPublishJob,
  getAllJobs,
  getAllJobsPaginated,
  getJobById,
  getUpdatedJobs,
  getUpdatedJobsPaginated,
} from "../services/job-service";
import ApiResponse from "../dto/api-dtos";
import { JobHandlerTypes } from "../enums/job-enums";
import { DashboardJobQueryOptions, JobSortBy, jobData, SortOrder } from "../types/job-types";
import { isValidJobHandlerType } from "../managers/job-manager";
import { Logger } from "../services/log-service";

const ALLOWED_SORT_BY: JobSortBy[] = [
  "createdAt",
  "updatedAt",
  "status",
  "jobHandler",
  "jobCategory",
];
const ALLOWED_SORT_ORDER: SortOrder[] = ["asc", "desc"];

const parseJobQueryOptions = (
  req: Request,
): {
  options?: DashboardJobQueryOptions;
  page?: number;
  limit?: number;
  error?: string;
} => {
  const handler = String(req.query.handler || "").trim();
  const status = String(req.query.status || "").trim();
  const category = String(req.query.category || "").trim();
  const search = String(req.query.search || "").trim();
  const sortByRaw = String(req.query.sortBy || "").trim();
  const sortOrderRaw = String(req.query.sortOrder || "")
    .trim()
    .toLowerCase();
  const pageRaw = String(req.query.page || "").trim();
  const limitRaw = String(req.query.limit || "").trim();

  let sortBy: JobSortBy | undefined;
  let sortOrder: SortOrder | undefined;
  let page: number | undefined;
  let limit: number | undefined;

  if (sortByRaw) {
    if (!ALLOWED_SORT_BY.includes(sortByRaw as JobSortBy)) {
      return { error: `Invalid 'sortBy'. Allowed values: ${ALLOWED_SORT_BY.join(", ")}` };
    }
    sortBy = sortByRaw as JobSortBy;
  }

  if (sortOrderRaw) {
    if (!ALLOWED_SORT_ORDER.includes(sortOrderRaw as SortOrder)) {
      return { error: `Invalid 'sortOrder'. Allowed values: ${ALLOWED_SORT_ORDER.join(", ")}` };
    }
    sortOrder = sortOrderRaw as SortOrder;
  }

  if (pageRaw) {
    page = Number(pageRaw);
    if (!Number.isInteger(page) || page < 1) {
      return { error: "Invalid 'page'. It must be an integer greater than or equal to 1" };
    }
  }

  if (limitRaw) {
    limit = Number(limitRaw);
    if (!Number.isInteger(limit) || limit < 1 || limit > 200) {
      return { error: "Invalid 'limit'. It must be an integer between 1 and 200" };
    }
  }

  if (page && !limit) {
    return { error: "Query param 'limit' is required when 'page' is provided" };
  }

  const offset = limit && page ? (page - 1) * limit : undefined;

  return {
    options: {
      handler: handler || undefined,
      status: status || undefined,
      category: category || undefined,
      search: search || undefined,
      sortBy,
      sortOrder,
      limit,
      offset,
    },
    page,
    limit,
  };
};

export const createJob = async (req: Request, res: Response): Promise<Response> => {
  const handler: string = req.params.handler;
  const jobData: jobData = req.body.data || {};
  if (!handler) {
    return res.status(400).json(ApiResponse.failure("Handler parameter is required"));
  }

  const isValid: boolean = isValidJobHandlerType(handler);
  if (!isValid) {
    return res.status(400).json(ApiResponse.failure(`Invalid job handler type: ${handler}`));
  }
  try {
    const jobId = await createAndPublishJob(handler as JobHandlerTypes, jobData);
    return res.status(201).json(ApiResponse.success({ jobId }, "Job created successfully"));
  } catch (error) {
    Logger.error(`Failed to create job with handler: ${handler}, error: ${error}`);
    return res.status(500).json(ApiResponse.failure("Failed to create job"));
  }
};

export const getJobs = async (req: Request, res: Response): Promise<Response> => {
  const { options, page, limit, error } = parseJobQueryOptions(req);
  if (error) {
    return res.status(400).json(ApiResponse.failure(error));
  }

  try {
    if (page && limit) {
      const paginatedJobs = await getAllJobsPaginated(options || {}, page, limit);
      return res.status(200).json(ApiResponse.success(paginatedJobs, "Jobs fetched successfully"));
    }

    const jobs = await getAllJobs(options);
    return res.status(200).json(ApiResponse.success(jobs, "Jobs fetched successfully"));
  } catch (error) {
    Logger.error(`Failed to fetch jobs, error: ${error}`);
    return res.status(500).json(ApiResponse.failure("Failed to fetch jobs"));
  }
};

export const getJobDetails = async (req: Request, res: Response): Promise<Response> => {
  const id = String(req.params.id || "").trim();

  if (!id) {
    return res.status(400).json(ApiResponse.failure("Job id is required"));
  }

  try {
    const job = await getJobById(id);
    if (!job) {
      return res.status(404).json(ApiResponse.failure("Job not found"));
    }

    return res.status(200).json(ApiResponse.success(job, "Job fetched successfully"));
  } catch (error) {
    Logger.error(`Failed to fetch job ${id}, error: ${error}`);
    return res.status(500).json(ApiResponse.failure("Failed to fetch job"));
  }
};

export const getJobsUpdates = async (req: Request, res: Response): Promise<Response> => {
  const since = String(req.query.since || "").trim();

  if (!since) {
    return res.status(400).json(ApiResponse.failure("Query param 'since' is required"));
  }

  const sinceDate = new Date(since);
  if (Number.isNaN(sinceDate.getTime())) {
    return res.status(400).json(ApiResponse.failure("Invalid 'since' timestamp"));
  }

  const { options, page, limit, error } = parseJobQueryOptions(req);
  if (error) {
    return res.status(400).json(ApiResponse.failure(error));
  }

  try {
    if (page && limit) {
      const paginatedJobs = await getUpdatedJobsPaginated(sinceDate, options || {}, page, limit);
      return res
        .status(200)
        .json(ApiResponse.success(paginatedJobs, "Updated jobs fetched successfully"));
    }

    const jobs = await getUpdatedJobs(sinceDate, options);
    return res.status(200).json(ApiResponse.success(jobs, "Updated jobs fetched successfully"));
  } catch (error) {
    Logger.error(`Failed to fetch updated jobs since ${since}, error: ${error}`);
    return res.status(500).json(ApiResponse.failure("Failed to fetch updated jobs"));
  }
};
