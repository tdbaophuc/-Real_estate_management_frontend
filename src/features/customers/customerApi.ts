import { apiClient } from "../../shared/api/client";
import type { PaginatedResponse, QueryParams } from "../../shared/types/api";

export type CustomerStatus = "ACTIVE" | "ARCHIVED" | "INACTIVE";
export type CustomerSource = "IMPORT" | "MANUAL" | "OTHER" | "REFERRAL" | "WEBSITE";
export type CustomerPriority = "HIGH" | "LOW" | "MEDIUM";
export type CustomerPurpose = "SALE" | "RENT";

export type CustomerRecord = {
  assignedAgentId: number | null;
  code: string;
  email: string;
  fullName: string;
  id: number | string;
  noteItems: CustomerNote[];
  notes: string;
  phone: string;
  preferredContactMethod: string;
  priority: CustomerPriority | string;
  requirements: CustomerRequirement[];
  source: CustomerSource | string;
  status: CustomerStatus | string;
  userId: number | null;
};

export type CustomerNote = {
  content: string;
  createdAt: string;
  id: number | string;
};

export type CustomerRequirement = {
  currency: string;
  id: number | string;
  location: string;
  maxArea: number | null;
  maxPrice: number | null;
  minArea: number | null;
  minPrice: number | null;
  purpose: CustomerPurpose | null;
  summary: string;
};

export type CustomerTimelineItem = {
  description: string;
  id: number | string;
  timestamp: string;
  title: string;
  type: string;
};

export type CustomerUpsertRequest = {
  assignedAgentId?: number;
  code: string;
  email?: string;
  fullName: string;
  notes?: string;
  phone?: string;
  preferredContactMethod?: string;
  priority: CustomerPriority;
  source: CustomerSource | string;
  status: CustomerStatus;
  userId?: number;
};

export type CustomerSearchParams = {
  keyword?: string;
  page: number;
  priority?: string;
  size: number;
  source?: string;
  status?: string;
};

export type CustomerRecommendationRequest = {
  currency?: string;
  limit: number;
  maxPrice?: number;
  purpose?: CustomerPurpose | "";
};

export type CustomerRecommendation = {
  id: number | string;
  price: number | null;
  score: number | null;
  title: string;
  url: string;
};

