import { apiClient } from "../../shared/api/client";
import type { PaginatedResponse, QueryParams } from "../../shared/types/api";

export type FollowUpTaskPriority = "HIGH" | "LOW" | "MEDIUM";
export type FollowUpTaskStatus = "CANCELLED" | "COMPLETED" | "OPEN" | "OVERDUE" | "PENDING";

export type FollowUpTaskRecord = {
  assignedAgentId: number | null;
  completedAt: string;
  createdAt: string;
  creatorId: number | null;
  description: string;
  dueAt: string;
  id: number | string;
  leadId: number | null;
  priority: FollowUpTaskPriority | string;
  status: FollowUpTaskStatus | string;
  title: string;
  updatedAt: string;
};

export type FollowUpTaskSearchParams = {
  assignedAgentId?: number | string;
  dueFrom?: string;
  dueTo?: string;
  keyword?: string;
  leadId?: number | string;
  page: number;
  priority?: string;
  size: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
  status?: string;
};

export type FollowUpTaskUpdateRequest = {
  assignedAgentId?: number;
  description?: string;
  dueAt?: string;
  priority: FollowUpTaskPriority | string;
  title: string;
};

export type FollowUpTaskStatusRequest = {
  completedAt?: string;
  status: FollowUpTaskStatus | string;
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

function readNestedRecord(source: BackendRecord, key: string) {
  const value = source[key];
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as BackendRecord)
    : null;
}

export function normalizeFollowUpTask(source: BackendRecord): FollowUpTaskRecord {
  const id = readNumber(source, ["id", "taskId"]) ?? readString(source, ["id", "taskId"]);
  const lead = readNestedRecord(source, "lead");
  const assignee = readNestedRecord(source, "assignedAgent") ?? readNestedRecord(source, "assignee");
  const creator = readNestedRecord(source, "creator") ?? readNestedRecord(source, "createdBy");

  return {
    assignedAgentId: readNumber(source, ["assignedAgentId", "assigneeId"]) ?? (assignee ? readNumber(assignee, ["id", "userId"]) : null),
    completedAt: readString(source, ["completedAt"]),
    createdAt: readString(source, ["createdAt"]),
    creatorId: readNumber(source, ["creatorId", "createdById"]) ?? (creator ? readNumber(creator, ["id", "userId"]) : null),
    description: readString(source, ["description", "content"]),
    dueAt: readString(source, ["dueAt", "dueDate", "scheduledAt"]),
    id: id || readString(source, ["title"]),
    leadId: readNumber(source, ["leadId"]) ?? (lead ? readNumber(lead, ["id", "leadId"]) : null),
    priority: readString(source, ["priority"], "MEDIUM"),
    status: readString(source, ["status"], "PENDING"),
    title: readString(source, ["title", "name", "content"], "Follow-up task"),
    updatedAt: readString(source, ["updatedAt"])
  };
}

function toQueryParams(params: FollowUpTaskSearchParams): QueryParams {
  return {
    assignedAgentId: params.assignedAgentId,
    dueFrom: params.dueFrom,
    dueTo: params.dueTo,
    keyword: params.keyword,
    leadId: params.leadId,
    page: params.page,
    priority: params.priority,
    size: params.size,
    sortBy: params.sortBy,
    sortDirection: params.sortDirection,
    status: params.status
  };
}

export function searchFollowUpTasks(params: FollowUpTaskSearchParams) {
  return apiClient
    .get<PaginatedResponse<BackendRecord>>("/follow-up-tasks", { query: toQueryParams(params) })
    .then((response) => ({
      ...response,
      content: response.content.map(normalizeFollowUpTask)
    }));
}

export function searchMyFollowUpTasks(params: FollowUpTaskSearchParams) {
  return apiClient
    .get<PaginatedResponse<BackendRecord>>("/follow-up-tasks/my", { query: toQueryParams(params) })
    .then((response) => ({
      ...response,
      content: response.content.map(normalizeFollowUpTask)
    }));
}

export function getFollowUpTask(taskId: number | string) {
  return apiClient
    .get<BackendRecord>(`/follow-up-tasks/${encodeURIComponent(String(taskId))}`)
    .then(normalizeFollowUpTask);
}

export function updateFollowUpTask(taskId: number | string, request: FollowUpTaskUpdateRequest) {
  return apiClient
    .put<BackendRecord>(`/follow-up-tasks/${encodeURIComponent(String(taskId))}`, request)
    .then(normalizeFollowUpTask);
}

export function updateFollowUpTaskStatus(taskId: number | string, request: FollowUpTaskStatusRequest) {
  return apiClient
    .patch<BackendRecord>(`/follow-up-tasks/${encodeURIComponent(String(taskId))}/status`, request)
    .then(normalizeFollowUpTask);
}

export function cancelFollowUpTask(taskId: number | string) {
  return apiClient.delete<void>(`/follow-up-tasks/${encodeURIComponent(String(taskId))}`);
}
