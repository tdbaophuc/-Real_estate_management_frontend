import { apiClient } from "../../shared/api/client";
import type { PaginatedResponse, QueryParams } from "../../shared/types/api";

export type LeadPriority = "HIGH" | "LOW" | "MEDIUM";
export type LeadPipelineStatus =
  | "ASSIGNED"
  | "CLOSED_LOST"
  | "CLOSED_WON"
  | "CONTACTED"
  | "INTERESTED"
  | "INVALID"
  | "NEGOTIATING"
  | "NEW"
  | "VIEWING_SCHEDULED";
export type LeadActivityType = "ASSIGNMENT" | "CALL" | "CHAT" | "EMAIL" | "MEETING" | "OTHER" | "STATUS_CHANGE";

export type LeadRecord = {
  assignedAgentId: number | null;
  code: string;
  customerId: number | null;
  email: string;
  fullName: string;
  id: number | string;
  listingId: number | null;
  message: string;
  phone: string;
  pipelineStatus: LeadPipelineStatus | string;
  priority: LeadPriority | string;
  sourceCode: string;
};

export type LeadNote = {
  content: string;
  createdAt: string;
  id: number | string;
};

export type LeadActivity = {
  content: string;
  createdAt: string;
  id: number | string;
  type: LeadActivityType | string;
};

export type FollowUpTask = {
  description: string;
  dueAt: string;
  id: number | string;
  priority: string;
  status: string;
  title: string;
};

export type LeadDetail = LeadRecord & {
  activities: LeadActivity[];
  followUpTasks: FollowUpTask[];
  notes: LeadNote[];
};

export type LeadSearchParams = {
  keyword?: string;
  page: number;
  priority?: string;
  size: number;
  status?: string;
};

export type LeadCreateRequest = {
  assignedAgentId?: number;
  customerId?: number;
  email?: string;
  fullName: string;
  listingId?: number;
  message?: string;
  phone?: string;
  priority?: LeadPriority | string;
  sourceCode?: string;
};

