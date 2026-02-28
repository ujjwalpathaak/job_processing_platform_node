import queue from "../queues/jobQueue";

const addJob = async (data) => {
  await queue.add("job", data);
};

export default addJob;
