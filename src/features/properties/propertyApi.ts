import { apiClient } from "../../shared/api/client";
import type { PaginatedResponse, QueryParams } from "../../shared/types/api";

export type PropertyPurpose = "SALE" | "RENT";

export type PropertySearchParams = {
  bathrooms?: number;
  bedrooms?: number;
  districtId?: number | string;
  keyword?: string;
  maxArea?: number;
  maxPrice?: number;
  minArea?: number;
  minPrice?: number;
  page: number;
  propertyTypeId?: number | string;
  provinceId?: number | string;
  purpose?: PropertyPurpose | "";
  size: number;
  sortBy?: string;
  direction?: "ASC" | "DESC";
  status?: string;
  wardId?: number | string;
};

export type PropertyImage = {
  alt?: string;
  displayOrder: number;
  fileName?: string;
  fileSize?: number | null;
  id: number | string;
  isCover: boolean;
  mimeType?: string;
  url: string;
};

export type PropertyPerson = {
  email?: string;
  fullName: string;
  phone?: string;
};

export type PropertyAmenity = {
  category?: string;
  code: string;
  details?: string;
  id: number | string;
  name: string;
};

export type PropertyAddress = {
  districtId?: number | null;
  fullAddress: string;
  latitude?: number | null;
  longitude?: number | null;
  provinceId?: number | null;
  streetAddress?: string;
  wardId?: number | null;
};

export type PropertyRecord = {
  address: PropertyAddress;
  amenities: PropertyAmenity[];
  assignedAgent: PropertyPerson | null;
  assignedAgentId: number | null;
  availableFrom: string;
  bathrooms: number | null;
  bedrooms: number | null;
  code: string;
  createdAt: string;
  createdById: number | null;
  createdByName: string;
  currency: string;
  description: string;
  direction: string;
  floorArea: number | null;
  floors: number | null;
  furnitureStatus: string;
  id: number | string;
  images: PropertyImage[];
  landArea: number | null;
  legalStatus: string;
  name: string;
  owner: PropertyPerson | null;
  ownerId: number | null;
  price: number | null;
  propertyTypeId: number | null;
  propertyTypeName: string;
  purpose: PropertyPurpose | null;
  status: string;
  updatedAt: string;
  videoUrl: string;
  virtualTourUrl: string;
};

export type PropertyUpsertRequest = {
  address: {
    fullAddress?: string;
    districtId?: number;
    latitude?: number;
    longitude?: number;
    provinceId?: number;
    streetAddress?: string;
    wardId?: number;
  };
  amenities: Array<{
    amenityId: number;
    details?: string;
  }>;
  assignedAgentId?: number;
  availableFrom?: string;
  bathrooms?: number;
  bedrooms?: number;
  code: string;
  currency: string;
  description?: string;
  direction?: string;
  floorArea?: number;
  floors?: number;
  furnitureStatus?: string;
  landArea?: number;
  legalStatus?: string;
  name: string;
  ownerId?: number;
  price: number;
  propertyTypeId: number;
  purpose: PropertyPurpose;
  videoUrl?: string;
  virtualTourUrl?: string;
};

export type PropertyImageUploadRequest = {
  altText?: string;
  displayOrder?: number;
  file: File;
};

export type PropertyImageMetadataRequest = {
  altText?: string;
  displayOrder?: number;
};

export type PropertyImageReorderRequest = {
  items: Array<{
    displayOrder: number;
    imageId: number | string;
  }>;
};

export type PropertyLegalDocument = {
  documentNumber: string;
  documentType: string;
  expiryDate: string;
  fileId: number | string | null;
  fileName: string;
  id: number | string;
  issuedBy: string;
  issuedDate: string;
  notes: string;
  publicUrl?: string;
  uploadedAt: string;
  verificationNotes: string;
  verificationStatus: string;
};

export type LegalDocumentUploadRequest = {
  documentNumber?: string;
  documentType: string;
  expiryDate?: string;
  file: File;
  issuedBy?: string;
  issuedDate?: string;
  notes?: string;
};

export type LegalDocumentUpdateRequest = Omit<LegalDocumentUploadRequest, "file">;

