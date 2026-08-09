import { apiClient } from "../../shared/api/client";
import type { RoleCode } from "../../shared/types/auth";
import type { PaginatedResponse, QueryParams } from "../../shared/types/api";

export type UserStatus = "ACTIVE" | "INACTIVE" | "LOCKED" | "PENDING_VERIFICATION";

export type AdminUserRecord = {
  createdAt: string;
  email: string;
  fullName: string;
  id: number | string;
  phone: string;
  roles: RoleCode[];
  status: UserStatus | string;
  updatedAt: string;
};

export type AdminUserSearchParams = {
  keyword?: string;
  page: number;
  role?: string;
  size: number;
  status?: string;
};

type BackendRecord = Record<string, unknown>;

const roleCodes: RoleCode[] = ["ADMIN", "MANAGER", "AGENT", "CUSTOMER", "OWNER"];

function isRecord(value: unknown): value is BackendRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readString(source: BackendRecord, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }

    if (typeof value === "number") {
      return String(value);
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

function normalizeRole(role: unknown): RoleCode | null {
  if (typeof role === "string" && roleCodes.includes(role as RoleCode)) {
    return role as RoleCode;
  }

  if (isRecord(role)) {
    const value = readString(role, ["code", "name", "roleCode"]);
    return roleCodes.includes(value as RoleCode) ? (value as RoleCode) : null;
  }

  return null;
}

function normalizeRoles(source: BackendRecord) {
  const roles = source.roles;

  if (!Array.isArray(roles)) {
    return [];
  }

  return roles.map(normalizeRole).filter((role): role is RoleCode => Boolean(role));
}

function normalizeUser(source: BackendRecord): AdminUserRecord {
  const id = readNumber(source, ["id", "userId"]) ?? readString(source, ["id", "userId", "email"]);

  return {
    createdAt: readString(source, ["createdAt", "createdDate"]),
    email: readString(source, ["email"]),
    fullName: readString(source, ["fullName", "name", "displayName"], "Unnamed user"),
    id,
    phone: readString(source, ["phone", "phoneNumber"]),
    roles: normalizeRoles(source),
    status: readString(source, ["status"], "PENDING_VERIFICATION"),
    updatedAt: readString(source, ["updatedAt", "modifiedDate"])
  };
}

function toQueryParams(params: AdminUserSearchParams): QueryParams {
  return {
    keyword: params.keyword,
    page: params.page,
    role: params.role,
    size: params.size,
    status: params.status
  };
}

export const adminRoleCodes = roleCodes;

export function searchAdminUsers(params: AdminUserSearchParams) {
  return apiClient
    .get<PaginatedResponse<BackendRecord>>("/admin/users", { query: toQueryParams(params) })
    .then((response) => ({ ...response, content: response.content.map(normalizeUser) }));
}

export function getAdminUser(userId: number | string) {
  return apiClient
    .get<BackendRecord>(`/admin/users/${encodeURIComponent(String(userId))}`)
    .then(normalizeUser);
}

export function updateAdminUserStatus(userId: number | string, status: string) {
  return apiClient
    .patch<BackendRecord>(`/admin/users/${encodeURIComponent(String(userId))}/status`, { status })
    .then(normalizeUser);
}

export function updateAdminUserRoles(userId: number | string, roles: RoleCode[]) {
  return apiClient
    .put<BackendRecord>(`/admin/users/${encodeURIComponent(String(userId))}/roles`, { roles })
    .then(normalizeUser);
}
