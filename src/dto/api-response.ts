import { ApiResponse } from "../types/job";

const ApiResponse = {
  success: <T>(data?: T, message?: string): ApiResponse<T> => {
    return {
      success: true,
      data,
      message,
    };
  },
  failure: <T>(message: string, errors?: string[]): ApiResponse<T> => {
    return {
      success: false,
      message,
      errors,
    };
  },
};

export default ApiResponse;
