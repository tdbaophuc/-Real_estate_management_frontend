import { apiClient } from "../../shared/api/client";
import type { PaginatedResponse, QueryParams } from "../../shared/types/api";

export type PropertyPurpose = "SALE" | "RENT";

export type PropertySearchParams = {
  keyword?: string;
  page: number;
  purpose?: PropertyPurpose | "";
  size: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
  status?: string;
};

export type PropertyImage = {
  alt?: string;
  id: number | string;
  url: string;
};

export type PropertyPerson = {
  email?: string;
  fullName: string;
  phone?: string;
};

export type PropertyAddress = {
  fullAddress: string;
  latitude?: number | null;
  longitude?: number | null;
};

export type PropertyRecord = {
  address: PropertyAddress;
  assignedAgent: PropertyPerson | null;
  bathrooms: number | null;
  bedrooms: number | null;
  code: string;
  currency: string;
  direction: string;
  floorArea: number | null;
  furnitureStatus: string;
  id: number | string;
  images: PropertyImage[];
  landArea: number | null;
  legalStatus: string;
  name: string;
  owner: PropertyPerson | null;
  price: number | null;
  purpose: PropertyPurpose | null;
  status: string;
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

function readPurpose(value: string): PropertyPurpose | null {
  return value === "SALE" || value === "RENT" ? value : null;
}

function readPerson(source: BackendRecord | null): PropertyPerson | null {
  if (!source) {
    return null;
  }

  const fullName = readString(source, ["fullName", "name", "email", "phone"]);

  if (!fullName) {
    return null;
  }

  return {
    email: readString(source, ["email"]) || undefined,
    fullName,
    phone: readString(source, ["phone", "phoneNumber"]) || undefined
  };
}

function readAddress(source: BackendRecord): PropertyAddress {
  const address = readNestedRecord(source, "address") ?? source;
  const directAddress = readString(source, ["address", "fullAddress", "addressLine", "location"]);

  if (directAddress) {
    return {
      fullAddress: directAddress,
      latitude: readNumber(address, ["latitude"]),
      longitude: readNumber(address, ["longitude"])
    };
  }

  const parts = [
    readString(address, ["addressLine"]),
    readString(address, ["street"]),
    readString(address, ["wardName", "ward"]),
    readString(address, ["districtName", "district"]),
    readString(address, ["provinceName", "province"])
  ].filter(Boolean);

  return {
    fullAddress: parts.length ? parts.join(", ") : "Address updating",
    latitude: readNumber(address, ["latitude"]),
    longitude: readNumber(address, ["longitude"])
  };
}

function readImages(source: BackendRecord): PropertyImage[] {
  const images = source.images;

  if (!Array.isArray(images)) {
    return [];
  }

  return images
    .map((item, index): PropertyImage | null => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const image = item as BackendRecord;
      const url = readString(image, ["url", "imageUrl", "fileUrl", "publicUrl"]);

      if (!url) {
        return null;
      }

      return {
        alt: readString(image, ["altText", "alt", "description"], readString(source, ["name", "code"])),
        id: readNumber(image, ["id", "imageId"]) ?? readString(image, ["id", "imageId"], String(index)),
        url
      };
    })
    .filter((image): image is PropertyImage => Boolean(image));
}

function normalizeProperty(property: BackendRecord): PropertyRecord {
  const id = readNumber(property, ["id", "propertyId"]) ?? readString(property, ["id", "propertyId"]);
  const owner =
    readPerson(readNestedRecord(property, "owner")) ??
    readPerson(readNestedRecord(property, "propertyOwner"));
  const assignedAgent =
    readPerson(readNestedRecord(property, "assignedAgent")) ??
    readPerson(readNestedRecord(property, "agent"));

  return {
    address: readAddress(property),
    assignedAgent,
    bathrooms: readNumber(property, ["bathrooms"]),
    bedrooms: readNumber(property, ["bedrooms"]),
    code: readString(property, ["code"], String(id || "PROPERTY")),
    currency: readString(property, ["currency"], "VND"),
    direction: readString(property, ["direction"], "UNKNOWN"),
    floorArea: readNumber(property, ["floorArea", "area"]),
    furnitureStatus: readString(property, ["furnitureStatus"], "UNKNOWN"),
    id: id || readString(property, ["code", "name"]),
    images: readImages(property),
    landArea: readNumber(property, ["landArea"]),
    legalStatus: readString(property, ["legalStatus"], "UNKNOWN"),
    name: readString(property, ["name", "title"], "Untitled property"),
    owner,
    price: readNumber(property, ["price", "askingPrice"]),
    purpose: readPurpose(readString(property, ["purpose"])),
    status: readString(property, ["status"], "DRAFT")
  };
}

function toQueryParams(params: PropertySearchParams): QueryParams {
  return {
    keyword: params.keyword,
    page: params.page,
    purpose: params.purpose,
    size: params.size,
    sortBy: params.sortBy,
    sortDirection: params.sortDirection,
    status: params.status
  };
}

export function searchProperties(params: PropertySearchParams) {
  return apiClient
    .get<PaginatedResponse<BackendRecord>>("/properties", {
      query: toQueryParams(params)
    })
    .then((response) => ({
      ...response,
      content: response.content.map(normalizeProperty)
    }));
}

export function getProperty(propertyId: number | string) {
  return apiClient
    .get<BackendRecord>(`/properties/${encodeURIComponent(String(propertyId))}`)
    .then(normalizeProperty);
}

export function getPropertyImages(propertyId: number | string) {
  return apiClient
    .get<BackendRecord[]>(`/properties/${encodeURIComponent(String(propertyId))}/images`)
    .then((images) => readImages({ images }));
}
