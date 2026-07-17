import { useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, ClipboardCheck, List, Mail, Plus, RotateCcw, Star, XCircle } from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { ActionBar } from "../../shared/ui/ActionBar";
import { Button } from "../../shared/ui/Button";
import { DataTable, type DataTableColumn } from "../../shared/ui/DataTable";
import { Dialog } from "../../shared/ui/Dialog";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Input } from "../../shared/ui/Input";
import { PageHeader } from "../../shared/ui/PageHeader";
import { Pagination } from "../../shared/ui/Pagination";
import { SectionCard } from "../../shared/ui/SectionCard";
import { Select } from "../../shared/ui/Select";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import {
  cancelAppointment,
  completeAppointment,
  confirmAppointment,
  createAppointment,
  getMyAppointments,
  rescheduleAppointment,
  searchAppointments,
  type AppointmentRecord,
  type AppointmentSearchParams
} from "./appointmentApi";
import {
  addDays,
  formatAppointmentDateTime,
  formatAppointmentTime,
  fromDateInputValue,
  getDurationMinutes,
  getMinutesFromDayStart,
  hasAppointmentConflict,
  startOfWeek,
  toDateInputValue,
  toDateKey,
  toDayBoundsIso,
  toIsoDateTime,
  toLocalInputValue,
  toWeekBoundsIso
} from "./appointmentTime";

const pageSize = 10;
const defaultCalendarStartHour = 6;
const defaultCalendarEndHour = 18;
const calendarSlotMinutes = 60;
const calendarSlotHeight = 56;

const statusOptions = [
  { label: "Any status", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "No show", value: "NO_SHOW" },
  { label: "Rescheduled", value: "RESCHEDULED" }
];

type AppointmentActionType = "cancel" | "complete" | "confirm" | "reschedule";

type PendingAction = {
  appointment: AppointmentRecord;
  type: AppointmentActionType;
} | null;

function statusTone(status: string) {
  if (status === "CONFIRMED" || status === "COMPLETED") {
    return "success";
  }

  if (status === "CANCELLED" || status === "NO_SHOW") {
    return "danger";
  }

  if (status === "PENDING" || status === "RESCHEDULED") {
    return "warning";
  }

  return "neutral";
}

function toNumber(value: string) {
  return value.trim() ? Number(value) : undefined;
}

type CalendarMode = "day" | "month" | "week";

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function shiftCalendarDate(value: string, mode: CalendarMode, direction: -1 | 1) {
  const date = fromDateInputValue(value);

  if (mode === "month") {
    return toDateInputValue(addMonths(date, direction));
  }

  return toDateInputValue(addDays(date, direction * (mode === "week" ? 7 : 1)));
}

function getMonthDays(anchor: Date) {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const lastDate = new Date(year, month + 1, 0).getDate();

  return Array.from({ length: lastDate }, (_, index) => new Date(year, month, index + 1));
}

function getCalendarRange(mode: CalendarMode, anchorDate: string) {
  const anchor = fromDateInputValue(anchorDate);

  if (mode === "week") {
    return toWeekBoundsIso(anchor);
  }

  if (mode === "month") {
    const days = getMonthDays(anchor);
    const first = toDayBoundsIso(days[0]);
    const last = toDayBoundsIso(days[days.length - 1]);

    return {
      from: first.from,
      to: last.to
    };
  }

  return toDayBoundsIso(anchor);
}

function getCalendarDays(mode: CalendarMode, anchorDate: string) {
  const anchor = fromDateInputValue(anchorDate);

  if (mode === "month") {
    return getMonthDays(anchor);
  }

  const start = mode === "week" ? startOfWeek(anchor) : anchor;
  return Array.from({ length: mode === "week" ? 7 : 1 }, (_, index) => addDays(start, index));
}

function formatCalendarHeader(day: Date) {
  return {
    dayNumber: new Intl.DateTimeFormat("en-US", { day: "numeric" }).format(day),
    weekday: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(day).toUpperCase()
  };
}

function formatCalendarButtonDate(value: string) {
  const date = fromDateInputValue(value);
  const today = toDateKey(new Date()) === toDateKey(date);

  if (today) {
    return "Today";
  }

  return new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short" }).format(date);
}

function getInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "A";
}

