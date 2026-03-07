import * as jobRepository from "../repositories/jobRepository";
import { Job } from "../models/Job";
import { CreateJobRequest, NewJob } from "../interfaces/Job";
import * as JobEnums from "../enums/Job";

// export const getAllJobs = async (): Promise<Job[]> => {
//   return jobRepository.findAll();
// };

// export const getJobById = async (id: number): Promise<Job | null> => {
//   return jobRepository.findById(id);
// };

// export const getJobsUpdatedSince = async (since: Date): Promise<Job[]> => {
//   return jobRepository.findUpdatedSince(since);
// };

export const createJob = async (data: CreateJobRequest): Promise<NewJob> => {
  return await jobRepository.create(data);
};

// export const updateJob = async (id: number, data: UpdateJobRequest): Promise<Job | null> => {
//   return jobRepository.update(id, data);
// };

// export const deleteJob = async (id: number): Promise<boolean> => {
//   return jobRepository.delete_(id);
// };

export const updateJobStatus = async (
  id: number,
  status: JobEnums.Statuses,
  error?: string,
): Promise<Job | null> => {
  return jobRepository.addHistory(id, status, error);
};
