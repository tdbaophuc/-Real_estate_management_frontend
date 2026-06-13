import { apiClient } from "../../shared/api/client";
import type { PaginatedResponse, QueryParams } from "../../shared/types/api";

export type ListingPurpose = "SALE" | "RENT";

export type PublicListingSearchParams = {
  areaMax?: string;
  areaMin?: string;
  bathrooms?: string;
  bedrooms?: string;
  keyword?: string;
  page: number;
  priceMax?: string;
  priceMin?: string;
  purpose?: ListingPurpose | "";
  size: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
};

export type PublicListing = {
  address: string;
  area: number | null;
  bathrooms: number | null;
  bedrooms: number | null;
  coverImageUrl: string | null;
  currency: string;
  id: number | string;
  price: number | null;
  purpose: ListingPurpose | null;
  slug: string;
  status: string;
  title: string;
};

type BackendListing = Record<string, unknown>;

function readString(source: BackendListing, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return fallback;
}

function readNumber(source: BackendListing, keys: string[]) {
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

function readNestedRecord(source: BackendListing, key: string) {
  const value = source[key];
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as BackendListing)
    : null;
}

function readAddress(source: BackendListing) {
  const directAddress = readString(source, ["address", "addressLine", "location"]);

  if (directAddress) {
    return directAddress;
  }

  const property = readNestedRecord(source, "property");
  const propertyAddress = property ? readNestedRecord(property, "address") : null;
  const address = readNestedRecord(source, "address");
  const addressSource = propertyAddress ?? address;

  if (!addressSource) {
    return "Address updating";
  }

  const parts = [
    readString(addressSource, ["addressLine", "street"]),
    readString(addressSource, ["wardName", "ward"]),
    readString(addressSource, ["districtName", "district"]),
    readString(addressSource, ["provinceName", "province"])
  ].filter(Boolean);

  return parts.length ? parts.join(", ") : "Address updating";
}

function readCoverImage(source: BackendListing) {
  const directImage = readString(source, [
    "coverImageUrl",
    "coverImage",
    "thumbnailUrl",
    "imageUrl"
  ]);

  if (directImage) {
    return directImage;
  }

  const images = source.images;

  if (Array.isArray(images)) {
    const image = images.find((item) => item && typeof item === "object") as
      | BackendListing
      | undefined;

    return image
      ? readString(image, ["url", "imageUrl", "fileUrl", "publicUrl"]) || null
      : null;
  }

  return null;
}

function readPurpose(value: string): ListingPurpose | null {
  return value === "SALE" || value === "RENT" ? value : null;
}

function normalizePublicListing(listing: BackendListing): PublicListing {
  const property = readNestedRecord(listing, "property") ?? {};
  const id = readNumber(listing, ["id", "listingId"]) ?? readString(listing, ["id", "listingId"]);
  const title = readString(listing, ["title", "name"], "Untitled listing");
  const purpose = readPurpose(readString(listing, ["purpose", "listingPurpose"]));

  return {
    address: readAddress(listing),
    area: readNumber(listing, ["area", "floorArea", "landArea"]) ?? readNumber(property, ["floorArea", "landArea"]),
    bathrooms: readNumber(listing, ["bathrooms"]) ?? readNumber(property, ["bathrooms"]),
    bedrooms: readNumber(listing, ["bedrooms"]) ?? readNumber(property, ["bedrooms"]),
    coverImageUrl: readCoverImage(listing),
    currency: readString(listing, ["currency"], "VND"),
    id: id || readString(listing, ["slug"], title),
    price: readNumber(listing, ["askingPrice", "price"]),
    purpose,
    slug: readString(listing, ["slug"], String(id || title)),
    status: readString(listing, ["status", "listingStatus"], "PUBLISHED"),
    title
  };
}

function toQueryParams(params: PublicListingSearchParams): QueryParams {
  return {
    areaMax: params.areaMax,
    areaMin: params.areaMin,
    bathrooms: params.bathrooms,
    bedrooms: params.bedrooms,
    keyword: params.keyword,
    page: params.page,
    priceMax: params.priceMax,
    priceMin: params.priceMin,
    purpose: params.purpose,
    size: params.size,
    sortBy: params.sortBy,
    sortDirection: params.sortDirection
  };
}

export function searchPublicListings(params: PublicListingSearchParams) {
  return apiClient
    .get<PaginatedResponse<BackendListing>>("/search/listings", {
      query: toQueryParams(params),
      skipAuth: true
    })
    .then((response) => ({
      ...response,
      content: response.content.map(normalizePublicListing)
    }));
}