function canConfirm(appointment: AppointmentRecord) {
  return appointment.status === "PENDING" || appointment.status === "RESCHEDULED";
}

function canCancel(appointment: AppointmentRecord) {
  return appointment.status !== "CANCELLED" && appointment.status !== "COMPLETED";
}

function canComplete(appointment: AppointmentRecord) {
  return appointment.status === "CONFIRMED";
}

function QuickActions({ appointment, onAction }: { appointment: AppointmentRecord; onAction: (type: AppointmentActionType, appointment: AppointmentRecord) => void }) {
  return (
    <div className="appointment-quick-actions">
      <Button size="icon" variant="ghost" title="Confirm" disabled={!canConfirm(appointment)} onClick={() => onAction("confirm", appointment)}>
        <CheckCircle2 size={15} />
      </Button>
      <Button size="icon" variant="ghost" title="Reschedule" disabled={!canCancel(appointment)} onClick={() => onAction("reschedule", appointment)}>
        <RotateCcw size={15} />
      </Button>
      <Button size="icon" variant="ghost" title="Complete" disabled={!canComplete(appointment)} onClick={() => onAction("complete", appointment)}>
        <ClipboardCheck size={15} />
      </Button>
      <Button size="icon" variant="ghost" title="Cancel" disabled={!canCancel(appointment)} onClick={() => onAction("cancel", appointment)}>
        <XCircle size={15} />
      </Button>
    </div>
  );
}

