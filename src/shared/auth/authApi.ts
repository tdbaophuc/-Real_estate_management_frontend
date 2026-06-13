import { apiClient } from "../api/client";
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

type AuthTokenResponse = Partial<AuthSession> & {
  accessToken: string;
  expiresIn?: number;
  user?: BackendUser;
};

type BackendRole = RoleCode | { code?: RoleCode; name?: RoleCode; roleCode?: RoleCode };

type BackendUser = {
  email: string;
  fullName?: string;
  id?: number;
  roles?: BackendRole[];
};

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
    email: user.email,
    fullName: user.fullName ?? user.email,
    id: user.id ?? 0,
    roles: (user.roles ?? []).map(normalizeRole).filter((role): role is RoleCode => Boolean(role))
  };
}

export const authApi = {
  getMe: () => apiClient.get<BackendUser>("/auth/me").then(normalizeCurrentUser),
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
    })
};