export type LegalDocumentVerificationRequest = {
  notes?: string;
  verificationStatus: string;
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

function readFlatPerson(source: BackendRecord, nameKeys: string[], emailKeys: string[] = [], phoneKeys: string[] = []) {
  const fullName = readString(source, nameKeys);

  if (!fullName) {
    return null;
  }

  return {
    email: readString(source, emailKeys) || undefined,
    fullName,
    phone: readString(source, phoneKeys) || undefined
  };
}

function readAddress(source: BackendRecord): PropertyAddress {
  const address = readNestedRecord(source, "address") ?? source;
  const directAddress = readString(source, ["address", "fullAddress", "addressLine", "location"]);

  if (directAddress) {
    return {
      districtId: readNumber(address, ["districtId"]),
      fullAddress: directAddress,
      latitude: readNumber(address, ["latitude"]),
      longitude: readNumber(address, ["longitude"]),
      provinceId: readNumber(address, ["provinceId"]),
      streetAddress: readString(address, ["streetAddress", "street"]) || undefined,
      wardId: readNumber(address, ["wardId"])
    };
  }

  const parts = [
    readString(address, ["fullAddress"]),
    readString(address, ["addressLine"]),
    readString(address, ["streetAddress", "street"]),
    readString(address, ["wardName", "ward"]),
    readString(address, ["districtName", "district"]),
    readString(address, ["provinceName", "province"])
  ].filter(Boolean);

  return {
    districtId: readNumber(address, ["districtId"]),
    fullAddress: parts.length ? parts.join(", ") : "Address updating",
    latitude: readNumber(address, ["latitude"]),
    longitude: readNumber(address, ["longitude"]),
    provinceId: readNumber(address, ["provinceId"]),
    streetAddress: readString(address, ["streetAddress", "street"]) || undefined,
    wardId: readNumber(address, ["wardId"])
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
        displayOrder: readNumber(image, ["displayOrder", "order", "sortOrder"]) ?? index,
        fileName: readString(image, ["fileName", "originalFileName"]) || undefined,
        fileSize: readNumber(image, ["fileSize"]),
        id: readNumber(image, ["id", "imageId"]) ?? readString(image, ["id", "imageId"], String(index)),
        isCover: readBoolean(image, ["cover", "isCover", "coverImage", "primary"]),
        mimeType: readString(image, ["mimeType", "contentType"]) || undefined,
        url
      };
    })
    .filter((image): image is PropertyImage => Boolean(image))
    .sort((first, second) => first.displayOrder - second.displayOrder);
}

function readAmenities(source: BackendRecord): PropertyAmenity[] {
  return readRecordArray(source, ["amenities"]).map((amenity, index) => {
    const id = readNumber(amenity, ["id", "amenityId"]) ?? readString(amenity, ["id", "amenityId"], String(index));

    return {
      category: readString(amenity, ["category"]) || undefined,
      code: readString(amenity, ["code"], String(id)),
      details: readString(amenity, ["details", "note", "description"]) || undefined,
      id,
      name: readString(amenity, ["name"], readString(amenity, ["code"], String(id)))
    };
  });
}

function normalizeLegalDocument(source: BackendRecord, index = 0): PropertyLegalDocument {
  const file = readNestedRecord(source, "file") ?? readNestedRecord(source, "fileResource");
  const id = readNumber(source, ["id", "documentId"]) ?? readString(source, ["id", "documentId"], String(index));
  const fileId =
    readNumber(source, ["fileId", "fileResourceId"]) ??
    (file ? readNumber(file, ["id", "fileId"]) : null) ??
    readString(source, ["fileId", "fileResourceId"]);

  return {
    documentNumber: readString(source, ["documentNumber", "number"]),
    documentType: readString(source, ["documentType", "type"], "OTHER"),
    expiryDate: readString(source, ["expiryDate"]),
    fileId: fileId || null,
    fileName:
      readString(source, ["fileName", "displayName", "originalFileName"]) ||
      (file ? readString(file, ["fileName", "originalFileName", "displayName"]) : "") ||
      "Legal document",
    id,
    issuedBy: readString(source, ["issuedBy"]),
    issuedDate: readString(source, ["issuedDate"]),
    notes: readString(source, ["notes", "description"]),
    publicUrl: readString(source, ["documentUrl", "publicUrl", "url", "downloadUrl"]) || (file ? readString(file, ["publicUrl", "url"]) : "") || undefined,
    uploadedAt: readString(source, ["uploadedAt", "createdAt"]),
    verificationNotes: readString(source, ["verificationNotes", "reviewNotes", "verifiedNotes"]),
    verificationStatus: readString(source, ["verificationStatus", "status"], "UNVERIFIED")
  };
}

