import { apiClient } from "../../shared/api/client";
import type { PaginatedResponse, QueryParams } from "../../shared/types/api";

export type AppointmentStatus = "CANCELLED" | "COMPLETED" | "CONFIRMED" | "NO_SHOW" | "PENDING" | "RESCHEDULED";

export type AppointmentParticipant = {
  id: number | string;
  notes: string;
  participantRole: string;
  respondedAt: string;
  responseStatus: string;
  userId: number | null;
  userName: string;
};

export type ViewingFeedback = {
  appointmentId: number | string | null;
  comments: string;
  concerns: string;
  createdAt: string;
  id: number | string;
  interestLevel: string;
  nextAction: string;
  positivePoints: string;
  rating: number | null;
  submittedById: number | null;
  submittedByName: string;
};

export type AppointmentRecord = {
  agentId: number | null;
  agentName: string;
  cancellationReason: string;
  cancelledAt: string;
  cancelledById: number | null;
  code: string;
  completedAt: string;
  confirmedAt: string;
  createdAt: string;
  createdById: number | null;
  createdByName: string;
  customerId: number | null;
  customerName: string;
  endAt: string;
  endTime: string;
  feedbacks: ViewingFeedback[];
  id: number | string;
  leadCode: string;
  leadId: number | null;
  listingId: number | null;
  listingTitle: string;
  location: string;
  meetingLocation: string;
  notes: string;
  participants: AppointmentParticipant[];
  propertyId: number | null;
  propertyName: string;
  rescheduledFromId: number | null;
  startAt: string;
  startTime: string;
  status: AppointmentStatus | string;
  timezone: string;
  title: string;
  updatedAt: string;
};

export type AppointmentRequest = {
  agentId?: number;
  code?: string;
  customerId?: number;
  endAt: string;
  leadId?: number;
  listingId?: number;
  meetingLocation?: string;
  notes?: string;
  propertyId?: number;
  startAt: string;
  timezone?: string;
  title: string;
};

export type AppointmentSearchParams = {
  agentId?: number | string;
  customerId?: number | string;
  direction?: "ASC" | "DESC" | string;
  from?: string;
  page?: number;
  propertyId?: number | string;
  size?: number;
  sort?: string;
  sortBy?: string;
  status?: string;
  to?: string;
};

export type AppointmentRescheduleRequest = {
  endAt: string;
  meetingLocation?: string;
  notes?: string;
  startAt: string;
  timezone?: string;
};

