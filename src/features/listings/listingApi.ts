import { apiClient } from "../../shared/api/client";

export type ListingPurpose = "SALE" | "RENT";
export type ListingVisibility = "PUBLIC" | "PRIVATE" | "UNLISTED";

export type ListingRecord = {
  askingPrice: number | null;
  code: string;
  currency: string;
  description: string;
  id: number | string;
  listingPackageId: number | null;
  propertyId: number | null;
  purpose: ListingPurpose | null;
  seoDescription: string;
  seoKeywords: string;
  seoTitle: string;
  slug: string;
  status: string;
  title: string;
  visibility: ListingVisibility | string;
};

export type ListingWorkflowAction = "approve" | "publish" | "reject" | "submit" | "unpublish";

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

function readPurpose(value: string): ListingPurpose | null {
  return value === "SALE" || value === "RENT" ? value : null;
}

function readNestedRecord(source: BackendRecord, key: string) {
  const value = source[key];
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as BackendRecord)
    : null;
}

export function normalizeListing(source: BackendRecord): ListingRecord {
  const id = readNumber(source, ["id", "listingId"]) ?? readString(source, ["id", "listingId"]);

  return {
    askingPrice: readNumber(source, ["askingPrice", "price"]),
    code: readString(source, ["code"], String(id || "LISTING")),
    currency: readString(source, ["currency"], "VND"),
    description: readString(source, ["description"]),
    id: id || readString(source, ["code", "slug", "title"]),
    listingPackageId: readNumber(source, ["listingPackageId", "packageId"]),
    propertyId: readNumber(source, ["propertyId"]),
    purpose: readPurpose(readString(source, ["purpose"])),
    seoDescription: readString(source, ["seoDescription"]),
    seoKeywords: readString(source, ["seoKeywords"]),
    seoTitle: readString(source, ["seoTitle"]),
    slug: readString(source, ["slug"]),
    status: readString(source, ["status"], "DRAFT"),
    title: readString(source, ["title", "name"], "Untitled listing"),
    visibility: readString(source, ["visibility"], "PUBLIC")
  };
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
