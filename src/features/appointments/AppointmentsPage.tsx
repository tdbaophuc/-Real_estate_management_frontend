import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { CalendarDays, List, Plus } from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Input } from "../../shared/ui/Input";
import { Pagination } from "../../shared/ui/Pagination";
import { Select } from "../../shared/ui/Select";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { Table } from "../../shared/ui/Table";
import {
  createAppointment,
  getMyAppointments,
  searchAppointments,
  type AppointmentRecord,
  type AppointmentStatus
} from "./appointmentApi";
import { formatAppointmentDateTime, hasAppointmentConflict, toIsoDateTime } from "./appointmentTime";

const pageSize = 10;

const statusOptions = [
  { label: "Any status", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "No show", value: "NO_SHOW" },
  { label: "Rescheduled", value: "RESCHEDULED" }
];

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

function CalendarView({ appointments }: { appointments: AppointmentRecord[] }) {
  const grouped = appointments.reduce<Record<string, AppointmentRecord[]>>((acc, appointment) => {
    const key = appointment.startTime
      ? new Date(appointment.startTime).toISOString().slice(0, 10)
      : "unscheduled";
    acc[key] = [...(acc[key] ?? []), appointment];
    return acc;
  }, {});

  return (
    <div className="appointment-calendar">
      {Object.entries(grouped).map(([date, items]) => (
        <section className="appointment-day" key={date}>
          <h3>{date}</h3>
          {items.map((appointment) => (
            <Link to={`/appointments/${appointment.id}`} className="appointment-calendar-item" key={appointment.id}>
              <StatusBadge tone={statusTone(appointment.status)}>{appointment.status}</StatusBadge>
              <strong>{appointment.title}</strong>
              <small>{formatAppointmentDateTime(appointment.startTime)}</small>
            </Link>
          ))}
        </section>
      ))}
    </div>
  );
}

