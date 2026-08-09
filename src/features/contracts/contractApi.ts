import { apiClient } from "../../shared/api/client";
import type { PaginatedResponse, QueryParams } from "../../shared/types/api";

export type ContractStatus =
  | "ACTIVE"
  | "CANCELLED"
  | "DRAFT"
  | "EXPIRED"
  | "PENDING_REVIEW"
  | "PENDING_SIGNATURE"
  | "SIGNED"
  | "TERMINATED";
export type ContractType = "LEASE" | "SALE";
export type ContractDocumentType = "ATTACHMENT" | "DRAFT" | "FINAL" | "SIGNED";
export type ContractWorkflowAction = "approve" | "cancel" | "mark-signed" | "submit-review";

export type ContractDocument = {
  description: string;
  displayName: string;
  documentType: string;
  fileId: number | string | null;
  id: number | string;
  primaryDocument: boolean;
  sizeLabel: string;
  uploadedAt: string;
  url: string;
};

export type ContractParty = {
  email: string;
  fullName: string;
  id: number | string;
  phone: string;
  role: string;
};

export type ContractTimelineItem = {
  description: string;
  id: number | string;
  timestamp: string;
  title: string;
  type: string;
};

export type ContractRecord = {
  code: string;
  contractType: ContractType | string;
  currency: string;
  customerId: number | null;
  documents: ContractDocument[];
  effectiveDate: string;
  endDate: string;
  id: number | string;
  listingId: number | null;
  parties: ContractParty[];
  propertyAddress: string;
  propertyId: number | null;
  agentId: number | null;
  specialConditions: string;
  startDate: string;
  status: ContractStatus | string;
  timeline: ContractTimelineItem[];
  title: string;
  totalValue: number | null;
  transactionId: number | null;
};

export type ContractRequest = {
  agentId?: number;
  code: string;
  contractType: ContractType;
  currency: string;
  customerId?: number;
  effectiveDate?: string;
  endDate?: string;
  listingId?: number;
  propertyId?: number;
  startDate?: string;
  status?: ContractStatus;
  specialConditions?: string;
  title: string;
  totalValue?: number;
  transactionId?: number;
};

export type ContractSearchParams = {
  agentId?: string;
  customerId?: string;
  keyword?: string;
  page: number;
  propertyId?: string;
  size: number;
  status?: string;
  type?: string;
};

export type ContractDocumentUploadRequest = {
  description?: string;
  displayName?: string;
  documentType: ContractDocumentType;
  file: File;
  primaryDocument: boolean;
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

function readBoolean(source: BackendRecord, keys: string[]) {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "string" && value.trim()) {
      return value.toLowerCase() === "true";
    }
  }

  return false;
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

