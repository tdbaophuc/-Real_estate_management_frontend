import { apiClient, refreshAuthSession } from "../api/client";
import type { AuthSession, CurrentUser, RoleCode } from "../types/auth";

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  fullName: string;
  password: string;
  phone?: string;
};

export type UpdateProfileRequest = {
  fullName: string;
  phone?: string;
};

export type ChangePasswordRequest = {
  confirmPassword: string;
  currentPassword: string;
  newPassword: string;
};

export type AuthSessionRecord = {
  createdAt: string;
  expiresAt: string;
  id: number | string;
};

type AuthTokenResponse = Partial<AuthSession> & {
  accessToken: string;
  expiresIn?: number;
  user?: BackendUser;
};

type BackendRole = RoleCode | { code?: RoleCode; name?: RoleCode; roleCode?: RoleCode };

type BackendUser = {
  avatarUrl?: string;
  email: string;
  fullName?: string;
  id?: number;
  phone?: string;
  roles?: BackendRole[];
};

type BackendRecord = Record<string, unknown>;

function readString(source: BackendRecord, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return fallback;
}

function readNumber(source: BackendRecord, keys: string[]) {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "number") {
      return value;
    }

    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }

  return null;
}

function normalizeSession(response: AuthTokenResponse): AuthSession {
  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken ?? "",
    expiresInSeconds: response.expiresInSeconds ?? response.expiresIn ?? 0
  };
}

function normalizeRole(role: BackendRole): RoleCode | null {
  if (typeof role === "string") {
    return role;
  }

  return role.code ?? role.roleCode ?? role.name ?? null;
}

export function normalizeCurrentUser(user: BackendUser): CurrentUser {
  return {
    avatarUrl: user.avatarUrl,
    email: user.email,
    fullName: user.fullName ?? user.email,
    id: user.id ?? 0,
    phone: user.phone,
    roles: (user.roles ?? []).map(normalizeRole).filter((role): role is RoleCode => Boolean(role))
  };
}

function normalizeAuthSessionRecord(source: BackendRecord, index = 0): AuthSessionRecord {
  return {
    createdAt: readString(source, ["createdAt", "createdDate"]),
    expiresAt: readString(source, ["expiresAt", "expiresDate"]),
    id: readNumber(source, ["id", "sessionId"]) ?? readString(source, ["id", "sessionId"], String(index))
  };
}

function normalizeUserResponse(response: BackendUser | { user?: BackendUser }) {
  const nextUser = "user" in response && response.user ? response.user : response as BackendUser;
  return normalizeCurrentUser(nextUser);
}

export const authApi = {
  changePassword: (request: ChangePasswordRequest) =>
    apiClient.post<void>("/auth/me/change-password", request),
  deleteAvatar: () => apiClient.delete<void>("/auth/me/avatar"),
  getMe: () => apiClient.get<BackendUser>("/auth/me").then(normalizeCurrentUser),
  getSessions: () =>
    apiClient
      .get<BackendRecord[]>("/auth/me/sessions")
      .then((sessions) => (Array.isArray(sessions) ? sessions.map(normalizeAuthSessionRecord) : [])),
  login: (request: LoginRequest) =>
    apiClient
      .post<AuthTokenResponse>("/auth/login", request, { skipAuth: true, skipRefresh: true })
      .then((response) => ({
        session: normalizeSession(response),
        user: response.user ? normalizeCurrentUser(response.user) : null
      })),
  logout: (refreshToken?: string) =>
    apiClient.post<void>(
      "/auth/logout",
      refreshToken ? { refreshToken } : undefined,
      { skipRefresh: true }
    ),
  register: (request: RegisterRequest) =>
    apiClient.post<unknown>("/auth/register", request, {
      skipAuth: true,
      skipRefresh: true
    }),
  refreshToken: (refreshToken: string) => refreshAuthSession(refreshToken),
  revokeAllSessions: () => apiClient.delete<void>("/auth/me/sessions"),
  revokeSession: (sessionId: number | string) =>
    apiClient.delete<void>(`/auth/me/sessions/${encodeURIComponent(String(sessionId))}`),
  updateProfile: (request: UpdateProfileRequest) =>
    apiClient.patch<BackendUser | { user?: BackendUser }>("/auth/me/profile", request).then(normalizeUserResponse),
  uploadAvatar: (file: File) =>
    apiClient.upload<BackendUser | { user?: BackendUser }>("/auth/me/avatar", { file }).then(normalizeUserResponse)
};
