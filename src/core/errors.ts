export interface ErrorResponse {
  code?: number;
  message?: string;
  [key: string]: unknown;
}

export class VikunjaError extends Error {
  public readonly endpoint: string;
  public readonly method: string;
  public readonly statusCode: number;
  public readonly response: ErrorResponse;

  constructor(
    message: string,
    endpoint: string,
    method: string,
    statusCode: number,
    response: ErrorResponse
  ) {
    super(message);
    this.name = 'VikunjaError';
    this.endpoint = endpoint;
    this.method = method;
    this.statusCode = statusCode;
    this.response = response;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class VikunjaAuthenticationError extends VikunjaError {
  constructor(
    message: string,
    endpoint: string,
    method: string,
    statusCode: number,
    response: ErrorResponse
  ) {
    super(message, endpoint, method, statusCode, response);
    this.name = 'VikunjaAuthenticationError';
  }
}

export class VikunjaNotFoundError extends VikunjaError {
  constructor(
    message: string,
    endpoint: string,
    method: string,
    statusCode: number,
    response: ErrorResponse
  ) {
    super(message, endpoint, method, statusCode, response);
    this.name = 'VikunjaNotFoundError';
  }
}

export class VikunjaValidationError extends VikunjaError {
  constructor(
    message: string,
    endpoint: string,
    method: string,
    statusCode: number,
    response: ErrorResponse
  ) {
    super(message, endpoint, method, statusCode, response);
    this.name = 'VikunjaValidationError';
  }
}

export class VikunjaServerError extends VikunjaError {
  constructor(
    message: string,
    endpoint: string,
    method: string,
    statusCode: number,
    response: ErrorResponse
  ) {
    super(message, endpoint, method, statusCode, response);
    this.name = 'VikunjaServerError';
  }
}

// Type guards
export function isVikunjaError(error: unknown): error is VikunjaError {
  return error instanceof VikunjaError;
}

export function isVikunjaAuthenticationError(error: unknown): error is VikunjaAuthenticationError {
  return error instanceof VikunjaAuthenticationError;
}

export function isVikunjaNotFoundError(error: unknown): error is VikunjaNotFoundError {
  return error instanceof VikunjaNotFoundError;
}

export function isVikunjaValidationError(error: unknown): error is VikunjaValidationError {
  return error instanceof VikunjaValidationError;
}

export function isVikunjaServerError(error: unknown): error is VikunjaServerError {
  return error instanceof VikunjaServerError;
}