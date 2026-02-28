import { Worker } from "bullmq";
import { config } from "../config";

const worker = new Worker(
  "jobQueue",
  async (job) => {
    console.log("Processing job:", job.id);
    // Add your job processing logic here
  },
  {
    connection: {
      host: config.redis.host,
      port: config.redis.port,
    },
  },
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed!`);
});

worker.on("failed", (job, err) => {
  console.log(`Job ${job.id} failed with error ${err.message}`);
});
