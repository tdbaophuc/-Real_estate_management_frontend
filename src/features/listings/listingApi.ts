import { apiClient } from "../../shared/api/client";
import type { PaginatedResponse, QueryParams } from "../../shared/types/api";

export type ListingPurpose = "SALE" | "RENT";
export type ListingVisibility = "PUBLIC" | "PRIVATE" | "UNLISTED";

export type ListingPerson = {
  email?: string;
  fullName: string;
  id: number | null;
};

export type ListingPropertySummary = {
  address?: string;
  code: string;
  id: number | string;
  name: string;
};

export type ListingPackageSummary = {
  code?: string;
  id: number | null;
  name?: string;
};

export type ListingStatusHistory = {
  createdAt: string;
  fromStatus?: string;
  id: number | string;
  reason?: string;
  status: string;
  toStatus?: string;
};

export type ListingRecord = {
  askingPrice: number | null;
  code: string;
  createdAt: string;
  creator: ListingPerson | null;
  currency: string;
  description: string;
  favoriteCount: number | null;
  id: number | string;
  listingPackage: ListingPackageSummary | null;
  listingPackageId: number | null;
  propertyId: number | null;
  property: ListingPropertySummary | null;
  purpose: ListingPurpose | null;
  reviewedAt: string;
  reviewer: ListingPerson | null;
  seoDescription: string;
  seoKeywords: string;
  seoTitle: string;
  slug: string;
  status: string;
  statusHistory: ListingStatusHistory[];
  submittedAt: string;
  title: string;
  updatedAt: string;
  visibility: ListingVisibility | string;
  viewCount: number | null;
};

export type ListingWorkflowAction = "approve" | "publish" | "reject" | "submit" | "unpublish";

export type ListingSearchParams = {
  createdBy?: number | string;
  keyword?: string;
  page: number;
  propertyId?: number | string;
  purpose?: ListingPurpose | "";
  size: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
  status?: string;
};

export type ListingCreateRequest = {
  askingPrice: number;
  code: string;
  currency: string;
  description: string;
  listingPackageId?: number;
  propertyId: number;
  purpose: ListingPurpose;
  seoDescription?: string;
  seoKeywords?: string;
  seoTitle?: string;
  slug: string;
  title: string;
  visibility: ListingVisibility;
};

export type ListingUpdateRequest = Omit<ListingCreateRequest, "propertyId"> & {
  propertyId?: number;
};

export type ListingDescriptionRequest = {
  extraInstructions?: string;
  includeSeo: boolean;
  language: string;
  listingId: number | string;
  tone: string;
};

export type ListingDescriptionSuggestion = {
  description: string;
  seoDescription: string;
  seoKeywords: string;
  seoTitle: string;
  shortDescription: string;
  socialCaption: string;
  title: string;
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

function readPurpose(value: string): ListingPurpose | null {
  return value === "SALE" || value === "RENT" ? value : null;
}

function readNestedRecord(source: BackendRecord, key: string) {
  const value = source[key];
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as BackendRecord)
    : null;
}

function readPerson(source: BackendRecord | null): ListingPerson | null {
  if (!source) {
    return null;
  }

  const id = readNumber(source, ["id", "userId"]);
  const fullName = readString(source, ["fullName", "name", "email"]);

  if (!fullName) {
    return null;
  }

  return {
    email: readString(source, ["email"]) || undefined,
    fullName,
    id
  };
}

function readPropertySummary(source: BackendRecord | null): ListingPropertySummary | null {
  if (!source) {
    return null;
  }

  const id = readNumber(source, ["id", "propertyId"]) ?? readString(source, ["id", "propertyId"]);

  if (!id) {
    return null;
  }

  return {
    address: readString(source, ["address", "fullAddress", "addressLine"]) || undefined,
    code: readString(source, ["code"], String(id)),
    id,
    name: readString(source, ["name", "title"], readString(source, ["code"], String(id)))
  };
}

function readListingPackage(source: BackendRecord | null): ListingPackageSummary | null {
  if (!source) {
    return null;
  }

  const id = readNumber(source, ["id", "listingPackageId", "packageId"]);

  return {
    code: readString(source, ["code"]) || undefined,
    id,
    name: readString(source, ["name", "title"]) || undefined
  };
}

function normalizeStatusHistory(source: BackendRecord, index = 0): ListingStatusHistory {
  return {
    createdAt: readString(source, ["createdAt", "changedAt", "timestamp"]),
    fromStatus: readString(source, ["fromStatus", "previousStatus"]) || undefined,
    id: readNumber(source, ["id", "historyId"]) ?? readString(source, ["id", "historyId"], String(index)),
    reason: readString(source, ["reason", "notes"]) || undefined,
    status: readString(source, ["status", "toStatus"], "UNKNOWN"),
    toStatus: readString(source, ["toStatus", "nextStatus"]) || undefined
  };
}

