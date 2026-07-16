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

export type ListingAmenity = {
  id: number | string;
  name: string;
  category?: string;
};

export type ListingAgent = {
  email?: string;
  fullName: string;
  phone?: string;
};

export type GalleryImage = {
  alt?: string;
  id: number | string;
  url: string;
};

export type PublicListingDetail = PublicListing & {
  agent: ListingAgent | null;
  amenities: ListingAmenity[];
  description: string;
  images: GalleryImage[];
  isFavorite: boolean;
};

export type ListingInquiryRequest = {
  email: string;
  fullName: string;
  message: string;
  phone?: string;
  preferredContactMethod?: string;
};

export type ListingAppointmentRequest = {
  email: string;
  fullName: string;
  message?: string;
  phone?: string;
  preferredEndAt?: string;
  preferredStartAt: string;
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

function readBoolean(source: BackendListing, keys: string[]) {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "boolean") {
      return value;
    }
  }

  return false;
}

function readAddress(source: BackendListing) {
  const directAddress = readString(source, [
    "address",
    "fullAddress",
    "addressLine",
    "streetAddress",
    "location"
  ]);

  if (directAddress) {
    return directAddress;
  }

  const property = readNestedRecord(source, "property");
  const propertyAddress = property ? readNestedRecord(property, "address") : null;
  const address = readNestedRecord(source, "address");
  const addressSource = propertyAddress ?? address;

  if (!addressSource) {
    const flatParts = [
      readString(source, ["streetAddress", "street"]),
      readString(source, ["wardName", "ward"]),
      readString(source, ["districtName", "district"]),
      readString(source, ["provinceName", "province"])
    ].filter(Boolean);

    return flatParts.length ? flatParts.join(", ") : "Address updating";
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

  const property = readNestedRecord(source, "property");
  const images = source.images ?? property?.images;

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

function readGalleryImages(source: BackendListing): GalleryImage[] {
  const property = readNestedRecord(source, "property");
  const images = source.images ?? property?.images;

  if (!Array.isArray(images)) {
    const coverImageUrl = readCoverImage(source);

    return coverImageUrl
      ? [{ id: "cover", url: coverImageUrl, alt: readString(source, ["title", "name"]) }]
      : [];
  }

  return images
    .map((item, index): GalleryImage | null => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const image = item as BackendListing;
      const url = readString(image, ["url", "imageUrl", "fileUrl", "publicUrl"]);

      if (!url) {
        return null;
      }

      return {
        alt: readString(image, ["alt", "altText", "description"], readString(source, ["title", "name"])),
        id: readNumber(image, ["id", "imageId"]) ?? readString(image, ["id", "imageId"], String(index)),
        url
      };
    })
    .filter((image): image is GalleryImage => Boolean(image));
}

function readAmenities(source: BackendListing): ListingAmenity[] {
  const property = readNestedRecord(source, "property");
  const amenities = source.amenities ?? property?.amenities;

  if (!Array.isArray(amenities)) {
    return [];
  }

  return amenities
    .map((item, index): ListingAmenity | null => {
      if (typeof item === "string") {
        return {
          id: item,
          name: item
        };
      }

      if (!item || typeof item !== "object") {
        return null;
      }

      const amenity = item as BackendListing;
      const nestedAmenity = readNestedRecord(amenity, "amenity");
      const sourceAmenity = nestedAmenity ?? amenity;
      const name = readString(sourceAmenity, ["name", "label", "code"]);

      if (!name) {
        return null;
      }

      return {
        category: readString(sourceAmenity, ["category", "categoryName"]),
        id: readNumber(sourceAmenity, ["id", "amenityId"]) ?? readString(sourceAmenity, ["code"], String(index)),
        name
      };
    })
    .filter((amenity): amenity is ListingAmenity => Boolean(amenity));
}

function readAgent(source: BackendListing): ListingAgent | null {
  const agent =
    readNestedRecord(source, "agent") ??
    readNestedRecord(source, "assignedAgent") ??
    readNestedRecord(readNestedRecord(source, "property") ?? {}, "assignedAgent");

  if (!agent) {
    return null;
  }

  const fullName = readString(agent, ["fullName", "name", "email"], "Assigned agent");

  return {
    email: readString(agent, ["email"]) || undefined,
    fullName,
    phone: readString(agent, ["phone", "phoneNumber"]) || undefined
  };
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

function normalizePublicListingDetail(listing: BackendListing): PublicListingDetail {
  const normalizedListing = normalizePublicListing(listing);
  const property = readNestedRecord(listing, "property") ?? {};
  const images = readGalleryImages(listing);

  return {
    ...normalizedListing,
    agent: readAgent(listing),
    amenities: readAmenities(listing),
    description:
      readString(listing, ["description", "content"]) ||
      readString(property, ["description"]) ||
      "Listing description is being updated.",
    images: images.length
      ? images
      : normalizedListing.coverImageUrl
        ? [{ id: "cover", url: normalizedListing.coverImageUrl, alt: normalizedListing.title }]
        : [],
    isFavorite: readBoolean(listing, ["isFavorite", "favorite", "favorited"])
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

function getOrCreateSessionId() {
  const storageKey = "rem.public.sessionId";
  const existingSessionId = window.localStorage.getItem(storageKey);

  if (existingSessionId) {
    return existingSessionId;
  }

  const sessionId =
    "randomUUID" in window.crypto
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  window.localStorage.setItem(storageKey, sessionId);
  return sessionId;
}

export function getPublicListingDetail(slug: string) {
  return apiClient
    .get<BackendListing>(`/search/listings/${encodeURIComponent(slug)}`, {
      headers: {
        "X-Session-Id": getOrCreateSessionId()
      },
      skipAuth: true
    })
    .then(normalizePublicListingDetail);
}

export function getFavoriteListings(params: { page?: number; size?: number } = {}) {
  return apiClient
    .get<PaginatedResponse<BackendListing>>("/listings/favorites", {
      query: params
    })
    .then((response) => ({
      ...response,
      content: response.content.map(normalizePublicListing)
    }));
}

export function addListingFavorite(listingId: number | string) {
  return apiClient.post<void>(`/listings/${listingId}/favorite`);
}

export function removeListingFavorite(listingId: number | string) {
  return apiClient.delete<void>(`/listings/${listingId}/favorite`);
}

export function createListingInquiry(listingId: number | string, request: ListingInquiryRequest) {
  return apiClient.post<void>(
    `/search/listings/${encodeURIComponent(String(listingId))}/inquiries`,
    request
  );
}

export function createListingAppointmentRequest(
  listingId: number | string,
  request: ListingAppointmentRequest
) {
  return apiClient.post<void>(
    `/search/listings/${encodeURIComponent(String(listingId))}/appointment-requests`,
    request
  );
}
