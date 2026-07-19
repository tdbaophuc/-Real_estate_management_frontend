import { apiClient } from "../../shared/api/client";
import type { QueryParams } from "../../shared/types/api";

export type ReportKind = "commissions" | "leads" | "revenue" | "transactions";

export type DateRangeParams = {
  endDate: string;
  startDate: string;
};

export type CurrencyAmount = {
  amount: number;
  count: number;
  currency: string;
};

export type CountByStatus = {
  count: number;
  status: string;
};

export type RevenueSummary = {
  completedPayments: number;
  completedTransactionValue: number;
  completedTransactions: number;
  currency: string;
  paidCommissions: number;
  verifiedDeposits: number;
};

export type RevenueReportData = {
  from: string;
  revenueSummary: RevenueSummary[];
  to: string;
};

export type LeadReportData = {
  from: string;
  leadsByStatus: CountByStatus[];
  to: string;
  totalLeads: number;
};

export type TransactionReportData = {
  completedTransactionValues: CurrencyAmount[];
  from: string;
  to: string;
  totalTransactions: number;
  transactionsByStatus: CountByStatus[];
};

export type CommissionReportData = {
  commissionAmounts: CurrencyAmount[];
  commissionsByStatus: CountByStatus[];
  from: string;
  to: string;
  totalCommissions: number;
};

type BackendRecord = Record<string, unknown>;

const reportPaths: Record<ReportKind, string> = {
  commissions: "/reports/commissions",
  leads: "/reports/leads",
  revenue: "/reports/revenue",
  transactions: "/reports/transactions"
};

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

  return 0;
}

function readRecordArray(source: BackendRecord, keys: string[]) {
  for (const key of keys) {
    const value = source[key];

    if (Array.isArray(value)) {
      return value.filter(isRecord);
    }
  }

  return [];
}

function normalizeCountByStatus(source: BackendRecord): CountByStatus {
  return {
    count: readNumber(source, ["count", "total"]),
    status: readString(source, ["status", "label", "name"], "UNKNOWN")
  };
}

function normalizeCurrencyAmount(source: BackendRecord): CurrencyAmount {
  return {
    amount: readNumber(source, ["amount", "value", "total"]),
    count: readNumber(source, ["count"]),
    currency: readString(source, ["currency"], "VND")
  };
}

function normalizeRevenueSummary(source: BackendRecord): RevenueSummary {
  return {
    completedPayments: readNumber(source, ["completedPayments"]),
    completedTransactionValue: readNumber(source, ["completedTransactionValue"]),
    completedTransactions: readNumber(source, ["completedTransactions"]),
    currency: readString(source, ["currency"], "VND"),
    paidCommissions: readNumber(source, ["paidCommissions"]),
    verifiedDeposits: readNumber(source, ["verifiedDeposits"])
  };
}

function normalizeRevenueReport(payload: unknown): RevenueReportData {
  const source = isRecord(payload) ? payload : {};

  return {
    from: readString(source, ["from"]),
    revenueSummary: readRecordArray(source, ["revenueSummary"]).map(normalizeRevenueSummary),
    to: readString(source, ["to"])
  };
}

function normalizeLeadReport(payload: unknown): LeadReportData {
  const source = isRecord(payload) ? payload : {};

  return {
    from: readString(source, ["from"]),
    leadsByStatus: readRecordArray(source, ["leadsByStatus"]).map(normalizeCountByStatus),
    to: readString(source, ["to"]),
    totalLeads: readNumber(source, ["totalLeads"])
  };
}

function normalizeTransactionReport(payload: unknown): TransactionReportData {
  const source = isRecord(payload) ? payload : {};

  return {
    completedTransactionValues: readRecordArray(source, ["completedTransactionValues"]).map(normalizeCurrencyAmount),
    from: readString(source, ["from"]),
    to: readString(source, ["to"]),
    totalTransactions: readNumber(source, ["totalTransactions"]),
    transactionsByStatus: readRecordArray(source, ["transactionsByStatus"]).map(normalizeCountByStatus)
  };
}

function normalizeCommissionReport(payload: unknown): CommissionReportData {
  const source = isRecord(payload) ? payload : {};

  return {
    commissionAmounts: readRecordArray(source, ["commissionAmounts"]).map(normalizeCurrencyAmount),
    commissionsByStatus: readRecordArray(source, ["commissionsByStatus"]).map(normalizeCountByStatus),
    from: readString(source, ["from"]),
    to: readString(source, ["to"]),
    totalCommissions: readNumber(source, ["totalCommissions"])
  };
}

function toQueryParams(params: DateRangeParams): QueryParams {
  return {
    from: params.startDate,
    to: params.endDate
  };
}

export function getRevenueReport(params: DateRangeParams) {
  return apiClient
    .get<unknown>(reportPaths.revenue, { query: toQueryParams(params) })
    .then(normalizeRevenueReport);
}

export function getLeadReport(params: DateRangeParams) {
  return apiClient
    .get<unknown>(reportPaths.leads, { query: toQueryParams(params) })
    .then(normalizeLeadReport);
}

export function getTransactionReport(params: DateRangeParams) {
  return apiClient
    .get<unknown>(reportPaths.transactions, { query: toQueryParams(params) })
    .then(normalizeTransactionReport);
}

export function getCommissionReport(params: DateRangeParams) {
  return apiClient
    .get<unknown>(reportPaths.commissions, { query: toQueryParams(params) })
    .then(normalizeCommissionReport);
}
