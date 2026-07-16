import type { ApiFieldError, NormalizedApiError } from "../types/api";

export class ApiClientError extends Error implements NormalizedApiError {
  code: string;
  details: string[];
  fieldErrors: Record<string, string>;
  path?: string;
  status: number;
  timestamp?: string;

  constructor(error: NormalizedApiError) {
    super(error.message);
    this.name = "ApiClientError";
    this.code = error.code;
    this.details = error.details;
    this.fieldErrors = error.fieldErrors;
    this.path = error.path;
    this.status = error.status;
    this.timestamp = error.timestamp;
  }
}

function mapFieldErrors(errors?: ApiFieldError[]) {
  return (errors ?? []).reduce<Record<string, string>>((accumulator, error) => {
    if (error.field) {
      accumulator[error.field] = error.message;
    }

    return accumulator;
  }, {});
}

function mapDetails(errors?: ApiFieldError[]) {
  return (errors ?? [])
    .filter((error) => !error.field && error.message)
    .map((error) => error.message);
}

export function normalizeApiError(
  status: number,
  body: unknown,
  fallbackMessage = "Request failed"
): ApiClientError {
  if (body && typeof body === "object") {
    const payload = body as {
      code?: string;
      errors?: ApiFieldError[];
      message?: string;
      path?: string;
      timestamp?: string;
    };

    return new ApiClientError({
      code: payload.code ?? `HTTP_${status}`,
      details: mapDetails(payload.errors),
      fieldErrors: mapFieldErrors(payload.errors),
      message: payload.message ?? fallbackMessage,
      path: payload.path,
      status,
      timestamp: payload.timestamp
    });
  }

  return new ApiClientError({
    code: `HTTP_${status}`,
    details: [],
    fieldErrors: {},
    message: fallbackMessage,
    status
  });
}

export function normalizeUnknownError(error: unknown): ApiClientError {
  if (error instanceof ApiClientError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiClientError({
      code: "NETWORK_ERROR",
      details: [],
      fieldErrors: {},
      message: error.message,
      status: 0
    });
  }

  return new ApiClientError({
    code: "UNKNOWN_ERROR",
    details: [],
    fieldErrors: {},
    message: "Unknown request error",
    status: 0
  });
}
