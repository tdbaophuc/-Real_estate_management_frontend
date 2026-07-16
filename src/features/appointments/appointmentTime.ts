import type { AppointmentRecord } from "./appointmentApi";

export function toIsoDateTime(value: string) {
  return value ? new Date(value).toISOString() : "";
}

export function toLocalInputValue(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function formatAppointmentDateTime(value: string) {
  if (!value) {
    return "Time updating";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Time updating";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZoneName: "short"
  }).format(date);
}

export function formatAppointmentTime(value: string) {
  if (!value) {
    return "Time updating";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Time updating";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function formatAppointmentDate(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Date updating";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit"
  }).format(date);
}

export function startOfWeek(date: Date) {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function toDateKey(date: Date | string) {
  const next = new Date(date);
  const offsetMs = next.getTimezoneOffset() * 60_000;
  return new Date(next.getTime() - offsetMs).toISOString().slice(0, 10);
}

export function toDateInputValue(date: Date) {
  return toDateKey(date);
}

export function fromDateInputValue(value: string) {
  const date = value ? new Date(`${value}T00:00:00`) : new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export function toDayBoundsIso(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { from: start.toISOString(), to: end.toISOString() };
}

export function toWeekBoundsIso(date: Date) {
  const start = startOfWeek(date);
  const end = addDays(start, 7);
  return { from: start.toISOString(), to: end.toISOString() };
}

export function getMinutesFromDayStart(value: string) {
  const date = new Date(value);
  return date.getHours() * 60 + date.getMinutes();
}

export function getDurationMinutes(startIso: string, endIso: string) {
  if (!startIso || !endIso) {
    return 30;
  }

  return Math.max(30, Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60_000));
}

export function hasAppointmentConflict(
  appointments: AppointmentRecord[],
  startIso: string,
  endIso: string,
  ignoreId?: number | string
) {
  if (!startIso || !endIso) {
    return false;
  }

  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();

  return appointments.some((appointment) => {
    if (ignoreId && String(appointment.id) === String(ignoreId)) {
      return false;
    }

    if (!appointment.startTime || !appointment.endTime) {
      return false;
    }

    const appointmentStart = new Date(appointment.startTime).getTime();
    const appointmentEnd = new Date(appointment.endTime).getTime();
    return start < appointmentEnd && end > appointmentStart;
  });
}
