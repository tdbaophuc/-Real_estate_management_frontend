import type { ApiFieldError, NormalizedApiError } from "../types/api";

export class ApiClientError extends Error implements NormalizedApiError {
  code: string;
  fieldErrors: Record<string, string>;
  status: number;

  constructor(error: NormalizedApiError) {
    super(error.message);
    this.name = "ApiClientError";
    this.code = error.code;
    this.fieldErrors = error.fieldErrors;
    this.status = error.status;
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
    };

    return new ApiClientError({
      code: payload.code ?? `HTTP_${status}`,
      fieldErrors: mapFieldErrors(payload.errors),
      message: payload.message ?? fallbackMessage,
      status
    });
  }

  return new ApiClientError({
    code: `HTTP_${status}`,
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
      fieldErrors: {},
      message: error.message,
      status: 0
    });
  }

  return new ApiClientError({
    code: "UNKNOWN_ERROR",
    fieldErrors: {},
    message: "Unknown request error",
    status: 0
  });
}

