import type { Request, Response } from "express";
import {
  createJob,
  getJobDetails,
  getJobs,
  getJobsUpdates,
} from "../../src/controllers/job-controller";
import {
  createAndPublishJob,
  getAllJobs,
  getAllJobsPaginated,
  getJobById,
  getUpdatedJobs,
  getUpdatedJobsPaginated,
} from "../../src/services/job-service";
import { isValidJobHandlerType } from "../../src/managers/job-manager";

jest.mock("../../src/services/job-service", () => ({
  createAndPublishJob: jest.fn(),
  getAllJobs: jest.fn(),
  getAllJobsPaginated: jest.fn(),
  getJobById: jest.fn(),
  getUpdatedJobs: jest.fn(),
  getUpdatedJobsPaginated: jest.fn(),
}));

jest.mock("../../src/managers/job-manager", () => ({
  isValidJobHandlerType: jest.fn(),
}));

jest.mock("../../src/services/log-service", () => ({
  Logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

const mockedCreateAndPublishJob = createAndPublishJob as jest.MockedFunction<
  typeof createAndPublishJob
>;
const mockedGetAllJobs = getAllJobs as jest.MockedFunction<typeof getAllJobs>;
const mockedGetAllJobsPaginated = getAllJobsPaginated as jest.MockedFunction<
  typeof getAllJobsPaginated
>;
const mockedGetJobById = getJobById as jest.MockedFunction<typeof getJobById>;
const mockedGetUpdatedJobs = getUpdatedJobs as jest.MockedFunction<typeof getUpdatedJobs>;
const mockedGetUpdatedJobsPaginated = getUpdatedJobsPaginated as jest.MockedFunction<
  typeof getUpdatedJobsPaginated
>;
const mockedIsValidJobHandlerType = isValidJobHandlerType as jest.MockedFunction<
  typeof isValidJobHandlerType
>;

const createRes = (): Response => {
  const res = {} as Response;
  (res.status as unknown as jest.Mock) = jest.fn().mockReturnValue(res);
  (res.json as unknown as jest.Mock) = jest.fn().mockReturnValue(res);
  return res;
};

describe("job-controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("createJob returns 400 for invalid handler", async () => {
    mockedIsValidJobHandlerType.mockReturnValue(false);
    const req = { params: { handler: "invalid" }, body: {} } as unknown as Request;
    const res = createRes();

    await createJob(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("createJob returns 201 on success", async () => {
    mockedIsValidJobHandlerType.mockReturnValue(true);
    mockedCreateAndPublishJob.mockResolvedValue("job-1");
    const req = { params: { handler: "email" }, body: { to: "a@b.com" } } as unknown as Request;
    const res = createRes();

    await createJob(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("getJobs returns 400 for invalid limit", async () => {
    const req = { query: { limit: "999" } } as unknown as Request;
    const res = createRes();

    await getJobs(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("getJobs returns paginated payload when page+limit provided", async () => {
    mockedGetAllJobsPaginated.mockResolvedValue({
      items: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 1, hasMore: false },
    });

    const req = { query: { page: "1", limit: "10" } } as unknown as Request;
    const res = createRes();

    await getJobs(req, res);

    expect(mockedGetAllJobsPaginated).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("getJobs returns list payload without pagination", async () => {
    mockedGetAllJobs.mockResolvedValue([]);

    const req = { query: {} } as unknown as Request;
    const res = createRes();

    await getJobs(req, res);

    expect(mockedGetAllJobs).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("getJobDetails returns 404 when missing record", async () => {
    mockedGetJobById.mockResolvedValue(null);
    const req = { params: { id: "missing-id" } } as unknown as Request;
    const res = createRes();

    await getJobDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("getJobsUpdates returns 400 when since is missing", async () => {
    const req = { query: {} } as unknown as Request;
    const res = createRes();

    await getJobsUpdates(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("getJobsUpdates returns paginated data when page+limit provided", async () => {
    mockedGetUpdatedJobsPaginated.mockResolvedValue({
      items: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 1, hasMore: false },
    });

    const req = {
      query: { since: "2026-03-27T00:00:00.000Z", page: "1", limit: "10" },
    } as unknown as Request;
    const res = createRes();

    await getJobsUpdates(req, res);

    expect(mockedGetUpdatedJobsPaginated).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("getJobsUpdates returns non-paginated data otherwise", async () => {
    mockedGetUpdatedJobs.mockResolvedValue([]);

    const req = {
      query: { since: "2026-03-27T00:00:00.000Z" },
    } as unknown as Request;
    const res = createRes();

    await getJobsUpdates(req, res);

    expect(mockedGetUpdatedJobs).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