export function normalizeListing(source: BackendRecord): ListingRecord {
  const id = readNumber(source, ["id", "listingId"]) ?? readString(source, ["id", "listingId"]);
  const property = readPropertySummary(readNestedRecord(source, "property"));
  const listingPackage = readListingPackage(
    readNestedRecord(source, "listingPackage") ?? readNestedRecord(source, "package")
  );

  return {
    askingPrice: readNumber(source, ["askingPrice", "price"]),
    code: readString(source, ["code"], String(id || "LISTING")),
    createdAt: readString(source, ["createdAt"]),
    creator: readPerson(readNestedRecord(source, "creator") ?? readNestedRecord(source, "createdBy")),
    currency: readString(source, ["currency"], "VND"),
    description: readString(source, ["description"]),
    favoriteCount: readNumber(source, ["favoriteCount", "favorites"]),
    id: id || readString(source, ["code", "slug", "title"]),
    listingPackage,
    listingPackageId: readNumber(source, ["listingPackageId", "packageId"]) ?? listingPackage?.id ?? null,
    property,
    propertyId: readNumber(source, ["propertyId"]) ?? (typeof property?.id === "number" ? property.id : null),
    purpose: readPurpose(readString(source, ["purpose"])),
    reviewedAt: readString(source, ["reviewedAt"]),
    reviewer: readPerson(readNestedRecord(source, "reviewer")),
    seoDescription: readString(source, ["seoDescription"]),
    seoKeywords: readString(source, ["seoKeywords"]),
    seoTitle: readString(source, ["seoTitle"]),
    slug: readString(source, ["slug"]),
    status: readString(source, ["status"], "DRAFT"),
    statusHistory: readRecordArray(source, ["statusHistory", "histories"]).map(normalizeStatusHistory),
    submittedAt: readString(source, ["submittedAt"]),
    title: readString(source, ["title", "name"], "Untitled listing"),
    updatedAt: readString(source, ["updatedAt"]),
    visibility: readString(source, ["visibility"], "PUBLIC"),
    viewCount: readNumber(source, ["viewCount", "views"])
  };
}

function toQueryParams(params: ListingSearchParams): QueryParams {
  return {
    createdBy: params.createdBy,
    keyword: params.keyword,
    page: params.page,
    propertyId: params.propertyId,
    purpose: params.purpose,
    size: params.size,
    sortBy: params.sortBy,
    sortDirection: params.sortDirection,
    status: params.status
  };
}

export function searchListings(params: ListingSearchParams) {
  return apiClient
    .get<PaginatedResponse<BackendRecord>>("/listings", { query: toQueryParams(params) })
    .then((response) => ({
      ...response,
      content: response.content.map(normalizeListing)
    }));
}

export function getListing(listingId: number | string) {
  return apiClient
    .get<BackendRecord>(`/listings/${encodeURIComponent(String(listingId))}`)
    .then(normalizeListing);
}

export function createListing(request: ListingCreateRequest) {
  return apiClient.post<BackendRecord>("/listings", request).then(normalizeListing);
}

export function updateListing(listingId: number | string, request: ListingUpdateRequest) {
  return apiClient
    .put<BackendRecord>(`/listings/${encodeURIComponent(String(listingId))}`, request)
    .then(normalizeListing);
}

function normalizeWorkflowListing(
  body: BackendRecord | undefined,
  current: ListingRecord,
  fallbackStatus: string
) {
  return body ? normalizeListing(body) : { ...current, status: fallbackStatus };
}

export function runListingWorkflowAction({
  action,
  current,
  reason
}: {
  action: ListingWorkflowAction;
  current: ListingRecord;
  reason?: string;
}) {
  const fallbackStatusByAction: Record<ListingWorkflowAction, string> = {
    approve: "APPROVED",
    publish: "PUBLISHED",
    reject: "REJECTED",
    submit: "PENDING_REVIEW",
    unpublish: "UNPUBLISHED"
  };
  const body = action === "reject" ? { reason } : undefined;

  return apiClient
    .patch<BackendRecord | undefined>(
      `/listings/${encodeURIComponent(String(current.id))}/${action}`,
      body
    )
    .then((response) => normalizeWorkflowListing(response, current, fallbackStatusByAction[action]));
}

export function generateListingDescription(request: ListingDescriptionRequest) {
  return apiClient.post<BackendRecord>("/ai/listing-description", request).then((response) => {
    const content =
      readNestedRecord(response, "suggestion") ??
      readNestedRecord(response, "content") ??
      readNestedRecord(response, "result") ??
      response;

    return {
      description: readString(content, ["description", "fullDescription", "body", "content"]),
      seoDescription: readString(content, ["seoDescription", "metaDescription"]),
      seoKeywords: readString(content, ["seoKeywords", "keywords"]),
      seoTitle: readString(content, ["seoTitle", "metaTitle"]),
      shortDescription: readString(content, ["shortDescription", "summary"]),
      socialCaption: readString(content, ["socialCaption", "caption"]),
      title: readString(content, ["title", "headline"])
    } satisfies ListingDescriptionSuggestion;
  });
}
