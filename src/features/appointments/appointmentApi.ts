import { apiClient } from "../../shared/api/client";
import type { PaginatedResponse, QueryParams } from "../../shared/types/api";

export type AppointmentStatus = "CANCELLED" | "COMPLETED" | "CONFIRMED" | "NO_SHOW" | "PENDING" | "RESCHEDULED";

export type AppointmentRecord = {
  agentId: number | null;
  customerId: number | null;
  endTime: string;
  id: number | string;
  leadId: number | null;
  listingId: number | null;
  location: string;
  notes: string;
  propertyId: number | null;
  startTime: string;
  status: AppointmentStatus | string;
  title: string;
};

export type AppointmentRequest = {
  agentId?: number;
  customerId?: number;
  endTime: string;
  leadId?: number;
  listingId?: number;
  location?: string;
  notes?: string;
  propertyId?: number;
  startTime: string;
  title: string;
};

export type AppointmentSearchParams = {
  from?: string;
  page: number;
  size: number;
  status?: string;
  to?: string;
};

export type ViewingFeedbackRequest = {
  feedback: string;
  rating?: number;
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

function normalizeAppointment(source: BackendRecord): AppointmentRecord {
  const id = readNumber(source, ["id", "appointmentId"]) ?? readString(source, ["id", "appointmentId"]);
  const startTime = readString(source, ["startTime", "scheduledAt", "appointmentTime", "startsAt"]);
  const endTime = readString(source, ["endTime", "endsAt"]);

  return {
    agentId: readNumber(source, ["agentId", "assignedAgentId"]),
    customerId: readNumber(source, ["customerId"]),
    endTime,
    id: id || readString(source, ["code", "title"], "appointment"),
    leadId: readNumber(source, ["leadId"]),
    listingId: readNumber(source, ["listingId"]),
    location: readString(source, ["location", "address"]),
    notes: readString(source, ["notes", "description"]),
    propertyId: readNumber(source, ["propertyId"]),
    startTime,
    status: readString(source, ["status"], "PENDING"),
    title: readString(source, ["title", "subject"], "Viewing appointment")
  };
}

function toQueryParams(params: AppointmentSearchParams): QueryParams {
  return {
    from: params.from,
    page: params.page,
    size: params.size,
    status: params.status,
    to: params.to
  };
}

export function searchAppointments(params: AppointmentSearchParams) {
  return apiClient
    .get<PaginatedResponse<BackendRecord>>("/appointments", { query: toQueryParams(params) })
    .then((response) => ({ ...response, content: response.content.map(normalizeAppointment) }));
}

export function getMyAppointments(params: AppointmentSearchParams) {
  return apiClient
    .get<PaginatedResponse<BackendRecord>>("/appointments/my", { query: toQueryParams(params) })
    .then((response) => ({ ...response, content: response.content.map(normalizeAppointment) }));
}

export function getAppointment(appointmentId: number | string) {
  return apiClient
    .get<BackendRecord>(`/appointments/${encodeURIComponent(String(appointmentId))}`)
    .then(normalizeAppointment);
}

export function createAppointment(request: AppointmentRequest) {
  return apiClient.post<BackendRecord>("/appointments", request).then(normalizeAppointment);
}

export function confirmAppointment(appointmentId: number | string) {
  return apiClient
    .patch<BackendRecord>(`/appointments/${encodeURIComponent(String(appointmentId))}/confirm`)
    .then(normalizeAppointment);
}

export function cancelAppointment(appointmentId: number | string, reason: string) {
  return apiClient
    .patch<BackendRecord>(`/appointments/${encodeURIComponent(String(appointmentId))}/cancel`, { reason })
    .then(normalizeAppointment);
}

export function rescheduleAppointment(appointmentId: number | string, startTime: string, endTime: string) {
  return apiClient
    .patch<BackendRecord>(`/appointments/${encodeURIComponent(String(appointmentId))}/reschedule`, { endTime, startTime })
    .then(normalizeAppointment);
}

export function completeAppointment(appointmentId: number | string) {
  return apiClient
    .patch<BackendRecord>(`/appointments/${encodeURIComponent(String(appointmentId))}/complete`)
    .then(normalizeAppointment);
}

export function addViewingFeedback(appointmentId: number | string, request: ViewingFeedbackRequest) {
  return apiClient.post<void>(`/appointments/${encodeURIComponent(String(appointmentId))}/feedback`, request);
}