function normalizeProperty(property: BackendRecord): PropertyRecord {
  const id = readNumber(property, ["id", "propertyId"]) ?? readString(property, ["id", "propertyId"]);
  const owner =
    readPerson(readNestedRecord(property, "owner")) ??
    readPerson(readNestedRecord(property, "propertyOwner")) ??
    readFlatPerson(property, ["ownerName"]);
  const assignedAgent =
    readPerson(readNestedRecord(property, "assignedAgent")) ??
    readPerson(readNestedRecord(property, "agent")) ??
    readFlatPerson(property, ["assignedAgentName", "agentName"]);

  return {
    address: readAddress(property),
    amenities: readAmenities(property),
    assignedAgent,
    assignedAgentId: readNumber(property, ["assignedAgentId"]),
    availableFrom: readString(property, ["availableFrom"]),
    bathrooms: readNumber(property, ["bathrooms"]),
    bedrooms: readNumber(property, ["bedrooms"]),
    code: readString(property, ["code"], String(id || "PROPERTY")),
    createdAt: readString(property, ["createdAt"]),
    createdById: readNumber(property, ["createdById"]),
    createdByName: readString(property, ["createdByName"]),
    currency: readString(property, ["currency"], "VND"),
    description: readString(property, ["description"]),
    direction: readString(property, ["direction"], "UNKNOWN"),
    floorArea: readNumber(property, ["floorArea", "area"]),
    floors: readNumber(property, ["floors"]),
    furnitureStatus: readString(property, ["furnitureStatus"], "UNKNOWN"),
    id: id || readString(property, ["code", "name"]),
    images: readImages(property),
    landArea: readNumber(property, ["landArea"]),
    legalStatus: readString(property, ["legalStatus"], "UNKNOWN"),
    name: readString(property, ["name", "title"], "Untitled property"),
    owner,
    ownerId: readNumber(property, ["ownerId"]),
    price: readNumber(property, ["price", "askingPrice"]),
    propertyTypeId: readNumber(property, ["propertyTypeId"]),
    propertyTypeName: readString(property, ["propertyTypeName", "propertyTypeCode"]),
    purpose: readPurpose(readString(property, ["purpose"])),
    status: readString(property, ["status"], "DRAFT"),
    updatedAt: readString(property, ["updatedAt"]),
    videoUrl: readString(property, ["videoUrl"]),
    virtualTourUrl: readString(property, ["virtualTourUrl"])
  };
}