function CalendarView({
  appointments,
  days,
  endHour,
  onSelect,
  startHour
}: {
  appointments: AppointmentRecord[];
  days: Date[];
  endHour: number;
  onSelect: (appointment: AppointmentRecord) => void;
  startHour: number;
}) {
  const calendarTotalMinutes = (endHour - startHour) * 60;
  const calendarSlotCount = calendarTotalMinutes / calendarSlotMinutes;
  const times = Array.from({ length: calendarSlotCount }, (_, index) => {
    const total = startHour * 60 + index * calendarSlotMinutes;
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  });

  return (
    <div
      className="appointment-calendar-board"
      style={{
        "--appointment-day-count": days.length,
        "--appointment-slot-count": calendarSlotCount,
        "--appointment-slot-height": `${calendarSlotHeight}px`
      } as CSSProperties}
    >
      <div className="appointment-calendar-time-spacer" />
      {days.map((day) => (
        <div className="appointment-calendar-day-header" key={toDateKey(day)}>
          <span>{formatCalendarHeader(day).weekday}</span>
          <strong>{formatCalendarHeader(day).dayNumber}</strong>
        </div>
      ))}
      <div className="appointment-calendar-times">
        {times.map((time) => <span key={time}>{time}</span>)}
      </div>
      {days.map((day) => {
        const dayKey = toDateKey(day);
        const dayAppointments = appointments.filter((appointment) => appointment.startAt && toDateKey(appointment.startAt) === dayKey);

        return (
          <div className="appointment-calendar-day-column" key={dayKey}>
            {times.map((time) => <span className="appointment-calendar-slot" key={`${dayKey}-${time}`} />)}
            {dayAppointments.map((appointment) => {
              const offset = Math.max(0, getMinutesFromDayStart(appointment.startAt) - startHour * 60);
              const duration = getDurationMinutes(appointment.startAt, appointment.endAt);
              const top = Math.min(calendarTotalMinutes - calendarSlotMinutes, offset) / calendarSlotMinutes * calendarSlotHeight;
              const height = Math.max(calendarSlotHeight, duration / calendarSlotMinutes * calendarSlotHeight);

              return (
                <article
                  className={`appointment-calendar-block appointment-status-${String(appointment.status).toLowerCase()}`}
                  key={appointment.id}
                  style={{ height, top } as CSSProperties}
                >
                  <button className="appointment-calendar-block-main" type="button" onClick={() => onSelect(appointment)}>
                    <span>{formatAppointmentTime(appointment.startAt)} - {formatAppointmentTime(appointment.endAt)}</span>
                    <strong>{appointment.title}</strong>
                    <small>{appointment.customerName} / {appointment.agentName}</small>
                  </button>
                </article>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function SelectedAppointmentPanel({
  appointment,
  onAction
}: {
  appointment?: AppointmentRecord;
  onAction: (type: AppointmentActionType, appointment: AppointmentRecord) => void;
}) {
  if (!appointment) {
    return (
      <aside className="appointment-side-panel">
        <EmptyState title="No appointment selected" description="Select a block in the calendar to review details and actions." />
      </aside>
    );
  }

  const feedback = appointment.feedbacks[0];
  const attendeeRows = [
    { id: "customer", name: appointment.customerName, role: "Customer" },
    { id: "agent", name: appointment.agentName, role: "Agent" },
    ...appointment.participants.map((participant) => ({
      id: participant.id,
      name: participant.userName,
      role: `${participant.participantRole} / ${participant.responseStatus}`
    }))
  ];
  const interest = feedback?.interestLevel || "MEDIUM";
  const rating = feedback?.rating ?? 0;

  return (
    <aside className="appointment-side-panel">
      <div className="appointment-side-header">
        <StatusBadge tone={statusTone(appointment.status)}>{appointment.status}</StatusBadge>
        <Button asChild variant="ghost" size="sm">
          <Link to={`/appointments/${appointment.id}`}>Open detail</Link>
        </Button>
      </div>
      <div>
        <h3>{appointment.title}</h3>
        <p className="muted">{appointment.meetingLocation || appointment.propertyName}</p>
      </div>
      <dl className="appointment-side-facts">
        <div>
          <dt>Time</dt>
          <dd>{formatAppointmentTime(appointment.startAt)} - {formatAppointmentTime(appointment.endAt)}</dd>
        </div>
        <div>
          <dt>Customer</dt>
          <dd>{appointment.customerName}</dd>
        </div>
        <div>
          <dt>Agent</dt>
          <dd>{appointment.agentName}</dd>
        </div>
        <div>
          <dt>Property</dt>
          <dd>{appointment.propertyName}</dd>
        </div>
      </dl>
      <section className="appointment-side-section">
        <h4>Attendees</h4>
        <div className="appointment-attendee-list">
          {attendeeRows.map((attendee) => (
            <article key={String(attendee.id)}>
              <span className="appointment-avatar">{getInitials(attendee.name)}</span>
              <div>
                <strong>{attendee.name}</strong>
                <small>{attendee.role}</small>
              </div>
              <Button size="icon" variant="ghost" title={`Message ${attendee.name}`}>
                <Mail size={15} />
              </Button>
            </article>
          ))}
        </div>
      </section>
      <section className="appointment-side-section">
        <h4>Property details</h4>
        <div className="appointment-property-grid">
          <div>
            <span>Type</span>
            <strong>{appointment.listingTitle || "Commercial Office"}</strong>
          </div>
          <div>
            <span>Size</span>
            <strong>12,500 sqft</strong>
          </div>
          <div>
            <span>Asking rent</span>
            <strong>$85 / sqft</strong>
          </div>
          <div>
            <span>Status</span>
            <strong className="appointment-property-available">Available</strong>
          </div>
        </div>
      </section>
      <div className="appointment-side-feedback">
        <h4>Viewing feedback</h4>
        <div className="appointment-interest-segment" aria-label="Interest level">
          {["LOW", "MEDIUM", "HIGH"].map((level) => (
            <span className={interest === level ? "active" : ""} key={level}>{level.charAt(0) + level.slice(1).toLowerCase()}</span>
          ))}
        </div>
        <div className="appointment-rating-stars" aria-label={`Client rating ${rating || "not rated"}`}>
          {[1, 2, 3, 4, 5].map((value) => (
            <Star className={rating >= value ? "filled" : ""} key={value} size={17} />
          ))}
        </div>
        <p>{feedback?.comments || "Feedback can be captured after the viewing."}</p>
      </div>
      <div className="appointment-side-actions">
        <Button variant="secondary" size="sm" disabled={!canConfirm(appointment)} onClick={() => onAction("confirm", appointment)}>Confirm</Button>
        <Button variant="secondary" size="sm" disabled={!canCancel(appointment)} onClick={() => onAction("reschedule", appointment)}>Reschedule</Button>
        <Button variant="secondary" size="sm" disabled={!canComplete(appointment)} onClick={() => onAction("complete", appointment)}>Complete</Button>
        <Button variant="danger" size="sm" disabled={!canCancel(appointment)} onClick={() => onAction("cancel", appointment)}>Cancel</Button>
      </div>
    </aside>
  );
}

export function AppointmentsPage({ my = false }: { my?: boolean }) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [calendarMode, setCalendarMode] = useState<CalendarMode>("week");
  const [anchorDate, setAnchorDate] = useState(toDateInputValue(new Date()));
  const [createOpen, setCreateOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [agentId, setAgentId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [sortBy, setSortBy] = useState("startAt");
  const [direction, setDirection] = useState<"ASC" | "DESC">("ASC");
  const [title, setTitle] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [leadId, setLeadId] = useState("");
  const [createCustomerId, setCreateCustomerId] = useState("");
  const [createAgentId, setCreateAgentId] = useState("");
  const [createPropertyId, setCreatePropertyId] = useState("");
  const [listingId, setListingId] = useState("");
  const [meetingLocation, setMeetingLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [rescheduleStart, setRescheduleStart] = useState("");
  const [rescheduleEnd, setRescheduleEnd] = useState("");
  const [rescheduleLocation, setRescheduleLocation] = useState("");
  const [rescheduleNotes, setRescheduleNotes] = useState("");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | string | null>(null);
  const calendarRange = useMemo(() => getCalendarRange(calendarMode, anchorDate), [anchorDate, calendarMode]);
  const calendarDays = useMemo(() => getCalendarDays(calendarMode, anchorDate), [anchorDate, calendarMode]);
  const baseFilters = useMemo<AppointmentSearchParams>(() => ({
    agentId: agentId || undefined,
    customerId: customerId || undefined,
    direction,
    propertyId: propertyId || undefined,
    sortBy,
    status: status || undefined
  }), [agentId, customerId, direction, propertyId, sortBy, status]);
  const listParams = useMemo<AppointmentSearchParams>(() => ({
    ...baseFilters,
    page,
    size: pageSize
  }), [baseFilters, page]);
  const calendarParams = useMemo<AppointmentSearchParams>(() => ({
    ...baseFilters,
    from: calendarRange.from,
    page: 0,
    size: 100,
    to: calendarRange.to
  }), [baseFilters, calendarRange]);
  const appointmentsQuery = useQuery({
    queryFn: () => (my ? getMyAppointments(listParams) : searchAppointments(listParams)),
    queryKey: [my ? "appointments-my" : "appointments", "list", listParams],
    retry: 1
  });
  const calendarQuery = useQuery({
    queryFn: () => (my ? getMyAppointments(calendarParams) : searchAppointments(calendarParams)),
    queryKey: [my ? "appointments-my" : "appointments", "calendar", calendarParams],
    retry: 1
  });
  const loadedAppointments = calendarQuery.data?.content ?? appointmentsQuery.data?.content ?? [];
  const invalidateAppointmentData = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["appointments"] }),
      queryClient.invalidateQueries({ queryKey: ["appointments-my"] })
    ]);
  const createMutation = useMutation({
    mutationFn: () =>
      createAppointment({
        agentId: toNumber(createAgentId),
        customerId: toNumber(createCustomerId),
        endAt: toIsoDateTime(endAt),
        leadId: toNumber(leadId),
        listingId: toNumber(listingId),
        meetingLocation: meetingLocation || undefined,
        notes: notes || undefined,
        propertyId: toNumber(createPropertyId),
        startAt: toIsoDateTime(startAt),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        title: title.trim()
      }),
    onSuccess: () => {
      setCreateOpen(false);
      setTitle("");
      setStartAt("");
      setEndAt("");
      setLeadId("");
      setCreateCustomerId("");
      setCreateAgentId("");
      setCreatePropertyId("");
      setListingId("");
      setMeetingLocation("");
      setNotes("");
      return invalidateAppointmentData();
    }
  });
  const actionMutation = useMutation({
    mutationFn: async () => {
      if (!pendingAction) {
        throw new Error("Missing appointment action");
      }

      if (pendingAction.type === "confirm") {
        return confirmAppointment(pendingAction.appointment.id);
      }

      if (pendingAction.type === "cancel") {
        return cancelAppointment(pendingAction.appointment.id, cancelReason.trim());
      }

      if (pendingAction.type === "complete") {
        return completeAppointment(pendingAction.appointment.id);
      }

      return rescheduleAppointment(pendingAction.appointment.id, {
        endAt: toIsoDateTime(rescheduleEnd),
        meetingLocation: rescheduleLocation || undefined,
        notes: rescheduleNotes || undefined,
        startAt: toIsoDateTime(rescheduleStart),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    },
    onSuccess: () => {
      setPendingAction(null);
      setCancelReason("");
      setRescheduleStart("");
      setRescheduleEnd("");
      setRescheduleLocation("");
      setRescheduleNotes("");
      return invalidateAppointmentData();
    }
  });
  const normalizedError = appointmentsQuery.error ? normalizeUnknownError(appointmentsQuery.error) : null;
  const calendarError = calendarQuery.error ? normalizeUnknownError(calendarQuery.error) : null;
  const actionError = createMutation.error ?? actionMutation.error;
  const normalizedActionError = actionError ? normalizeUnknownError(actionError) : null;
  const createConflict = hasAppointmentConflict(loadedAppointments, startAt ? toIsoDateTime(startAt) : "", endAt ? toIsoDateTime(endAt) : "");
  const rescheduleConflict = hasAppointmentConflict(
    loadedAppointments,
    rescheduleStart ? toIsoDateTime(rescheduleStart) : "",
    rescheduleEnd ? toIsoDateTime(rescheduleEnd) : "",
    pendingAction?.appointment.id
  );
  const rows = appointmentsQuery.data?.content ?? [];
  const selectedAppointment =
    calendarQuery.data?.content.find((appointment) => String(appointment.id) === String(selectedAppointmentId));
  const calendarWindow = {
    endHour: defaultCalendarEndHour,
    startHour: defaultCalendarStartHour
  };
  const calendarTitle = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric"
  }).format(fromDateInputValue(anchorDate));
  const columns: DataTableColumn<AppointmentRecord>[] = [
    {
      header: "Appointment",
      key: "appointment",
      render: (appointment) => (
        <span className="appointment-table-title">
          <strong>{appointment.title}</strong>
          <small>{appointment.meetingLocation || appointment.propertyName}</small>
        </span>
      )
    },
    { header: "Status", key: "status", render: (appointment) => <StatusBadge tone={statusTone(appointment.status)}>{appointment.status}</StatusBadge> },
    { header: "Start", key: "start", render: (appointment) => formatAppointmentDateTime(appointment.startAt) },
    { header: "Customer", key: "customer", render: (appointment) => appointment.customerName },
    { header: "Agent", key: "agent", render: (appointment) => appointment.agentName },
    {
      align: "right",
      header: "Actions",
      key: "actions",
      render: (appointment) => (
        <div className="appointment-row-actions">
          <QuickActions appointment={appointment} onAction={openAction} />
          <Button asChild variant="secondary" size="sm">
            <Link to={`/appointments/${appointment.id}`}>Open</Link>
          </Button>
        </div>
      )
    }
  ];

  function openAction(type: AppointmentActionType, appointment: AppointmentRecord) {
    setPendingAction({ appointment, type });
    setCancelReason("");

    if (type === "reschedule") {
      setRescheduleStart(toLocalInputValue(appointment.startAt));
      setRescheduleEnd(toLocalInputValue(appointment.endAt));
      setRescheduleLocation(appointment.meetingLocation);
      setRescheduleNotes(appointment.notes);
    }
  }

  function submitCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (title.trim() && startAt && endAt) {
      createMutation.mutate();
    }
  }

  function submitAction() {
    if (pendingAction) {
      actionMutation.mutate();
    }
  }

  function resetFilters() {
    setStatus("");
    setAgentId("");
    setCustomerId("");
    setPropertyId("");
    setPage(0);
  }

  return (
    <section className="appointments-workspace">
      <PageHeader
        eyebrow="Appointments"
        title={my ? "My appointments" : "Appointment & Viewing Calendar"}
        description="Coordinate viewings with status, participant and property filters."
        actions={(
          <>
            <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
              <Plus size={16} />
              New viewing
            </Button>
            <Button asChild variant={my ? "secondary" : "ghost"} size="sm">
              <Link to="/appointments">Team calendar</Link>
            </Button>
            <Button asChild variant={my ? "ghost" : "secondary"} size="sm">
              <Link to="/appointments/my">My appointments</Link>
            </Button>
          </>
        )}
      />
      {normalizedActionError ? <p className="form-alert">{normalizedActionError.message}</p> : null}
      <ActionBar className="appointment-filter-bar">
        <Select label="Status" options={statusOptions} value={status} onChange={(event) => {
          setStatus(event.target.value);
          setPage(0);
        }} />
        <Input label="Agent id" value={agentId} onChange={(event) => {
          setAgentId(event.target.value);
          setPage(0);
        }} />
        <Input label="Customer id" value={customerId} onChange={(event) => {
          setCustomerId(event.target.value);
          setPage(0);
        }} />
        <Input label="Property id" value={propertyId} onChange={(event) => {
          setPropertyId(event.target.value);
          setPage(0);
        }} />
        <Select label="Sort" options={[
          { label: "Start time", value: "startAt" },
          { label: "Updated", value: "updatedAt" },
          { label: "Status", value: "status" }
        ]} value={sortBy} onChange={(event) => setSortBy(event.target.value)} />
        <Select label="Direction" options={[
          { label: "Ascending", value: "ASC" },
          { label: "Descending", value: "DESC" }
        ]} value={direction} onChange={(event) => setDirection(event.target.value as "ASC" | "DESC")} />
        <Button variant="secondary" onClick={resetFilters}>Reset</Button>
      </ActionBar>
      <SectionCard
        title={view === "calendar" ? calendarTitle : "Appointment list"}
        actions={(
          <>
            {view === "calendar" ? (
              <div className="appointment-calendar-legend" aria-label="Calendar status legend">
                <span><b className="appointment-legend-dot appointment-legend-pending" />Pending</span>
                <span><b className="appointment-legend-dot appointment-legend-confirmed" />Confirmed</span>
                <span><b className="appointment-legend-dot appointment-legend-completed" />Completed</span>
              </div>
            ) : null}
            <Button variant={view === "calendar" ? "primary" : "secondary"} onClick={() => setView("calendar")}>
              <CalendarDays size={16} />
              Calendar
            </Button>
            <Button variant={view === "list" ? "primary" : "secondary"} onClick={() => setView("list")}>
              <List size={16} />
              List
            </Button>
          </>
        )}
      >
        {view === "calendar" ? (
          <>
            <div className="appointment-calendar-toolbar">
              <div className="appointment-date-group" aria-label="Date navigation">
                <button type="button" onClick={() => setAnchorDate(shiftCalendarDate(anchorDate, calendarMode, -1))}>
                  <ChevronLeft size={16} />
                </button>
                <input aria-label="Calendar date" type="date" value={anchorDate} onChange={(event) => setAnchorDate(event.target.value)} />
                <strong>{formatCalendarButtonDate(anchorDate)}</strong>
                <button type="button" onClick={() => setAnchorDate(shiftCalendarDate(anchorDate, calendarMode, 1))}>
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className="appointment-view-group" aria-label="Calendar view">
                <button className={calendarMode === "week" ? "active" : ""} type="button" onClick={() => setCalendarMode("week")}>Week</button>
                <button className={calendarMode === "day" ? "active" : ""} type="button" onClick={() => setCalendarMode("day")}>Day</button>
                <button className={calendarMode === "month" ? "active" : ""} type="button" onClick={() => setCalendarMode("month")}>Month</button>
              </div>
              <Button className="appointment-new-viewing" variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
                <Plus size={16} />
                New viewing
              </Button>
            </div>
            {calendarError ? (
              <EmptyState title="Calendar could not be loaded" description={calendarError.message} action={<Button onClick={() => calendarQuery.refetch()}>Retry</Button>} />
            ) : null}
            {!calendarError && calendarQuery.data?.content.length === 0 ? (
              <EmptyState title="No appointments found" description="Create a viewing or adjust filters." />
            ) : null}
            {!calendarError && calendarQuery.data ? (
              <div className={`appointment-calendar-layout${selectedAppointment ? " appointment-calendar-layout-detail-open" : ""}`}>
                <CalendarView
                  appointments={calendarQuery.data.content}
                  days={calendarDays}
                  endHour={calendarWindow.endHour}
                  onSelect={(appointment) => setSelectedAppointmentId(appointment.id)}
                  startHour={calendarWindow.startHour}
                />
                {selectedAppointment ? <SelectedAppointmentPanel appointment={selectedAppointment} onAction={openAction} /> : null}
              </div>
            ) : null}
          </>
        ) : (
          <>
            {normalizedError ? (
              <EmptyState title="Appointments could not be loaded" description={normalizedError.message} action={<Button onClick={() => appointmentsQuery.refetch()}>Retry</Button>} />
            ) : null}
            {!normalizedError ? <DataTable columns={columns} rows={rows} getRowKey={(appointment) => appointment.id} emptyMessage="No appointments found" /> : null}
            {appointmentsQuery.data ? (
              <Pagination page={appointmentsQuery.data.page} totalPages={appointmentsQuery.data.totalPages} onPageChange={setPage} />
            ) : null}
          </>
        )}
      </SectionCard>
      <Dialog
        open={Boolean(pendingAction)}
        onClose={() => setPendingAction(null)}
        title={pendingAction ? `${pendingAction.type} appointment` : "Appointment action"}
      >
        <div className="dialog-body">
          <p>{pendingAction?.appointment.title}</p>
          {pendingAction?.type === "cancel" ? (
            <textarea className="input textarea" value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} placeholder="Cancellation reason" />
          ) : null}
          {pendingAction?.type === "reschedule" ? (
            <div className="appointment-reschedule-form">
              <Input label="New start" type="datetime-local" value={rescheduleStart} onChange={(event) => setRescheduleStart(event.target.value)} />
              <Input label="New end" type="datetime-local" value={rescheduleEnd} onChange={(event) => setRescheduleEnd(event.target.value)} />
              <Input label="Meeting location" value={rescheduleLocation} onChange={(event) => setRescheduleLocation(event.target.value)} />
              <textarea className="input textarea" value={rescheduleNotes} onChange={(event) => setRescheduleNotes(event.target.value)} placeholder="Reschedule notes" />
              {rescheduleConflict ? <p className="form-alert">Conflict warning: this time overlaps with an appointment already loaded in the calendar.</p> : null}
            </div>
          ) : null}
        </div>
        <footer className="dialog-actions">
          <Button variant="secondary" onClick={() => setPendingAction(null)}>Cancel</Button>
          <Button
            variant={pendingAction?.type === "cancel" ? "danger" : "primary"}
            onClick={submitAction}
            disabled={
              actionMutation.isPending ||
              (pendingAction?.type === "cancel" && !cancelReason.trim()) ||
              (pendingAction?.type === "reschedule" && (!rescheduleStart || !rescheduleEnd))
            }
          >
            Confirm
          </Button>
        </footer>
      </Dialog>
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} title="New viewing">
        <form className="dialog-body appointment-create-form appointment-create-dialog" onSubmit={submitCreate}>
          <Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
          <Input label="Start" type="datetime-local" value={startAt} onChange={(event) => setStartAt(event.target.value)} />
          <Input label="End" type="datetime-local" value={endAt} onChange={(event) => setEndAt(event.target.value)} />
          <Input label="Customer id" value={createCustomerId} onChange={(event) => setCreateCustomerId(event.target.value)} />
          <Input label="Agent id" value={createAgentId} onChange={(event) => setCreateAgentId(event.target.value)} />
          <Input label="Property id" value={createPropertyId} onChange={(event) => setCreatePropertyId(event.target.value)} />
          <Input label="Listing id" value={listingId} onChange={(event) => setListingId(event.target.value)} />
          <Input label="Lead id" value={leadId} onChange={(event) => setLeadId(event.target.value)} />
          <Input label="Meeting location" value={meetingLocation} onChange={(event) => setMeetingLocation(event.target.value)} />
          <Input label="Notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
          {createConflict ? <p className="form-alert">Conflict warning: this time overlaps with an appointment already loaded in the calendar.</p> : null}
          <footer className="dialog-actions appointment-create-actions">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={!title.trim() || !startAt || !endAt || createMutation.isPending}>
              <Plus size={16} />
              Create appointment
            </Button>
          </footer>
        </form>
      </Dialog>
    </section>
  );
}
