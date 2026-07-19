import { apiClient } from "../../shared/api/client";
import type { PaginatedResponse, QueryParams } from "../../shared/types/api";

export type CommissionStatus = "APPROVED" | "CANCELLED" | "PAID" | "PENDING";

export type CommissionRecord = {
  amount: number | null;
  approvedAt: string;
  approvedById: number | null;
  approvedByName: string;
  baseAmount: number | null;
  beneficiaryName: string;
  beneficiaryUserId: number | null;
  calculationType: string;
  commissionRuleCode: string;
  commissionRuleId: number | null;
  createdAt: string;
  currency: string;
  id: number | string;
  notes: string;
  paidAt: string;
  paidById: number | null;
  paidByName: string;
  paymentReference: string;
  rate: number | null;
  status: CommissionStatus | string;
  transactionCode: string;
  transactionId: number | null;
  transactionType: string;
  updatedAt: string;
};

export type CommissionSearchParams = {
  beneficiaryUserId?: string;
  direction?: "ASC" | "DESC";
  page: number;
  size: number;
  sortBy?: string;
  status?: string;
  transactionId?: string;
};

export type CommissionMarkPaidRequest = {
  notes?: string;
  paidAt?: string;
  paymentReference?: string;
};

export type CommissionRuleRecord = {
  active: boolean;
  calculationType: string;
  code: string;
  currency: string;
  description: string;
  effectiveFrom: string;
  effectiveTo: string;
  fixedAmount: number | null;
  id: number | string;
  maxTransactionValue: number | null;
  minTransactionValue: number | null;
  name: string;
  priority: number | null;
  rate: number | null;
  transactionType: string;
};

export type CommissionRuleRequest = {
  active?: boolean;
  calculationType: string;
  code: string;
  currency?: string;
  description?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  fixedAmount?: number;
  maxTransactionValue?: number;
  minTransactionValue?: number;
  name: string;
  priority?: number;
  rate?: number;
  transactionType: string;
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
  const transaction = isRecord(source.transaction) ? source.transaction : {};

  return {
    amount: readNumber(source, ["amount", "commissionAmount", "value"]),
    approvedAt: readString(source, ["approvedAt"]),
    approvedById: readNumber(source, ["approvedById"]),
    approvedByName: readString(source, ["approvedByName"]),
    baseAmount: readNumber(source, ["baseAmount"]),
    beneficiaryName: readString(source, ["beneficiaryName", "agentName", "userName"], "Beneficiary updating"),
    beneficiaryUserId: readNumber(source, ["beneficiaryUserId", "agentId", "userId"]),
    calculationType: readString(source, ["calculationType", "type"], "PERCENTAGE"),
    commissionRuleCode: readString(source, ["commissionRuleCode"]),
    commissionRuleId: readNumber(source, ["commissionRuleId"]),
    createdAt: readString(source, ["createdAt"]),
    currency: readString(source, ["currency"], "VND"),
    id: id || readString(source, ["code"], "commission"),
    notes: readString(source, ["notes"]),
    paidAt: readString(source, ["paidAt", "paymentDate", "updatedAt"]),
    paidById: readNumber(source, ["paidById"]),
    paidByName: readString(source, ["paidByName"]),
    paymentReference: readString(source, ["paymentReference"]),
    rate: readNumber(source, ["rate", "commissionRate", "percentage"]),
    status: readString(source, ["status"], "PENDING"),
    transactionCode: readString(source, ["transactionCode"]) || readString(transaction, ["code", "title"]),
    transactionId: readNumber(source, ["transactionId"]) ?? readNumber(transaction, ["id", "transactionId"]),
    transactionType: readString(source, ["transactionType"]) || readString(transaction, ["transactionType", "type"]),
    updatedAt: readString(source, ["updatedAt"])
  };
}

function normalizeCommissionRule(source: BackendRecord): CommissionRuleRecord {
  const id = readNumber(source, ["id", "ruleId"]) ?? readString(source, ["id", "ruleId"]);

  return {
    active: source.active === undefined ? true : Boolean(source.active),
    calculationType: readString(source, ["calculationType", "type"], "PERCENTAGE"),
    code: readString(source, ["code"]),
    currency: readString(source, ["currency"], "VND"),
    description: readString(source, ["description"]),
    effectiveFrom: readString(source, ["effectiveFrom", "startDate"]),
    effectiveTo: readString(source, ["effectiveTo", "endDate"]),
    fixedAmount: readNumber(source, ["fixedAmount"]),
    id: id || readString(source, ["name"], "rule"),
    maxTransactionValue: readNumber(source, ["maxTransactionValue"]),
    minTransactionValue: readNumber(source, ["minTransactionValue"]),
    name: readString(source, ["name", "title"], "Commission rule"),
    priority: readNumber(source, ["priority"]),
    rate: readNumber(source, ["rate", "commissionRate", "percentage"]),
    transactionType: readString(source, ["transactionType"], "SALE")
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
    beneficiaryUserId: params.beneficiaryUserId,
    direction: params.direction,
    page: params.page,
    size: params.size,
    sortBy: params.sortBy,
    status: params.status,
    transactionId: params.transactionId
  };
}

export function getMyCommissions(params: CommissionSearchParams) {
  return apiClient
    .get<unknown>("/commissions/my", {
      query: toQueryParams(params)
    })
    .then(normalizeCommissionPage);
}

export function searchCommissions(params: CommissionSearchParams) {
  return apiClient
    .get<unknown>("/commissions", { query: toQueryParams(params) })
    .then(normalizeCommissionPage);
}

export function markCommissionPaid(commissionId: number | string, request: CommissionMarkPaidRequest) {
  return apiClient
    .patch<BackendRecord>(`/commissions/${encodeURIComponent(String(commissionId))}/mark-paid`, request)
    .then(normalizeCommission);
}

export function searchCommissionRules(params: { active?: boolean; direction?: "ASC" | "DESC"; page: number; size: number; sortBy?: string; transactionType?: string }) {
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