function toQueryParams(params: PropertySearchParams): QueryParams {
  return {
    bathrooms: params.bathrooms,
    bedrooms: params.bedrooms,
    direction: params.direction,
    districtId: params.districtId,
    keyword: params.keyword,
    maxArea: params.maxArea,
    maxPrice: params.maxPrice,
    minArea: params.minArea,
    minPrice: params.minPrice,
    page: params.page,
    propertyTypeId: params.propertyTypeId,
    provinceId: params.provinceId,
    purpose: params.purpose,
    size: params.size,
    sortBy: params.sortBy,
    status: params.status,
    wardId: params.wardId
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

export function createProperty(request: PropertyUpsertRequest) {
  return apiClient.post<BackendRecord>("/properties", request).then(normalizeProperty);
}

export function updateProperty(propertyId: number | string, request: PropertyUpsertRequest) {
  return apiClient
    .put<BackendRecord>(`/properties/${encodeURIComponent(String(propertyId))}`, request)
    .then(normalizeProperty);
}

export function deleteProperty(propertyId: number | string) {
  return apiClient.delete<void>(`/properties/${encodeURIComponent(String(propertyId))}`);
}

export function uploadPropertyImage(
  propertyId: number | string,
  request: PropertyImageUploadRequest
) {
  return apiClient
    .upload<BackendRecord>(
      `/properties/${encodeURIComponent(String(propertyId))}/images`,
      { file: request.file },
      { query: { altText: request.altText, displayOrder: request.displayOrder } }
    )
    .then((image) => readImages({ images: [image] })[0] ?? image);
}

export function deletePropertyImage(propertyId: number | string, imageId: number | string) {
  return apiClient.delete<void>(
    `/properties/${encodeURIComponent(String(propertyId))}/images/${encodeURIComponent(String(imageId))}`
  );
}

export function setPropertyCoverImage(propertyId: number | string, imageId: number | string) {
  return apiClient
    .patch<BackendRecord>(
    `/properties/${encodeURIComponent(String(propertyId))}/cover-image/${encodeURIComponent(String(imageId))}`
    )
    .then((image) => readImages({ images: [image] })[0] ?? image);
}

export function updatePropertyImageMetadata(
  propertyId: number | string,
  imageId: number | string,
  request: PropertyImageMetadataRequest
) {
  return apiClient
    .patch<BackendRecord>(
      `/properties/${encodeURIComponent(String(propertyId))}/images/${encodeURIComponent(String(imageId))}`,
      request
    )
    .then((image) => readImages({ images: [image] })[0] ?? image);
}

export function reorderPropertyImages(propertyId: number | string, request: PropertyImageReorderRequest) {
  return apiClient
    .put<BackendRecord[]>(
    `/properties/${encodeURIComponent(String(propertyId))}/images/reorder`,
    request
    )
    .then((images) => readImages({ images }));
}

export function getPropertyLegalDocuments(propertyId: number | string) {
  return apiClient
    .get<BackendRecord[]>(`/properties/${encodeURIComponent(String(propertyId))}/legal-documents`)
    .then((documents) => readRecordArray({ documents }, ["documents"]).map(normalizeLegalDocument));
}

export function uploadPropertyLegalDocument(
  propertyId: number | string,
  request: LegalDocumentUploadRequest
) {
  return apiClient
    .upload<BackendRecord>(
      `/properties/${encodeURIComponent(String(propertyId))}/legal-documents`,
      { file: request.file },
      {
        query: {
          documentNumber: request.documentNumber,
          documentType: request.documentType,
          expiryDate: request.expiryDate,
          issuedBy: request.issuedBy,
          issuedDate: request.issuedDate,
          notes: request.notes
        }
      }
    )
    .then(normalizeLegalDocument);
}

export function getPropertyLegalDocument(propertyId: number | string, documentId: number | string) {
  return apiClient
    .get<BackendRecord>(
      `/properties/${encodeURIComponent(String(propertyId))}/legal-documents/${encodeURIComponent(String(documentId))}`
    )
    .then(normalizeLegalDocument);
}

export function updatePropertyLegalDocument(
  propertyId: number | string,
  documentId: number | string,
  request: LegalDocumentUpdateRequest
) {
  return apiClient
    .patch<BackendRecord>(
      `/properties/${encodeURIComponent(String(propertyId))}/legal-documents/${encodeURIComponent(String(documentId))}`,
      request
    )
    .then(normalizeLegalDocument);
}

export function verifyPropertyLegalDocument(
  propertyId: number | string,
  documentId: number | string,
  request: LegalDocumentVerificationRequest
) {
  return apiClient
    .patch<BackendRecord>(
      `/properties/${encodeURIComponent(String(propertyId))}/legal-documents/${encodeURIComponent(String(documentId))}/verify`,
      request
    )
    .then(normalizeLegalDocument);
}

export function deletePropertyLegalDocument(propertyId: number | string, documentId: number | string) {
  return apiClient.delete<void>(
    `/properties/${encodeURIComponent(String(propertyId))}/legal-documents/${encodeURIComponent(String(documentId))}`
  );
}

export function updatePropertyStatus(propertyId: number | string, status: string) {
  return apiClient
    .patch<BackendRecord>(`/properties/${encodeURIComponent(String(propertyId))}/status`, { status })
    .then(normalizeProperty);
}
