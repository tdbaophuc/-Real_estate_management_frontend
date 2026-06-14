import { apiClient } from "../../shared/api/client";
import type { PaginatedResponse, QueryParams } from "../../shared/types/api";

export type TransactionStatus =
  | "CANCELLED"
  | "COMPLETED"
  | "CONTRACT_SIGNED"
  | "DEPOSITED"
  | "PAYMENT_IN_PROGRESS"
  | "PENDING"
  | "REFUNDED";

export type MoneyRecord = {
  amount: number | null;
  currency: string;
  date: string;
  id: number | string;
  notes: string;
};

export type PaymentRecord = MoneyRecord & {
  method: string;
  referenceNumber: string;
};

export type PaymentScheduleRecord = MoneyRecord & {
  dueDate: string;
  status: string;
};

export type InvoiceRecord = {
  id: number | string;
  invoiceNumber: string;
  issuedAt: string;
  notes: string;
};

export type ReceiptRecord = {
  id: number | string;
  issuedAt: string;
  notes: string;
  receiptNumber: string;
};

export type TransactionRecord = {
  code: string;
  contractId: number | null;
  currency: string;
  customerId: number | null;
  deposits: MoneyRecord[];
  id: number | string;
  invoices: InvoiceRecord[];
  payments: PaymentRecord[];
  paymentSchedules: PaymentScheduleRecord[];
  propertyId: number | null;
  receipts: ReceiptRecord[];
  status: TransactionStatus | string;
  title: string;
  totalAmount: number | null;
};

export type TransactionSearchParams = {
  keyword?: string;
  page: number;
  size: number;
  status?: string;
};

export type TransactionCreateRequest = {
  code: string;
  contractId?: number;
  currency: string;
  customerId?: number;
  propertyId?: number;
  title: string;
  totalAmount?: number;
};

export type MoneyRequest = {
  amount: number;
  currency: string;
  date?: string;
  idempotencyKey?: string;
  notes?: string;
};

export type PaymentRequest = MoneyRequest & {
  method?: string;
  referenceNumber?: string;
};

export type PaymentScheduleRequest = {
  amount: number;
  currency: string;
  dueDate: string;
  notes?: string;
};

export type InvoiceRequest = {
  invoiceNumber?: string;
  issuedAt?: string;
  notes?: string;
};

