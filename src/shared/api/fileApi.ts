import { API_BASE_URL } from "./config";
import { apiClient } from "./client";

export type FileAccessLevel = "PRIVATE" | "PUBLIC";

export type FileResource = {
  accessLevel: FileAccessLevel | string;
  checksumSha256?: string;
  contentType?: string;
  fileName: string;
  id: number | string;
  originalFileName?: string;
  publicUrl?: string;
  size?: number;
  storageKey?: string;
  storageProvider?: string;
  uploadedAt?: string;
  uploaderId?: number;
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

  return undefined;
}

function normalizeFileResource(source: BackendRecord): FileResource {
  const id = readNumber(source, ["id", "fileId"]) ?? readString(source, ["id", "fileId"]);

  return {
    accessLevel: readString(source, ["accessLevel"], "PRIVATE"),
    checksumSha256: readString(source, ["checksumSha256"]) || undefined,
    contentType: readString(source, ["contentType", "mimeType"]) || undefined,
    fileName: readString(source, ["fileName", "filename", "originalFileName"], String(id || "file")),
    id: id || readString(source, ["storageKey", "publicUrl"]),
    originalFileName: readString(source, ["originalFileName", "displayName"]) || undefined,
    publicUrl: readString(source, ["publicUrl", "url"]) || undefined,
    size: readNumber(source, ["size", "fileSize"]),
    storageKey: readString(source, ["storageKey"]) || undefined,
    storageProvider: readString(source, ["storageProvider"]) || undefined,
    uploadedAt: readString(source, ["uploadedAt", "createdAt"]) || undefined,
    uploaderId: readNumber(source, ["uploaderId", "uploadedById"])
  };
}

function createApiUrl(path: string) {
  const normalizedBase = API_BASE_URL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

export function uploadFile(file: File, accessLevel: FileAccessLevel = "PRIVATE") {
  return apiClient
    .upload<BackendRecord>("/files/upload", { file }, { query: { accessLevel } })
    .then(normalizeFileResource);
}

export function getFileMetadata(fileId: number | string) {
  return apiClient
    .get<BackendRecord>(`/files/${encodeURIComponent(String(fileId))}`)
    .then(normalizeFileResource);
}

export function getFileDownloadUrl(fileId: number | string) {
  return createApiUrl(`/files/${encodeURIComponent(String(fileId))}/download`);
}

export async function downloadFile(fileId: number | string, fileName = "download") {
  const blob = await apiClient.downloadBlob(`/files/${encodeURIComponent(String(fileId))}/download`);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function deleteFile(fileId: number | string) {
  return apiClient.delete<void>(`/files/${encodeURIComponent(String(fileId))}`);
}

export function updateFileAccessLevel(fileId: number | string, accessLevel: FileAccessLevel) {
  return apiClient
    .patch<BackendRecord>(`/files/${encodeURIComponent(String(fileId))}/access-level`, {
      accessLevel
    })
    .then(normalizeFileResource);
}
