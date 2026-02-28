export interface Job {
  id: number;
  name: string;
  description: string;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: Date;
  updated_at: Date;
}

export interface CreateJobRequest {
  name: string;
  description: string;
}

export interface UpdateJobRequest {
  name?: string;
  description?: string;
  status?: Job["status"];
}