export type ReceiptRequest = {
  issuedAt?: string;
  notes?: string;
  receiptNumber?: string;
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

function normalizeMoney(source: BackendRecord, index = 0): MoneyRecord {
  return {
    amount: readNumber(source, ["amount", "value"]),
    currency: readString(source, ["currency"], "VND"),
    date: readString(source, ["date", "createdAt", "paidAt", "depositedAt"]),
    id: readNumber(source, ["id", "depositId"]) ?? readString(source, ["id", "depositId"], String(index)),
    notes: readString(source, ["notes", "description"])
  };
}

function normalizePayment(source: BackendRecord, index = 0): PaymentRecord {
  return {
    ...normalizeMoney(source, index),
    method: readString(source, ["method", "paymentMethod"], "OFFLINE"),
    referenceNumber: readString(source, ["referenceNumber", "reference", "externalReference"])
  };
}

function normalizeSchedule(source: BackendRecord, index = 0): PaymentScheduleRecord {
  return {
    ...normalizeMoney(source, index),
    dueDate: readString(source, ["dueDate", "date"]),
    status: readString(source, ["status"], "PENDING")
  };
}

function normalizeInvoice(source: BackendRecord, index = 0): InvoiceRecord {
  return {
    id: readNumber(source, ["id", "invoiceId"]) ?? readString(source, ["id", "invoiceId"], String(index)),
    invoiceNumber: readString(source, ["invoiceNumber", "number"], "Invoice"),
    issuedAt: readString(source, ["issuedAt", "createdAt"]),
    notes: readString(source, ["notes", "description"])
  };
}

function normalizeReceipt(source: BackendRecord, index = 0): ReceiptRecord {
  return {
    id: readNumber(source, ["id", "receiptId"]) ?? readString(source, ["id", "receiptId"], String(index)),
    issuedAt: readString(source, ["issuedAt", "createdAt"]),
    notes: readString(source, ["notes", "description"]),
    receiptNumber: readString(source, ["receiptNumber", "number"], "Receipt")
  };
}

function normalizeTransaction(source: BackendRecord): TransactionRecord {
  const id = readNumber(source, ["id", "transactionId"]) ?? readString(source, ["id", "transactionId"]);

  return {
    code: readString(source, ["code"], String(id || "TRANSACTION")),
    contractId: readNumber(source, ["contractId"]),
    currency: readString(source, ["currency"], "VND"),
    customerId: readNumber(source, ["customerId"]),
    deposits: readRecordArray(source, ["deposits"]).map(normalizeMoney),
    id: id || readString(source, ["code", "title"]),
    invoices: readRecordArray(source, ["invoices"]).map(normalizeInvoice),
    payments: readRecordArray(source, ["payments"]).map(normalizePayment),
    paymentSchedules: readRecordArray(source, ["paymentSchedules", "schedules"]).map(normalizeSchedule),
    propertyId: readNumber(source, ["propertyId"]),
    receipts: readRecordArray(source, ["receipts"]).map(normalizeReceipt),
    status: readString(source, ["status"], "PENDING"),
    title: readString(source, ["title", "name"], "Untitled transaction"),
    totalAmount: readNumber(source, ["totalAmount", "amount", "value"])
  };
}

function toQueryParams(params: TransactionSearchParams): QueryParams {
  return {
    keyword: params.keyword,
    page: params.page,
    size: params.size,
    status: params.status
  };
}

export function createIdempotencyKey(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function searchTransactions(params: TransactionSearchParams) {
  return apiClient
    .get<PaginatedResponse<BackendRecord>>("/transactions", { query: toQueryParams(params) })
    .then((response) => ({ ...response, content: response.content.map(normalizeTransaction) }));
}

export function getTransaction(transactionId: number | string) {
  return apiClient
    .get<BackendRecord>(`/transactions/${encodeURIComponent(String(transactionId))}`)
    .then(normalizeTransaction);
}

export function createTransaction(request: TransactionCreateRequest) {
  return apiClient.post<BackendRecord>("/transactions", request).then(normalizeTransaction);
}

export function updateTransactionStatus(transactionId: number | string, status: string) {
  return apiClient
    .patch<BackendRecord>(`/transactions/${encodeURIComponent(String(transactionId))}/status`, { status })
    .then(normalizeTransaction);
}

export function addDeposit(transactionId: number | string, request: MoneyRequest) {
  return apiClient
    .post<BackendRecord>(`/transactions/${encodeURIComponent(String(transactionId))}/deposits`, request)
    .then(normalizeMoney);
}

export function addPaymentSchedule(transactionId: number | string, request: PaymentScheduleRequest) {
  return apiClient
    .post<BackendRecord>(`/transactions/${encodeURIComponent(String(transactionId))}/payment-schedules`, request)
    .then(normalizeSchedule);
}

export function addPayment(transactionId: number | string, request: PaymentRequest) {
  return apiClient
    .post<BackendRecord>(`/transactions/${encodeURIComponent(String(transactionId))}/payments`, request)
    .then(normalizePayment);
}

export function addInvoice(transactionId: number | string, request: InvoiceRequest) {
  return apiClient
    .post<BackendRecord>(`/transactions/${encodeURIComponent(String(transactionId))}/invoices`, request)
    .then(normalizeInvoice);
}

export function addReceipt(transactionId: number | string, paymentId: number | string, request: ReceiptRequest) {
  return apiClient
    .post<BackendRecord>(
      `/transactions/${encodeURIComponent(String(transactionId))}/payments/${encodeURIComponent(String(paymentId))}/receipt`,
      request
    )
    .then(normalizeReceipt);
}