export type LeadScore = {
  priority: string;
  reasons: string[];
  score: number | null;
  suggestedAction: string;
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

function readRecordArray(source: BackendRecord, keys: string[]) {
  for (const key of keys) {
    const value = source[key];

    if (Array.isArray(value)) {
      return value.filter((item): item is BackendRecord => Boolean(item) && typeof item === "object");
    }
  }

  return [];
}

function normalizeLead(source: BackendRecord): LeadRecord {
  const id = readNumber(source, ["id", "leadId"]) ?? readString(source, ["id", "leadId"]);

  return {
    assignedAgentId: readNumber(source, ["assignedAgentId", "agentId"]),
    code: readString(source, ["code"], String(id || "LEAD")),
    customerId: readNumber(source, ["customerId"]),
    email: readString(source, ["email"]),
    fullName: readString(source, ["fullName", "name"], "Unnamed lead"),
    id: id || readString(source, ["code", "email", "phone"]),
    listingId: readNumber(source, ["listingId"]),
    message: readString(source, ["message", "notes", "description"]),
    phone: readString(source, ["phone", "phoneNumber"]),
    pipelineStatus: readString(source, ["pipelineStatus", "status"], "NEW"),
    priority: readString(source, ["priority"], "MEDIUM"),
    sourceCode: readString(source, ["sourceCode", "source"], "MANUAL")
  };
}

function normalizeNote(source: BackendRecord, index = 0): LeadNote {
  return {
    content: readString(source, ["content", "note", "message"], "Note details are updating"),
    createdAt: readString(source, ["createdAt", "timestamp", "date"]),
    id: readNumber(source, ["id", "noteId"]) ?? readString(source, ["id", "noteId"], String(index))
  };
}

function normalizeActivity(source: BackendRecord, index = 0): LeadActivity {
  return {
    content: readString(source, ["content", "description", "message"], "Activity details are updating"),
    createdAt: readString(source, ["createdAt", "timestamp", "date"]),
    id: readNumber(source, ["id", "activityId"]) ?? readString(source, ["id", "activityId"], String(index)),
    type: readString(source, ["type", "activityType"], "OTHER")
  };
}

function normalizeTask(source: BackendRecord, index = 0): FollowUpTask {
  return {
    description: readString(source, ["description", "content"]),
    dueAt: readString(source, ["dueAt", "dueDate", "scheduledAt"]),
    id: readNumber(source, ["id", "taskId"]) ?? readString(source, ["id", "taskId"], String(index)),
    priority: readString(source, ["priority"], "MEDIUM"),
    status: readString(source, ["status"], "PENDING"),
    title: readString(source, ["title", "content", "description"], "Follow-up task")
  };
}

function normalizeLeadDetail(source: BackendRecord): LeadDetail {
  return {
    ...normalizeLead(source),
    activities: readRecordArray(source, ["activities", "leadActivities"]).map(normalizeActivity),
    followUpTasks: readRecordArray(source, ["followUpTasks", "tasks"]).map(normalizeTask),
    notes: readRecordArray(source, ["notes", "leadNotes"]).map(normalizeNote)
  };
}

function normalizeScore(source: BackendRecord): LeadScore {
  const reasons = readRecordArray(source, ["reasons", "signals"]).map((item) =>
    readString(item, ["text", "message", "reason"])
  );

  return {
    priority: readString(source, ["priority"], "MEDIUM"),
    reasons: reasons.filter(Boolean),
    score: readNumber(source, ["score", "leadScore"]),
    suggestedAction: readString(source, ["suggestedAction", "nextAction", "recommendation"])
  };
}

function toQueryParams(params: LeadSearchParams): QueryParams {
  return {
    keyword: params.keyword,
    page: params.page,
    priority: params.priority,
    size: params.size,
    status: params.status
  };
}

export function searchLeads(params: LeadSearchParams) {
  return apiClient
    .get<PaginatedResponse<BackendRecord>>("/leads", { query: toQueryParams(params) })
    .then((response) => ({ ...response, content: response.content.map(normalizeLead) }));
}

export function createLead(request: LeadCreateRequest) {
  return apiClient.post<BackendRecord>("/leads", request).then(normalizeLeadDetail);
}

export function getLead(leadId: number | string) {
  return apiClient
    .get<BackendRecord>(`/leads/${encodeURIComponent(String(leadId))}`)
    .then(normalizeLeadDetail);
}

export function assignLead(leadId: number | string, assignedAgentId: number) {
  return apiClient
    .patch<BackendRecord>(`/leads/${encodeURIComponent(String(leadId))}/assign`, { assignedAgentId })
    .then(normalizeLeadDetail);
}

export function updateLeadStatus(leadId: number | string, status: string) {
  return apiClient
    .patch<BackendRecord>(`/leads/${encodeURIComponent(String(leadId))}/status`, { status })
    .then(normalizeLeadDetail);
}

export function addLeadNote(leadId: number | string, content: string) {
  return apiClient
    .post<BackendRecord>(`/leads/${encodeURIComponent(String(leadId))}/notes`, { content })
    .then(normalizeNote);
}

export function addLeadActivity(leadId: number | string, request: { content: string; type: LeadActivityType }) {
  return apiClient
    .post<BackendRecord>(`/leads/${encodeURIComponent(String(leadId))}/activities`, request)
    .then(normalizeActivity);
}

export function createFollowUpTask(
  leadId: number | string,
  request: { assignedAgentId?: number; description?: string; dueAt?: string; priority?: string; title: string }
) {
  return apiClient
    .post<BackendRecord>(`/leads/${encodeURIComponent(String(leadId))}/follow-up-tasks`, request)
    .then(normalizeTask);
}

export function scoreLead(leadId: number | string) {
  return apiClient
    .post<BackendRecord>(`/ai/leads/${encodeURIComponent(String(leadId))}/score`, { language: "vi" })
    .then(normalizeScore);
}
