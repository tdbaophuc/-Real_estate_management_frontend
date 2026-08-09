import { apiClient } from "../../shared/api/client";
import type { QueryParams } from "../../shared/types/api";

export type MasterDataItem = {
  active?: boolean;
  code: string;
  id: number;
  name: string;
};

export type LocationItem = MasterDataItem & {
  administrativeType?: string;
};

export type AmenityCategory = "ACCESS" | "FEATURE" | "LEISURE" | "SECURITY";

export type AmenityItem = MasterDataItem & {
  category?: AmenityCategory | string;
  description?: string;
};

export type ListingPackageItem = MasterDataItem & {
  currency?: string;
  durationDays?: number;
  featured?: boolean;
  price?: number;
  priorityLevel?: number;
};

export type LeadSourceItem = MasterDataItem & {
  description?: string;
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

  return 0;
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

  return undefined;
}

function normalizeBaseItem(source: BackendRecord): MasterDataItem {
  const id = readNumber(source, ["id"]);

  return {
    active: readBoolean(source, ["active"]),
    code: readString(source, ["code"], String(id)),
    id,
    name: readString(source, ["name", "label"], readString(source, ["code"], String(id)))
  };
}

function normalizeLocation(source: BackendRecord): LocationItem {
  return {
    ...normalizeBaseItem(source),
    administrativeType: readString(source, ["administrativeType", "type"]) || undefined
  };
}

function normalizeAmenity(source: BackendRecord): AmenityItem {
  return {
    ...normalizeBaseItem(source),
    category: readString(source, ["category"]) || undefined,
    description: readString(source, ["description"]) || undefined
  };
}

function normalizeListingPackage(source: BackendRecord): ListingPackageItem {
  return {
    ...normalizeBaseItem(source),
    currency: readString(source, ["currency"]) || undefined,
    durationDays: readNumber(source, ["durationDays"]),
    featured: readBoolean(source, ["featured"]),
    price: readNumber(source, ["price"]),
    priorityLevel: readNumber(source, ["priorityLevel"])
  };
}

function normalizeLeadSource(source: BackendRecord): LeadSourceItem {
  return {
    ...normalizeBaseItem(source),
    description: readString(source, ["description"]) || undefined
  };
}

function readListPayload(payload: unknown): BackendRecord[] {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is BackendRecord => Boolean(item) && typeof item === "object");
  }

  if (payload && typeof payload === "object") {
    const record = payload as BackendRecord;

    for (const key of ["content", "items", "data"]) {
      const value = record[key];

      if (Array.isArray(value)) {
        return value.filter((item): item is BackendRecord => Boolean(item) && typeof item === "object");
      }
    }
  }

  return [];
}

function getMasterDataList<T>(
  path: string,
  normalizer: (source: BackendRecord) => T,
  query?: QueryParams
) {
  return apiClient
    .get<unknown>(path, { query })
    .then((items) => readListPayload(items).map(normalizer));
}

export function getProvinces() {
  return getMasterDataList("/master-data/provinces", normalizeLocation);
}

export function getDistricts(provinceId: number | string) {
  return getMasterDataList(
    `/master-data/provinces/${encodeURIComponent(String(provinceId))}/districts`,
    normalizeLocation
  );
}

export function getWards(districtId: number | string) {
  return getMasterDataList(
    `/master-data/districts/${encodeURIComponent(String(districtId))}/wards`,
    normalizeLocation
  );
}

export function getPropertyTypes() {
  return getMasterDataList("/master-data/property-types", normalizeBaseItem);
}

export function getAmenities(category?: AmenityCategory | string) {
  return getMasterDataList("/master-data/amenities", normalizeAmenity, { category });
}

export function getListingPackages() {
  return getMasterDataList("/master-data/listing-packages", normalizeListingPackage);
}

export function getLeadSources() {
  return getMasterDataList("/master-data/lead-sources", normalizeLeadSource);
}
