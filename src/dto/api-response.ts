import { ApiResponseType } from "../types/api-response";

const ApiResponse = {
  success: <T>(data?: T, message?: string): ApiResponseType<T> => {
    return {
      success: true,
      data,
      message,
    };
  },
  failure: <T>(message: string, errors?: string[]): ApiResponseType<T> => {
    return {
      success: false,
      message,
      errors,
    };
  },
};

export default ApiResponse;