export type ViewingFeedbackRequest = {
  comments: string;
  concerns?: string;
  interestLevel?: string;
  nextAction?: string;
  positivePoints?: string;
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

function readArray(source: BackendRecord, key: string) {
  const value = source[key];
  return Array.isArray(value) ? value : [];
}

function normalizeParticipant(source: unknown): AppointmentParticipant {
  const record = (source && typeof source === "object" ? source : {}) as BackendRecord;
  const id = readNumber(record, ["id"]) ?? readString(record, ["id"], "participant");

  return {
    id,
    notes: readString(record, ["notes"]),
    participantRole: readString(record, ["participantRole", "role"], "PARTICIPANT"),
    respondedAt: readString(record, ["respondedAt"]),
    responseStatus: readString(record, ["responseStatus", "status"], "INVITED"),
    userId: readNumber(record, ["userId"]),
    userName: readString(record, ["userName", "name"], "Participant")
  };
}

function normalizeFeedback(source: unknown): ViewingFeedback {
  const record = (source && typeof source === "object" ? source : {}) as BackendRecord;
  const id = readNumber(record, ["id"]) ?? readString(record, ["id"], "feedback");

  return {
    appointmentId: readNumber(record, ["appointmentId"]) ?? readString(record, ["appointmentId"]),
    comments: readString(record, ["comments", "feedback"]),
    concerns: readString(record, ["concerns"]),
    createdAt: readString(record, ["createdAt", "submittedAt"]),
    id,
    interestLevel: readString(record, ["interestLevel"], "MEDIUM"),
    nextAction: readString(record, ["nextAction"]),
    positivePoints: readString(record, ["positivePoints"]),
    rating: readNumber(record, ["rating"]),
    submittedById: readNumber(record, ["submittedById", "createdById"]),
    submittedByName: readString(record, ["submittedByName", "createdByName"], "Team member")
  };
}

export function normalizeAppointment(source: BackendRecord): AppointmentRecord {
  const id = readNumber(source, ["id", "appointmentId"]) ?? readString(source, ["id", "appointmentId"]);
  const startAt = readString(source, ["startAt", "startTime", "scheduledAt", "appointmentTime", "startsAt"]);
  const endAt = readString(source, ["endAt", "endTime", "endsAt"]);
  const meetingLocation = readString(source, ["meetingLocation", "location", "address"]);

  return {
    agentId: readNumber(source, ["agentId", "assignedAgentId"]),
    agentName: readString(source, ["agentName", "assignedAgentName"], "Unassigned"),
    cancellationReason: readString(source, ["cancellationReason", "cancelReason"]),
    cancelledAt: readString(source, ["cancelledAt", "canceledAt"]),
    cancelledById: readNumber(source, ["cancelledById", "canceledById"]),
    code: readString(source, ["code"]),
    completedAt: readString(source, ["completedAt"]),
    confirmedAt: readString(source, ["confirmedAt"]),
    createdAt: readString(source, ["createdAt"]),
    createdById: readNumber(source, ["createdById"]),
    createdByName: readString(source, ["createdByName"]),
    customerId: readNumber(source, ["customerId"]),
    customerName: readString(source, ["customerName"], "Customer"),
    endAt,
    endTime: endAt,
    feedbacks: readArray(source, "feedbacks").map(normalizeFeedback),
    id: id || readString(source, ["code", "title"], "appointment"),
    leadCode: readString(source, ["leadCode"]),
    leadId: readNumber(source, ["leadId"]),
    listingId: readNumber(source, ["listingId"]),
    listingTitle: readString(source, ["listingTitle"]),
    location: meetingLocation,
    meetingLocation,
    notes: readString(source, ["notes", "description"]),
    participants: readArray(source, "participants").map(normalizeParticipant),
    propertyId: readNumber(source, ["propertyId"]),
    propertyName: readString(source, ["propertyName"], "Property"),
    rescheduledFromId: readNumber(source, ["rescheduledFromId"]),
    startAt,
    startTime: startAt,
    status: readString(source, ["status"], "PENDING"),
    timezone: readString(source, ["timezone"], Intl.DateTimeFormat().resolvedOptions().timeZone),
    title: readString(source, ["title", "subject"], "Viewing appointment"),
    updatedAt: readString(source, ["updatedAt"])
  };
}

function toQueryParams(params: AppointmentSearchParams): QueryParams {
  const sortBy = params.sortBy ?? params.sort;

  return {
    agentId: params.agentId,
    customerId: params.customerId,
    direction: params.direction,
    from: params.from,
    page: params.page,
    propertyId: params.propertyId,
    size: params.size,
    sortBy,
    status: params.status,
    to: params.to
  };
}

export function searchAppointments(params: AppointmentSearchParams = {}) {
  return apiClient
    .get<PaginatedResponse<BackendRecord>>("/appointments", { query: toQueryParams(params) })
    .then((response) => ({ ...response, content: response.content.map(normalizeAppointment) }));
}

export function getMyAppointments(params: AppointmentSearchParams = {}) {
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

export function rescheduleAppointment(appointmentId: number | string, request: AppointmentRescheduleRequest) {
  return apiClient
    .patch<BackendRecord>(`/appointments/${encodeURIComponent(String(appointmentId))}/reschedule`, request)
    .then(normalizeAppointment);
}

export function completeAppointment(appointmentId: number | string) {
  return apiClient
    .patch<BackendRecord>(`/appointments/${encodeURIComponent(String(appointmentId))}/complete`)
    .then(normalizeAppointment);
}

export function addViewingFeedback(appointmentId: number | string, request: ViewingFeedbackRequest) {
  return apiClient
    .post<BackendRecord>(`/appointments/${encodeURIComponent(String(appointmentId))}/feedback`, request)
    .then(normalizeFeedback);
}
