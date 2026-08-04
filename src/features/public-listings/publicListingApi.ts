import { apiClient } from "../../shared/api/client";
import type { PaginatedResponse, QueryParams } from "../../shared/types/api";

export type ListingPurpose = "SALE" | "RENT";

export type PublicListingSearchParams = {
  areaMax?: string;
  areaMin?: string;
  bathrooms?: string;
  bedrooms?: string;
  direction?: "ASC" | "DESC";
  districtId?: string;
  keyword?: string;
  maxArea?: string;
  maxPrice?: string;
  minArea?: string;
  minPrice?: string;
  page: number;
  priceMax?: string;
  priceMin?: string;
  propertyTypeId?: string;
  provinceId?: string;
  purpose?: ListingPurpose | "";
  size: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
  wardId?: string;
};

export type PublicListing = {
  address: string;
  area: number | null;
  bathrooms: number | null;
  bedrooms: number | null;
  coverImageUrl: string | null;
  currency: string;
  id: number | string;
  images: PublicListingImage[];
  price: number | null;
  propertyTypeName: string;
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

export type PublicListingImage = {
  altText?: string;
  coverImage?: boolean;
  displayOrder?: number | null;
  id: number | string;
  imageUrl: string;
};

export type GalleryImage = {
  alt?: string;
  id: number | string;
  imageUrl: string;
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

function readRecordArray(source: BackendListing | null, keys: string[]) {
  if (!source) {
    return [];
  }

  for (const key of keys) {
    const value = source[key];

    if (Array.isArray(value)) {
      return value.filter((item): item is BackendListing => Boolean(item) && typeof item === "object");
    }
  }

  return [];
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
  return readString(source, ["coverImageUrl"]) || null;
}

function readImageUrl(image: BackendListing) {
  return readString(image, ["imageUrl"]);
}

function readImageAlt(image: BackendListing, fallback: string) {
  return readString(image, ["alt", "altText", "caption", "description", "title"], fallback);
}

function readImageId(image: BackendListing, fallback: string) {
  return readNumber(image, ["id"]) ?? readString(image, ["id"], fallback);
}

function readPublicListingImages(source: BackendListing): PublicListingImage[] {
  const images = readRecordArray(source, ["images"]);

  return images
    .map((item, index): PublicListingImage | null => {
      const url = readImageUrl(item);

      if (!url) {
        return null;
      }

      return {
        altText: readImageAlt(item, readString(source, ["title", "name"])),
        coverImage: readBoolean(item, ["coverImage"]),
        displayOrder: readNumber(item, ["displayOrder"]),
        id: readImageId(item, String(index)),
        imageUrl: url
      };
    })
    .filter((image): image is PublicListingImage => Boolean(image));
}

export function getPublicListingImageUrl(listing: Pick<PublicListing, "coverImageUrl" | "images">) {
  return listing.coverImageUrl ?? listing.images[0]?.imageUrl ?? null;
}

function readGalleryImages(source: BackendListing): GalleryImage[] {
  return readPublicListingImages(source).map((image) => ({
    alt: image.altText,
    id: image.id,
    imageUrl: image.imageUrl,
    url: image.imageUrl
  }));
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
    images: readPublicListingImages(listing),
    price: readNumber(listing, ["askingPrice", "price"]),
    propertyTypeName: readString(listing, ["propertyTypeName"], "Property"),
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
    images,
    isFavorite: readBoolean(listing, ["isFavorite", "favorite", "favorited"])
  };
}

function toQueryParams(params: PublicListingSearchParams): QueryParams {
  return {
    bathrooms: params.bathrooms,
    bedrooms: params.bedrooms,
    direction: params.direction ?? params.sortDirection,
    districtId: params.districtId,
    keyword: params.keyword,
    maxArea: params.maxArea ?? params.areaMax,
    maxPrice: params.maxPrice ?? params.priceMax,
    minArea: params.minArea ?? params.areaMin,
    minPrice: params.minPrice ?? params.priceMin,
    page: params.page,
    propertyTypeId: params.propertyTypeId,
    provinceId: params.provinceId,
    purpose: params.purpose,
    size: params.size,
    sortBy: params.sortBy,
    wardId: params.wardId
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
