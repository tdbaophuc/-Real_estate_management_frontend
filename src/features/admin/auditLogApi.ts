import { apiClient } from "../../shared/api/client";
import type { PaginatedResponse, QueryParams } from "../../shared/types/api";

export type AuditLogRecord = {
  action: string;
  actorEmail: string;
  actorId: number | string | null;
  actorName: string;
  createdAt: string;
  details: string;
  id: number | string;
  ipAddress: string;
  newValue: string;
  oldValue: string;
  resourceId: string;
  resourceType: string;
};

export type AuditLogSearchParams = {
  action?: string;
  actorId?: string;
  direction?: "ASC" | "DESC";
  from?: string;
  page: number;
  resourceId?: string;
  resourceType?: string;
  size: number;
  sortBy?: string;
  to?: string;
};

type BackendRecord = Record<string, unknown>;

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

function stringifyDetails(value: unknown) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function normalizeAuditLog(source: BackendRecord): AuditLogRecord {
  const id = readNumber(source, ["id", "auditLogId"]) ?? readString(source, ["id", "auditLogId"]);
  const actorId = readNumber(source, ["actorId", "userId"]) ?? readString(source, ["actorId", "userId"]);

  return {
    action: readString(source, ["action", "eventType"], "UNKNOWN_ACTION"),
    actorEmail: readString(source, ["actorEmail", "userEmail", "email"]),
    actorId: actorId || null,
    actorName: readString(source, ["actorName", "userName", "fullName"], "System"),
    createdAt: readString(source, ["createdAt", "timestamp", "createdDate"]),
    details: stringifyDetails(source.details ?? source.metadata ?? source.payload ?? source.changeSet),
    id,
    ipAddress: readString(source, ["ipAddress", "ip"]),
    newValue: stringifyDetails(source.newValue),
    oldValue: stringifyDetails(source.oldValue),
    resourceId: readString(source, ["resourceId", "entityId", "targetId"]),
    resourceType: readString(source, ["resourceType", "entityType", "targetType"], "Resource")
  };
}

function toQueryParams(params: AuditLogSearchParams): QueryParams {
  return {
    action: params.action,
    actorId: params.actorId,
    direction: params.direction,
    from: params.from,
    page: params.page,
    resourceId: params.resourceId,
    resourceType: params.resourceType,
    size: params.size,
    sortBy: params.sortBy,
    to: params.to
  };
}

export function searchAuditLogs(params: AuditLogSearchParams) {
  return apiClient
    .get<PaginatedResponse<BackendRecord>>("/audit-logs", { query: toQueryParams(params) })
    .then((response) => ({ ...response, content: response.content.map(normalizeAuditLog) }));
}

export function getAuditLog(auditLogId: number | string) {
  return apiClient
    .get<BackendRecord>(`/audit-logs/${encodeURIComponent(String(auditLogId))}`)
    .then(normalizeAuditLog);
}
