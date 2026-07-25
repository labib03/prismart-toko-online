import { NextResponse } from 'next/server';

export interface ApiResponseData<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

export function sendResponse<T = any>(
  statusCode: number,
  success: boolean,
  message: string,
  data?: T,
  error?: any
) {
  return NextResponse.json(
    {
      success,
      message,
      ...(data !== undefined && { data }),
      ...(error !== undefined && { error }),
    },
    { status: statusCode }
  );
}

export function sendSuccess<T = any>(message: string, data?: T, statusCode = 200) {
  return sendResponse(statusCode, true, message, data);
}

export function sendError(message: string, statusCode = 400, error?: any) {
  return sendResponse(statusCode, false, message, undefined, error);
}
