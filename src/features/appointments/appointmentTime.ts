import type { AppointmentRecord } from "./appointmentApi";

export function toIsoDateTime(value: string) {
  return value ? new Date(value).toISOString() : "";
}

export function toLocalInputValue(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function formatAppointmentDateTime(value: string) {
  if (!value) {
    return "Time updating";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZoneName: "short"
  }).format(new Date(value));
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
