import { apiClient } from "../../shared/api/client";
import type { PaginatedResponse, QueryParams } from "../../shared/types/api";

export type CommissionStatus = "APPROVED" | "CANCELLED" | "PAID" | "PENDING";

export type CommissionRecord = {
  agentEmail: string;
  agentId: number | null;
  agentName: string;
  amount: number | null;
  calculationType: string;
  commissionRate: number | null;
  currency: string;
  id: number | string;
  paidAt: string;
  status: CommissionStatus | string;
  transactionCode: string;
  transactionId: number | null;
};

export type CommissionSearchParams = {
  agentId?: string;
  page: number;
  size: number;
  status?: string;
  transactionId?: string;
};

export type CommissionRuleRecord = {
  active: boolean;
  calculationType: string;
  currency: string;
  description: string;
  effectiveFrom: string;
  effectiveTo: string;
  id: number | string;
  name: string;
  rate: number | null;
};

export type CommissionRuleRequest = {
  active?: boolean;
  calculationType: string;
  currency?: string;
  description?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  name: string;
  rate?: number;
};

type BackendRecord = Record<string, unknown>;

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

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }

  return null;
}

function normalizeCommission(source: BackendRecord): CommissionRecord {
  const id = readNumber(source, ["id", "commissionId"]) ?? readString(source, ["id", "commissionId"]);
  const agent = isRecord(source.agent) ? source.agent : {};
  const user = isRecord(source.user) ? source.user : {};
  const transaction = isRecord(source.transaction) ? source.transaction : {};

  return {
    agentEmail: readString(source, ["agentEmail"]) || readString(agent, ["email"]) || readString(user, ["email"]),
    agentId: readNumber(source, ["agentId"]) ?? readNumber(agent, ["id", "userId"]) ?? readNumber(user, ["id", "userId"]),
    agentName:
      readString(source, ["agentName"]) ||
      readString(agent, ["fullName", "name", "email"]) ||
      readString(user, ["fullName", "name", "email"], "Assigned agent"),
    amount: readNumber(source, ["amount", "commissionAmount", "value"]),
    calculationType: readString(source, ["calculationType", "type"], "PERCENTAGE"),
    commissionRate: readNumber(source, ["commissionRate", "rate", "percentage"]),
    currency: readString(source, ["currency"], "VND"),
    id: id || readString(source, ["code"], "commission"),
    paidAt: readString(source, ["paidAt", "paymentDate", "updatedAt"]),
    status: readString(source, ["status"], "PENDING"),
    transactionCode: readString(source, ["transactionCode"]) || readString(transaction, ["code", "title"]),
    transactionId: readNumber(source, ["transactionId"]) ?? readNumber(transaction, ["id", "transactionId"])
  };
}

function normalizeCommissionRule(source: BackendRecord): CommissionRuleRecord {
  const id = readNumber(source, ["id", "ruleId"]) ?? readString(source, ["id", "ruleId"]);

  return {
    active: source.active === undefined ? true : Boolean(source.active),
    calculationType: readString(source, ["calculationType", "type"], "PERCENTAGE"),
    currency: readString(source, ["currency"], "VND"),
    description: readString(source, ["description"]),
    effectiveFrom: readString(source, ["effectiveFrom", "startDate"]),
    effectiveTo: readString(source, ["effectiveTo", "endDate"]),
    id: id || readString(source, ["name"], "rule"),
    name: readString(source, ["name", "title"], "Commission rule"),
    rate: readNumber(source, ["rate", "commissionRate", "percentage"])
  };
}

function normalizeRulePage(payload: unknown): PaginatedResponse<CommissionRuleRecord> {
  if (isRecord(payload) && Array.isArray(payload.content)) {
    return {
      content: payload.content.filter(isRecord).map(normalizeCommissionRule),
      first: Boolean(payload.first),
      last: Boolean(payload.last),
      page: Number(payload.page ?? 0),
      size: Number(payload.size ?? payload.content.length),
      totalElements: Number(payload.totalElements ?? payload.content.length),
      totalPages: Number(payload.totalPages ?? 1)
    };
  }

  if (Array.isArray(payload)) {
    const content = payload.filter(isRecord).map(normalizeCommissionRule);

    return {
      content,
      first: true,
      last: true,
      page: 0,
      size: content.length,
      totalElements: content.length,
      totalPages: 1
    };
  }

  return {
    content: [],
    first: true,
    last: true,
    page: 0,
    size: 0,
    totalElements: 0,
    totalPages: 0
  };
}

function normalizeCommissionPage(payload: unknown): PaginatedResponse<CommissionRecord> {
  if (isRecord(payload) && Array.isArray(payload.content)) {
    return {
      content: payload.content.filter(isRecord).map(normalizeCommission),
      first: Boolean(payload.first),
      last: Boolean(payload.last),
      page: Number(payload.page ?? 0),
      size: Number(payload.size ?? payload.content.length),
      totalElements: Number(payload.totalElements ?? payload.content.length),
      totalPages: Number(payload.totalPages ?? 1)
    };
  }

  if (Array.isArray(payload)) {
    const content = payload.filter(isRecord).map(normalizeCommission);

    return {
      content,
      first: true,
      last: true,
      page: 0,
      size: content.length,
      totalElements: content.length,
      totalPages: 1
    };
  }

  return {
    content: [],
    first: true,
    last: true,
    page: 0,
    size: 0,
    totalElements: 0,
    totalPages: 0
  };
}

function toQueryParams(params: CommissionSearchParams): QueryParams {
  return {
    agentId: params.agentId,
    page: params.page,
    size: params.size,
    status: params.status,
    transactionId: params.transactionId
  };
}

export function getMyCommissions(params: { page: number; size: number; status?: string }) {
  return apiClient
    .get<unknown>("/commissions/my", {
      query: {
        page: params.page,
        size: params.size,
        status: params.status
      }
    })
    .then(normalizeCommissionPage);
}

export function searchCommissions(params: CommissionSearchParams) {
  return apiClient
    .get<unknown>("/commissions", { query: toQueryParams(params) })
    .then(normalizeCommissionPage);
}

export function markCommissionPaid(commissionId: number | string) {
  return apiClient
    .patch<BackendRecord>(`/commissions/${encodeURIComponent(String(commissionId))}/mark-paid`)
    .then(normalizeCommission);
}

export function searchCommissionRules(params: { page: number; size: number }) {
  return apiClient
    .get<unknown>("/commission-rules", { query: params })
    .then(normalizeRulePage);
}

export function createCommissionRule(request: CommissionRuleRequest) {
  return apiClient
    .post<BackendRecord>("/commission-rules", request)
    .then(normalizeCommissionRule);
}

export function updateCommissionRule(ruleId: number | string, request: CommissionRuleRequest) {
  return apiClient
    .put<BackendRecord>(`/commission-rules/${encodeURIComponent(String(ruleId))}`, request)
    .then(normalizeCommissionRule);
}
