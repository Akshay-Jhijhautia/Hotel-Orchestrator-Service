import { ApiSuccessResponse } from '../types/response.types';

export const successResponse = <T>(data: T): ApiSuccessResponse<T> => ({
  success: true,
  data,
});