export type CustomerSummary = {
  nextAction: string;
  risks: string[];
  summary: string;
  tags: string[];
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

function readRecordArray(source: BackendRecord, keys: string[]) {
  for (const key of keys) {
    const value = source[key];

    if (Array.isArray(value)) {
      return value.filter((item): item is BackendRecord => Boolean(item) && typeof item === "object");
    }
  }

  return [];
}

function readPurpose(value: string): CustomerPurpose | null {
  return value === "SALE" || value === "RENT" ? value : null;
}

function normalizeRequirement(source: BackendRecord, index = 0): CustomerRequirement {
  const id = readNumber(source, ["id", "requirementId"]) ?? readString(source, ["id", "requirementId"], String(index));
  const purpose = readPurpose(readString(source, ["purpose"]));
  const location = readString(source, ["location", "preferredLocation", "area"]);

  return {
    currency: readString(source, ["currency"], "VND"),
    id,
    location,
    maxArea: readNumber(source, ["maxArea", "areaMax"]),
    maxPrice: readNumber(source, ["maxPrice", "priceMax"]),
    minArea: readNumber(source, ["minArea", "areaMin"]),
    minPrice: readNumber(source, ["minPrice", "priceMin"]),
    purpose,
    summary:
      readString(source, ["summary", "description", "notes"]) ||
      [purpose, location].filter(Boolean).join(" / ") ||
      "Requirement details are updating"
  };
}

function normalizeCustomer(source: BackendRecord): CustomerRecord {
  const id = readNumber(source, ["id", "customerId"]) ?? readString(source, ["id", "customerId"]);

  return {
    assignedAgentId: readNumber(source, ["assignedAgentId"]),
    code: readString(source, ["code"], String(id || "CUSTOMER")),
    email: readString(source, ["email"]),
    fullName: readString(source, ["fullName", "name"], "Unnamed customer"),
    id: id || readString(source, ["code", "email", "phone"]),
    noteItems: readRecordArray(source, ["noteItems", "customerNotes", "notesList", "notes"]).map(normalizeNote),
    notes: readString(source, ["notes", "note"]),
    phone: readString(source, ["phone", "phoneNumber"]),
    preferredContactMethod: readString(source, ["preferredContactMethod"], "PHONE"),
    priority: readString(source, ["priority"], "MEDIUM"),
    requirements: readRecordArray(source, ["requirements", "customerRequirements"]).map(normalizeRequirement),
    source: readString(source, ["source"], "MANUAL"),
    status: readString(source, ["status"], "ACTIVE"),
    userId: readNumber(source, ["userId"])
  };
}

function normalizeNote(source: BackendRecord, index = 0): CustomerNote {
  return {
    content: readString(source, ["content", "note", "notes", "message"], "Note details are updating"),
    createdAt: readString(source, ["createdAt", "timestamp", "date"]),
    id: readNumber(source, ["id", "noteId"]) ?? readString(source, ["id", "noteId"], String(index))
  };
}

function normalizeTimelineItem(source: BackendRecord, index = 0): CustomerTimelineItem {
  return {
    description: readString(source, ["description", "message", "content"], "Timeline details are updating"),
    id: readNumber(source, ["id", "timelineId"]) ?? readString(source, ["id", "timelineId"], String(index)),
    timestamp: readString(source, ["timestamp", "createdAt", "date"]),
    title: readString(source, ["title", "event", "type"], "Activity"),
    type: readString(source, ["type", "eventType"], "ACTIVITY")
  };
}

function normalizeRecommendation(source: BackendRecord, index = 0): CustomerRecommendation {
  const listing = readNestedRecord(source, "listing") ?? source;
  const id = readNumber(listing, ["id", "listingId"]) ?? readString(listing, ["id", "listingId"], String(index));

  return {
    id,
    price: readNumber(listing, ["askingPrice", "price"]),
    score: readNumber(source, ["score", "matchScore"]),
    title: readString(listing, ["title", "name"], "Recommended listing"),
    url: readString(listing, ["slug"]) ? `/listing/${readString(listing, ["slug"])}` : ""
  };
}

function normalizeSummary(source: BackendRecord): CustomerSummary {
  const content = readNestedRecord(source, "summary") ?? readNestedRecord(source, "result") ?? source;
  const risks = readRecordArray(content, ["risks"]).map((item) => readString(item, ["label", "text", "message"]));
  const tags = readRecordArray(content, ["tags"]).map((item) => readString(item, ["label", "name", "text"]));

  return {
    nextAction: readString(content, ["nextAction", "recommendedAction"]),
    risks: risks.filter(Boolean),
    summary: readString(content, ["summary", "content", "text"], "AI summary is not available yet."),
    tags: tags.filter(Boolean)
  };
}

function toQueryParams(params: CustomerSearchParams): QueryParams {
  return {
    keyword: params.keyword,
    page: params.page,
    priority: params.priority,
    size: params.size,
    source: params.source,
    status: params.status
  };
}

export function searchCustomers(params: CustomerSearchParams) {
  return apiClient
    .get<PaginatedResponse<BackendRecord>>("/customers", { query: toQueryParams(params) })
    .then((response) => ({ ...response, content: response.content.map(normalizeCustomer) }));
}

export function getCustomer(customerId: number | string) {
  return apiClient
    .get<BackendRecord>(`/customers/${encodeURIComponent(String(customerId))}`)
    .then(normalizeCustomer);
}

export function createCustomer(request: CustomerUpsertRequest) {
  return apiClient.post<BackendRecord>("/customers", request).then(normalizeCustomer);
}

export function updateCustomer(customerId: number | string, request: CustomerUpsertRequest) {
  return apiClient
    .put<BackendRecord>(`/customers/${encodeURIComponent(String(customerId))}`, request)
    .then(normalizeCustomer);
}

export function addCustomerNote(customerId: number | string, content: string) {
  return apiClient
    .post<BackendRecord>(`/customers/${encodeURIComponent(String(customerId))}/notes`, { content })
    .then(normalizeNote);
}

export function addCustomerRequirement(customerId: number | string, request: Partial<CustomerRequirement>) {
  return apiClient
    .post<BackendRecord>(`/customers/${encodeURIComponent(String(customerId))}/requirements`, request)
    .then(normalizeRequirement);
}

export function getCustomerTimeline(customerId: number | string) {
  return apiClient
    .get<BackendRecord[]>(`/customers/${encodeURIComponent(String(customerId))}/timeline`)
    .then((items) => items.map(normalizeTimelineItem));
}

export function getCustomerAiSummary(customerId: number | string) {
  return apiClient
    .get<BackendRecord>(`/ai/customers/${encodeURIComponent(String(customerId))}/summary`)
    .then(normalizeSummary);
}

export function getCustomerRecommendations(
  customerId: number | string,
  request: CustomerRecommendationRequest
) {
  return apiClient
    .post<BackendRecord[] | BackendRecord>(
      `/ai/customers/${encodeURIComponent(String(customerId))}/recommendations`,
      request
    )
    .then((response) => {
      const items = Array.isArray(response)
        ? response
        : readRecordArray(response, ["recommendations", "listings", "items", "content"]);
      return items.map(normalizeRecommendation);
    });
}
