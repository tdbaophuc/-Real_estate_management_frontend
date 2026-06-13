import { apiClient } from "../../shared/api/client";
import type { PaginatedResponse } from "../../shared/types/api";

export type AppNotification = {
  channel: string;
  createdAt: string | null;
  id: number | string;
  message: string;
  read: boolean;
  title: string;
};

type BackendNotification = Record<string, unknown>;

function readString(source: BackendNotification, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return fallback;
}

function readNumber(source: BackendNotification, keys: string[]) {
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

function readBoolean(source: BackendNotification, keys: string[]) {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "boolean") {
      return value;
    }
  }

  return false;
}

function normalizeNotification(notification: BackendNotification, index: number): AppNotification {
  const id =
    readNumber(notification, ["id", "notificationId"]) ??
    readString(notification, ["id", "notificationId"], String(index));

  return {
    channel: readString(notification, ["channel"], "IN_APP"),
    createdAt: readString(notification, ["createdAt", "createdDate", "timestamp"]) || null,
    id,
    message: readString(notification, ["message", "body", "content"], "No notification message."),
    read:
      readBoolean(notification, ["read", "isRead"]) ||
      Boolean(readString(notification, ["readAt"])),
    title: readString(notification, ["title", "subject", "type"], "Notification")
  };
}

function normalizePaginatedNotifications(payload: unknown): PaginatedResponse<AppNotification> {
  if (payload && typeof payload === "object" && "content" in payload) {
    const page = payload as PaginatedResponse<BackendNotification>;

    return {
      content: (page.content ?? []).map(normalizeNotification),
      first: Boolean(page.first),
      last: Boolean(page.last),
      page: Number(page.page ?? 0),
      size: Number(page.size ?? page.content?.length ?? 0),
      totalElements: Number(page.totalElements ?? page.content?.length ?? 0),
      totalPages: Number(page.totalPages ?? 1)
    };
  }

  if (Array.isArray(payload)) {
    return {
      content: payload.map((item, index) =>
        normalizeNotification(item as BackendNotification, index)
      ),
      first: true,
      last: true,
      page: 0,
      size: payload.length,
      totalElements: payload.length,
      totalPages: 1
    };
  }

  return {
    content: [],
    first: true,
    last: true,
    page: 0,
    size: 0,
    totalElements: 0,
    totalPages: 0
  };
}

function normalizeUnreadCount(payload: unknown) {
  if (typeof payload === "number") {
    return payload;
  }

  if (typeof payload === "string" && !Number.isNaN(Number(payload))) {
    return Number(payload);
  }

  if (payload && typeof payload === "object") {
    const source = payload as BackendNotification;
    return readNumber(source, ["count", "unreadCount", "total", "value"]) ?? 0;
  }

  return 0;
}

export function getNotifications(params: { page?: number; size?: number } = {}) {
  return apiClient
    .get<unknown>("/notifications", {
      query: params
    })
    .then(normalizePaginatedNotifications);
}

export function getUnreadNotificationCount() {
  return apiClient.get<unknown>("/notifications/unread-count").then(normalizeUnreadCount);
}

export function markNotificationRead(notificationId: number | string) {
  return apiClient.patch<void>(`/notifications/${notificationId}/read`);
}

export function markAllNotificationsRead() {
  return apiClient.patch<void>("/notifications/read-all");
}
