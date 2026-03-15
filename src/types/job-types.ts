export type jobData = Record<string, unknown>;

export interface JobHistoryEntry {
  status: string;
  timestamp: string;
  error?: string;
}

export interface DashboardJob {
  id: string;
  jobHandler: string;
  jobCategory: string;
  status: string;
  data: Record<string, unknown>;
  history: JobHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardJobsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PaginatedDashboardJobs {
  items: DashboardJob[];
  meta: DashboardJobsMeta;
}

export type JobSortBy = "createdAt" | "updatedAt" | "status" | "jobHandler" | "jobCategory";
export type SortOrder = "asc" | "desc";

export interface DashboardJobQueryOptions {
  handler?: string;
  status?: string;
  category?: string;
  search?: string;
  sortBy?: JobSortBy;
  sortOrder?: SortOrder;
  limit?: number;
  offset?: number;
}

export interface UpdateJobPayload {
  status?: string;
  data?: Record<string, unknown>;
}