export function AppointmentsPage({ my = false }: { my?: boolean }) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("");
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [leadId, setLeadId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [agentId, setAgentId] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [listingId, setListingId] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const queryParams = useMemo(() => ({ page, size: pageSize, status }), [page, status]);
  const appointmentsQuery = useQuery({
    queryFn: () => (my ? getMyAppointments(queryParams) : searchAppointments(queryParams)),
    queryKey: [my ? "appointments-my" : "appointments", queryParams],
    retry: 1
  });
  const boardQuery = useQuery({
    queryFn: () => (my ? getMyAppointments({ page: 0, size: 100 }) : searchAppointments({ page: 0, size: 100 })),
    queryKey: [my ? "appointments-my" : "appointments", "calendar"],
    retry: 1
  });
  const createMutation = useMutation({
    mutationFn: () =>
      createAppointment({
        agentId: toNumber(agentId),
        customerId: toNumber(customerId),
        endTime: toIsoDateTime(endTime),
        leadId: toNumber(leadId),
        listingId: toNumber(listingId),
        location: location || undefined,
        notes: notes || undefined,
        propertyId: toNumber(propertyId),
        startTime: toIsoDateTime(startTime),
        title: title.trim()
      }),
    onSuccess: () => {
      setTitle("");
      setStartTime("");
      setEndTime("");
      setLeadId("");
      setCustomerId("");
      setAgentId("");
      setPropertyId("");
      setListingId("");
      setLocation("");
      setNotes("");
      void queryClient.invalidateQueries({ queryKey: ["appointments"] });
      void queryClient.invalidateQueries({ queryKey: ["appointments-my"] });
    }
  });
  const normalizedError = appointmentsQuery.error ? normalizeUnknownError(appointmentsQuery.error) : null;
  const loadedAppointments = boardQuery.data?.content ?? appointmentsQuery.data?.content ?? [];
  const startIso = startTime ? toIsoDateTime(startTime) : "";
  const endIso = endTime ? toIsoDateTime(endTime) : "";
  const hasConflict = hasAppointmentConflict(loadedAppointments, startIso, endIso);

  function submitCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (title.trim() && startTime && endTime) {
      createMutation.mutate();
    }
  }

  return (
    <section>
      <div className="section-header">
        <div>
          <p className="eyebrow">Appointments</p>
          <h2>{my ? "My appointments" : "Appointment calendar"}</h2>
        </div>
        <div className="filter-actions">
          <Button asChild variant={my ? "secondary" : "ghost"} size="sm">
            <Link to="/appointments">Team calendar</Link>
          </Button>
          <Button asChild variant={my ? "ghost" : "secondary"} size="sm">
            <Link to="/appointments/my">My appointments</Link>
          </Button>
        </div>
      </div>
      <section className="content-section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Create</p>
            <h2>New viewing</h2>
          </div>
        </div>
        <form className="appointment-create-form" onSubmit={submitCreate}>
          <Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
          <Input label="Start" type="datetime-local" value={startTime} onChange={(event) => setStartTime(event.target.value)} />
          <Input label="End" type="datetime-local" value={endTime} onChange={(event) => setEndTime(event.target.value)} />
          <Input label="Lead id" value={leadId} onChange={(event) => setLeadId(event.target.value)} />
          <Input label="Customer id" value={customerId} onChange={(event) => setCustomerId(event.target.value)} />
          <Input label="Agent id" value={agentId} onChange={(event) => setAgentId(event.target.value)} />
          <Input label="Property id" value={propertyId} onChange={(event) => setPropertyId(event.target.value)} />
          <Input label="Listing id" value={listingId} onChange={(event) => setListingId(event.target.value)} />
          <Input label="Location" value={location} onChange={(event) => setLocation(event.target.value)} />
          <Input label="Notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
          <Button type="submit" disabled={!title.trim() || !startTime || !endTime || createMutation.isPending}>
            <Plus size={16} />
            Create appointment
          </Button>
        </form>
        {hasConflict ? (
          <p className="form-alert">Conflict warning: this time overlaps with an appointment already loaded in the calendar.</p>
        ) : null}
        {createMutation.error ? <p className="form-alert">{normalizeUnknownError(createMutation.error).message}</p> : null}
      </section>
      <div className="section-header">
        <div>
          <p className="eyebrow">Schedule</p>
          <h2>{view === "calendar" ? "Calendar view" : "List view"}</h2>
        </div>
        <div className="filter-actions">
          <Select label="Status" options={statusOptions} value={status} onChange={(event) => {
            setStatus(event.target.value);
            setPage(0);
          }} />
          <Button type="button" variant={view === "calendar" ? "primary" : "secondary"} onClick={() => setView("calendar")}>
            <CalendarDays size={16} />
            Calendar
          </Button>
          <Button type="button" variant={view === "list" ? "primary" : "secondary"} onClick={() => setView("list")}>
            <List size={16} />
            List
          </Button>
        </div>
      </div>
      {normalizedError ? (
        <div className="content-section">
          <EmptyState title="Appointments could not be loaded" description={normalizedError.message} action={<Button onClick={() => appointmentsQuery.refetch()}>Retry</Button>} />
        </div>
      ) : null}
      {appointmentsQuery.data?.content.length === 0 ? (
        <div className="content-section">
          <EmptyState title="No appointments found" description="Create a viewing or adjust the status filter." />
        </div>
      ) : null}
      {appointmentsQuery.data && appointmentsQuery.data.content.length > 0 && view === "calendar" ? (
        <CalendarView appointments={appointmentsQuery.data.content} />
      ) : null}
      {appointmentsQuery.data && appointmentsQuery.data.content.length > 0 && view === "list" ? (
        <>
          <Table>
            <thead>
              <tr>
                <th>Appointment</th>
                <th>Status</th>
                <th>Start</th>
                <th>End</th>
                <th>Agent</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {appointmentsQuery.data.content.map((appointment) => (
                <tr key={appointment.id}>
                  <td>
                    <strong>{appointment.title}</strong>
                    <small>{appointment.location || "Location updating"}</small>
                  </td>
                  <td><StatusBadge tone={statusTone(appointment.status)}>{appointment.status}</StatusBadge></td>
                  <td>{formatAppointmentDateTime(appointment.startTime)}</td>
                  <td>{formatAppointmentDateTime(appointment.endTime)}</td>
                  <td>{appointment.agentId ?? "Unassigned"}</td>
                  <td>
                    <Button asChild variant="secondary" size="sm">
                      <Link to={`/appointments/${appointment.id}`}>Open</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination page={appointmentsQuery.data.page} totalPages={appointmentsQuery.data.totalPages} onPageChange={setPage} />
        </>
      ) : null}
    </section>
  );
}