function formatFileSize(value: number | null) {
  if (!value) {
    return "";
  }

  if (value >= 1024 * 1024) {
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (value >= 1024) {
    return `${Math.round(value / 1024)} KB`;
  }

  return `${value} B`;
}

function normalizeDocument(source: BackendRecord, index = 0): ContractDocument {
  const file = source.file && typeof source.file === "object" && !Array.isArray(source.file)
    ? (source.file as BackendRecord)
    : source.fileResource && typeof source.fileResource === "object" && !Array.isArray(source.fileResource)
      ? (source.fileResource as BackendRecord)
      : null;
  const fileId =
    readNumber(source, ["fileId", "fileResourceId"]) ??
    (file ? readNumber(file, ["id", "fileId"]) : null) ??
    readString(source, ["fileId", "fileResourceId"]);

  return {
    description: readString(source, ["description"]),
    displayName: readString(source, ["displayName", "name", "fileName"], "Document"),
    documentType: readString(source, ["documentType", "type"], "ATTACHMENT"),
    fileId: fileId || null,
    id: readNumber(source, ["id", "documentId"]) ?? readString(source, ["id", "documentId"], String(index)),
    primaryDocument: readBoolean(source, ["primaryDocument", "primary"]),
    sizeLabel: formatFileSize(readNumber(source, ["size", "fileSize", "fileSizeBytes"]) ?? (file ? readNumber(file, ["size", "fileSize", "fileSizeBytes"]) : null)),
    uploadedAt: readString(source, ["uploadedAt", "createdAt", "updatedAt"]) || (file ? readString(file, ["uploadedAt", "createdAt", "updatedAt"]) : ""),
    url: readString(source, ["url", "fileUrl", "downloadUrl", "publicUrl"]) || (file ? readString(file, ["publicUrl", "url"]) : "")
  };
}

function normalizeParty(source: BackendRecord, index = 0): ContractParty {
  return {
    email: readString(source, ["email"]),
    fullName: readString(source, ["fullName", "name"], "Unnamed party"),
    id: readNumber(source, ["id", "partyId"]) ?? readString(source, ["id", "partyId"], String(index)),
    phone: readString(source, ["phone", "phoneNumber"]),
    role: readString(source, ["role", "partyRole"], "OTHER")
  };
}

function normalizeTimelineItem(source: BackendRecord, index = 0): ContractTimelineItem {
  return {
    description: readString(source, ["description", "message", "content"], "Status updated"),
    id: readNumber(source, ["id", "timelineId"]) ?? readString(source, ["id", "timelineId"], String(index)),
    timestamp: readString(source, ["timestamp", "createdAt", "date"]),
    title: readString(source, ["title", "status", "event"], "Contract event"),
    type: readString(source, ["type", "eventType"], "STATUS")
  };
}

function normalizeContract(source: BackendRecord): ContractRecord {
  const id = readNumber(source, ["id", "contractId"]) ?? readString(source, ["id", "contractId"]);
  const property = source.property && typeof source.property === "object" && !Array.isArray(source.property)
    ? (source.property as BackendRecord)
    : null;

  return {
    code: readString(source, ["code"], String(id || "CONTRACT")),
    contractType: readString(source, ["contractType", "type"], "SALE"),
    currency: readString(source, ["currency"], "VND"),
    customerId: readNumber(source, ["customerId"]),
    documents: readRecordArray(source, ["documents", "contractDocuments"]).map(normalizeDocument),
    effectiveDate: readString(source, ["effectiveDate"]),
    endDate: readString(source, ["endDate"]),
    id: id || readString(source, ["code", "title"]),
    listingId: readNumber(source, ["listingId"]),
    parties: readRecordArray(source, ["parties", "contractParties"]).map(normalizeParty),
    propertyAddress: readString(source, ["propertyAddress", "address"]) || (property ? readString(property, ["address", "fullAddress", "name", "title"]) : ""),
    propertyId: readNumber(source, ["propertyId"]),
    agentId: readNumber(source, ["agentId", "assignedAgentId"]),
    specialConditions: readString(source, ["specialConditions", "conditions", "terms", "description", "notes"]),
    startDate: readString(source, ["startDate"]),
    status: readString(source, ["status"], "DRAFT"),
    timeline: readRecordArray(source, ["timeline", "statusTimeline", "histories"]).map(normalizeTimelineItem),
    title: readString(source, ["title", "name"], "Untitled contract"),
    totalValue: readNumber(source, ["totalValue", "value", "amount"]),
    transactionId: readNumber(source, ["transactionId"])
  };
}

function toQueryParams(params: ContractSearchParams): QueryParams {
  return {
    agentId: params.agentId,
    customerId: params.customerId,
    keyword: params.keyword,
    page: params.page,
    propertyId: params.propertyId,
    size: params.size,
    status: params.status,
    type: params.type
  };
}

export function searchContracts(params: ContractSearchParams) {
  return apiClient
    .get<PaginatedResponse<BackendRecord>>("/contracts", { query: toQueryParams(params) })
    .then((response) => ({ ...response, content: response.content.map(normalizeContract) }));
}

export function getContract(contractId: number | string) {
  return apiClient
    .get<BackendRecord>(`/contracts/${encodeURIComponent(String(contractId))}`)
    .then(normalizeContract);
}

export function createContract(request: ContractRequest) {
  return apiClient.post<BackendRecord>("/contracts", request).then(normalizeContract);
}

export function updateContract(contractId: number | string, request: ContractRequest) {
  return apiClient
    .put<BackendRecord>(`/contracts/${encodeURIComponent(String(contractId))}`, request)
    .then(normalizeContract);
}

export function uploadContractDocument(contractId: number | string, request: ContractDocumentUploadRequest) {
  return apiClient
    .upload<BackendRecord>(`/contracts/${encodeURIComponent(String(contractId))}/documents`, {
      description: request.description,
      displayName: request.displayName,
      documentType: request.documentType,
      file: request.file,
      primaryDocument: request.primaryDocument
    })
    .then(normalizeDocument);
}

export function runContractWorkflowAction(contractId: number | string, action: ContractWorkflowAction, reason?: string) {
  const body = action === "cancel" ? { reason } : undefined;
  return apiClient
    .patch<BackendRecord>(`/contracts/${encodeURIComponent(String(contractId))}/${action}`, body)
    .then(normalizeContract);
}
