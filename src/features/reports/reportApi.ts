import { apiClient } from "../../shared/api/client";
import type { QueryParams } from "../../shared/types/api";

export type ReportKind = "commissions" | "leads" | "revenue" | "transactions";

export type DateRangeParams = {
  endDate: string;
  startDate: string;
};

export type ReportMetric = {
  label: string;
  value: number | string;
  currency?: string;
};

export type ReportSeriesPoint = {
  label: string;
  primary: number;
  secondary?: number;
};

export type ReportTableRow = {
  amount?: number;
  currency?: string;
  date?: string;
  id: string;
  metric?: number | string;
  name: string;
  status?: string;
};

export type ReportData = {
  metrics: ReportMetric[];
  rows: ReportTableRow[];
  series: ReportSeriesPoint[];
};

type BackendRecord = Record<string, unknown>;

const reportPaths: Record<ReportKind, string> = {
  commissions: "/reports/commissions",
  leads: "/reports/leads",
  revenue: "/reports/revenue",
  transactions: "/reports/transactions"
};

const summaryKeys = ["summary", "summaries", "metrics", "cards", "totals"];
const seriesKeys = ["series", "chart", "chartData", "dataPoints", "timeline", "byDate", "items"];
const tableKeys = ["rows", "table", "tableData", "details", "records", "items", "content"];

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

  return undefined;
}

function titleFromKey(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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

function normalizeMetricFromRecord(source: BackendRecord, index: number): ReportMetric {
  const value = readNumber(source, ["value", "amount", "total", "count", "metric"]) ?? readString(source, ["value"], "0");

  return {
    currency: readString(source, ["currency"]),
    label: readString(source, ["label", "name", "title", "key"], `Metric ${index + 1}`),
    value
  };
}

function normalizeMetrics(source: unknown): ReportMetric[] {
  if (Array.isArray(source)) {
    return source.filter(isRecord).map(normalizeMetricFromRecord);
  }

  if (!isRecord(source)) {
    return [];
  }

  const nested = readRecordArray(source, summaryKeys);

  if (nested.length) {
    return nested.map(normalizeMetricFromRecord);
  }

  const ignoredKeys = new Set([...seriesKeys, ...tableKeys]);
  return Object.entries(source)
    .filter(([key, value]) => !ignoredKeys.has(key) && (typeof value === "number" || typeof value === "string"))
    .slice(0, 6)
    .map(([key, value]) => ({
      currency: key.toLowerCase().includes("revenue") || key.toLowerCase().includes("amount") ? "VND" : undefined,
      label: titleFromKey(key),
      value: typeof value === "number" ? value : String(value || "0")
    }));
}

function normalizeSeries(source: unknown): ReportSeriesPoint[] {
  const records = Array.isArray(source)
    ? source.filter(isRecord)
    : isRecord(source)
      ? readRecordArray(source, seriesKeys)
      : [];

  return records
    .map((record, index) => ({
      label: readString(record, ["label", "date", "period", "month", "status", "name"], `Point ${index + 1}`),
      primary: readNumber(record, ["primary", "value", "amount", "total", "count"]) ?? 0,
      secondary: readNumber(record, ["secondary", "commission", "paid", "closed", "won"])
    }))
    .filter((point) => point.label || point.primary || point.secondary);
}

function normalizeRows(source: unknown): ReportTableRow[] {
  const records = Array.isArray(source)
    ? source.filter(isRecord)
    : isRecord(source)
      ? readRecordArray(source, tableKeys)
      : [];

  return records.map((record, index) => ({
    amount: readNumber(record, ["amount", "totalAmount", "revenue", "commission", "value"]),
    currency: readString(record, ["currency"], "VND"),
    date: readString(record, ["date", "createdAt", "paidAt", "closedAt", "period"]),
    id: readString(record, ["id", "code", "transactionId", "leadId", "commissionId"], String(index + 1)),
    metric: readNumber(record, ["count", "rate", "score"]) ?? readString(record, ["metric", "source", "agentName"]),
    name: readString(record, ["name", "title", "label", "customerName", "agentName", "status"], `Row ${index + 1}`),
    status: readString(record, ["status", "pipelineStatus", "paymentStatus"])
  }));
}

function normalizeReportData(source: unknown): ReportData {
  return {
    metrics: normalizeMetrics(source),
    rows: normalizeRows(source),
    series: normalizeSeries(source)
  };
}

function toQueryParams(params: DateRangeParams): QueryParams {
  return {
    endDate: params.endDate,
    from: params.startDate,
    startDate: params.startDate,
    to: params.endDate
  };
}

export function getReport(kind: ReportKind, params: DateRangeParams) {
  return apiClient
    .get<unknown>(reportPaths[kind], { query: toQueryParams(params) })
    .then(normalizeReportData);
}
