import { API_BASE_URL } from "./config";
import { normalizeApiError, normalizeUnknownError } from "./errors";
import { buildFormData, buildQueryString } from "./query";
import type { AuthSession } from "../types/auth";
import type { ApiResponse, FormDataFields, QueryParams } from "../types/api";

type HttpMethod = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

type ApiRequestOptions = Omit<RequestInit, "body" | "method"> & {
  body?: BodyInit | Record<string, unknown> | unknown[] | null;
  method?: HttpMethod;
  query?: QueryParams;
  skipAuth?: boolean;
  skipRefresh?: boolean;
};

type ApiAuthConfig = {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  onRefresh: (session: AuthSession) => void;
  onUnauthorized: () => void;
};

type RefreshTokenResponse = Partial<AuthSession> & {
  accessToken: string;
  expiresIn?: number;
};

let authConfig: ApiAuthConfig | null = null;
let refreshPromise: Promise<AuthSession> | null = null;

export function configureApiClientAuth(config: ApiAuthConfig | null) {
  authConfig = config;
}

function createUrl(path: string, query?: QueryParams) {
  if (/^https?:\/\//.test(path)) {
    return `${path}${buildQueryString(query)}`;
  }

  const normalizedBase = API_BASE_URL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}${buildQueryString(query)}`;
}

function createHeaders(options: ApiRequestOptions, hasJsonBody: boolean) {
  const headers = new Headers(options.headers);

  if (!options.skipAuth) {
    const accessToken = authConfig?.getAccessToken();

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  if (hasJsonBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  return headers;
}

function createBody(body: ApiRequestOptions["body"]) {
  if (body === null || body === undefined) {
    return { body: undefined, hasJsonBody: false };
  }

  if (
    typeof body === "string" ||
    body instanceof Blob ||
    body instanceof FormData ||
    body instanceof URLSearchParams
  ) {
    return { body, hasJsonBody: false };
  }

  return {
    body: JSON.stringify(body),
    hasJsonBody: true
  };
}

async function parseResponse(response: Response) {
  if (response.status === 204) {
    return undefined;
  }

  const text = await response.text();

  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function isApiEnvelope<T>(body: unknown): body is ApiResponse<T> {
  return Boolean(
    body &&
      typeof body === "object" &&
      "success" in body &&
      "code" in body &&
      "message" in body
  );
}

async function executeRequest<T>(path: string, options: ApiRequestOptions = {}) {
  const { query, skipAuth, skipRefresh, ...fetchOptions } = options;
  const { body, hasJsonBody } = createBody(options.body);
  const response = await fetch(createUrl(path, query), {
    ...fetchOptions,
    body,
    headers: createHeaders(options, hasJsonBody),
    method: options.method ?? "GET"
  });
  const parsedBody = await parseResponse(response);

  if (!response.ok) {
    throw normalizeApiError(response.status, parsedBody, response.statusText);
  }

  if (isApiEnvelope<T>(parsedBody)) {
    if (!parsedBody.success) {
      throw normalizeApiError(response.status, parsedBody, parsedBody.message);
    }

    return parsedBody.data;
  }

  return parsedBody as T;
}

async function refreshAccessToken() {
  const refreshToken = authConfig?.getRefreshToken();

  if (!refreshToken) {
    throw normalizeApiError(401, undefined, "Missing refresh token");
  }

  const session = await executeRequest<RefreshTokenResponse>("/auth/refresh-token", {
    body: { refreshToken },
    method: "POST",
    skipAuth: true,
    skipRefresh: true
  });
  const nextSession = {
    accessToken: session.accessToken,
    expiresInSeconds: session.expiresInSeconds ?? session.expiresIn ?? 0,
    refreshToken: session.refreshToken ?? refreshToken
  };

  authConfig?.onRefresh(nextSession);
  return nextSession;
}

function refreshAccessTokenQueued() {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}) {
  try {
    return await executeRequest<T>(path, options);
  } catch (error) {
    const normalizedError = normalizeUnknownError(error);

    if (
      normalizedError.status === 401 &&
      !options.skipRefresh &&
      path !== "/auth/refresh-token"
    ) {
      try {
        await refreshAccessTokenQueued();
        return await executeRequest<T>(path, options);
      } catch (refreshError) {
        authConfig?.onUnauthorized();
        throw normalizeUnknownError(refreshError);
      }
    }

    throw normalizedError;
  }
}

export const apiClient = {
  delete: <T>(path: string, options?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...options, method: "DELETE" }),
  get: <T>(path: string, options?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...options, method: "GET" }),
  patch: <T>(path: string, body?: ApiRequestOptions["body"], options?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...options, body, method: "PATCH" }),
  post: <T>(path: string, body?: ApiRequestOptions["body"], options?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...options, body, method: "POST" }),
  put: <T>(path: string, body?: ApiRequestOptions["body"], options?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...options, body, method: "PUT" }),
  upload: <T>(path: string, fields: FormDataFields, options?: ApiRequestOptions) =>
    apiRequest<T>(path, {
      ...options,
      body: buildFormData(fields),
      method: options?.method ?? "POST"
    })
};
