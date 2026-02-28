import { ApiResponse } from "../types";

export const success = <T>(data?: T, message?: string): ApiResponse<T> => {
  return {
    success: true,
    data,
    message,
  };
};

export const failure = <T>(message: string, errors?: string[]): ApiResponse<T> => {
  return {
    success: false,
    message,
    errors,
  };
};
