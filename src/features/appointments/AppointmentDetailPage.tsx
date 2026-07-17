import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarClock, CheckCircle2, ClipboardCheck, MessageSquare, RotateCcw, Star, Users, XCircle } from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { ActionBar } from "../../shared/ui/ActionBar";
import { Button } from "../../shared/ui/Button";
import { DetailGrid } from "../../shared/ui/DetailGrid";
import { Dialog } from "../../shared/ui/Dialog";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Input } from "../../shared/ui/Input";
import { PageHeader } from "../../shared/ui/PageHeader";
import { SectionCard } from "../../shared/ui/SectionCard";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { Timeline, type TimelineItem } from "../../shared/ui/Timeline";
import {
  addViewingFeedback,
  cancelAppointment,
  completeAppointment,
  confirmAppointment,
  getAppointment,
  rescheduleAppointment,
  searchAppointments
} from "./appointmentApi";
import {
  formatAppointmentDateTime,
  hasAppointmentConflict,
  toIsoDateTime,
  toLocalInputValue
} from "./appointmentTime";

type PendingAction = "cancel" | "complete" | "confirm" | "reschedule" | null;

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

function canConfirm(status: string) {
  return status === "PENDING" || status === "RESCHEDULED";
}

function canCancel(status: string) {
  return status !== "CANCELLED" && status !== "COMPLETED";
}

function canComplete(status: string) {
  return status === "CONFIRMED";
}

function lifecycleTimeline(appointment: NonNullable<Awaited<ReturnType<typeof getAppointment>>>) {
  const items: TimelineItem[] = [];

  if (appointment.createdAt) {
    items.push({
      description: appointment.createdByName ? `Created by ${appointment.createdByName}` : "Appointment created",
      meta: formatAppointmentDateTime(appointment.createdAt),
      title: "Created"
    });
  }

  if (appointment.rescheduledFromId) {
    items.push({
      description: `Rescheduled from appointment #${appointment.rescheduledFromId}`,
      meta: appointment.updatedAt ? formatAppointmentDateTime(appointment.updatedAt) : undefined,
      title: "Rescheduled"
    });
  }

  if (appointment.confirmedAt) {
    items.push({ description: "Viewing confirmed", meta: formatAppointmentDateTime(appointment.confirmedAt), title: "Confirmed" });
  }

  if (appointment.cancelledAt) {
    items.push({
      description: appointment.cancellationReason || "Appointment cancelled",
      meta: formatAppointmentDateTime(appointment.cancelledAt),
      title: "Cancelled"
    });
  }

  if (appointment.completedAt) {
    items.push({ description: "Viewing completed", meta: formatAppointmentDateTime(appointment.completedAt), title: "Completed" });
  }

  return items;
}

export function AppointmentDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [rescheduleStart, setRescheduleStart] = useState("");
  const [rescheduleEnd, setRescheduleEnd] = useState("");
  const [rescheduleLocation, setRescheduleLocation] = useState("");
  const [rescheduleNotes, setRescheduleNotes] = useState("");
  const [rating, setRating] = useState("");
  const [interestLevel, setInterestLevel] = useState("MEDIUM");
  const [comments, setComments] = useState("");
  const [positivePoints, setPositivePoints] = useState("");
  const [concerns, setConcerns] = useState("");
  const [nextAction, setNextAction] = useState("");
  const appointmentQuery = useQuery({
    enabled: Boolean(id),
    queryFn: () => getAppointment(id ?? ""),
    queryKey: ["appointment", id],
    retry: 1
  });
  const loadedAppointmentsQuery = useQuery({
    queryFn: () => searchAppointments({ page: 0, size: 100, sortBy: "startAt" }),
    queryKey: ["appointments", "calendar", "detail-conflicts"],
    retry: 1
  });
  const invalidateAppointmentData = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["appointment", id] }),
      queryClient.invalidateQueries({ queryKey: ["appointments"] }),
      queryClient.invalidateQueries({ queryKey: ["appointments-my"] })
    ]);
  const actionMutation = useMutation({
    mutationFn: async () => {
      if (!id || !pendingAction) {
        throw new Error("Missing appointment action");
      }

      if (pendingAction === "confirm") {
        return confirmAppointment(id);
      }

      if (pendingAction === "cancel") {
        return cancelAppointment(id, cancelReason.trim());
      }

      if (pendingAction === "complete") {
        return completeAppointment(id);
      }

      return rescheduleAppointment(id, {
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
      return invalidateAppointmentData();
    }
  });
  const feedbackMutation = useMutation({
    mutationFn: () =>
      addViewingFeedback(id ?? "", {
        comments: comments.trim(),
        concerns: concerns || undefined,
        interestLevel,
        nextAction: nextAction || undefined,
        positivePoints: positivePoints || undefined,
        rating: rating ? Number(rating) : undefined
      }),
    onSuccess: () => {
      setRating("");
      setInterestLevel("MEDIUM");
      setComments("");
      setPositivePoints("");
      setConcerns("");
      setNextAction("");
      return invalidateAppointmentData();
    }
  });
  const appointment = appointmentQuery.data;
  const normalizedError = appointmentQuery.error ? normalizeUnknownError(appointmentQuery.error) : null;
  const actionError = actionMutation.error ?? feedbackMutation.error;
  const normalizedActionError = actionError ? normalizeUnknownError(actionError) : null;
  const hasRescheduleConflict = hasAppointmentConflict(
    loadedAppointmentsQuery.data?.content ?? [],
    rescheduleStart ? toIsoDateTime(rescheduleStart) : "",
    rescheduleEnd ? toIsoDateTime(rescheduleEnd) : "",
    id
  );
  const timelineItems = useMemo(() => (appointment ? lifecycleTimeline(appointment) : []), [appointment]);

  if (!id) {
    return (
      <section className="content-section">
        <EmptyState title="Appointment not found" description="The appointment URL is missing an id." />
      </section>
    );
  }

  if (appointmentQuery.isLoading) {
    return (
      <section className="detail-skeleton">
        <div />
        <div />
      </section>
    );
  }

  if (normalizedError) {
    return (
      <section className="content-section">
        <EmptyState title="Appointment could not be loaded" description={normalizedError.message} action={<Button onClick={() => appointmentQuery.refetch()}>Retry</Button>} />
      </section>
    );
  }

  if (!appointment) {
    return null;
  }

  function openAction(action: PendingAction) {
    if (!appointment) {
      return;
    }

    setPendingAction(action);
    setCancelReason("");

    if (action === "reschedule") {
      setRescheduleStart(toLocalInputValue(appointment.startAt));
      setRescheduleEnd(toLocalInputValue(appointment.endAt));
      setRescheduleLocation(appointment.meetingLocation);
      setRescheduleNotes(appointment.notes);
    }
  }

  function submitAction() {
    if (pendingAction) {
      actionMutation.mutate();
    }
  }

  function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (comments.trim()) {
      feedbackMutation.mutate();
    }
  }

  return (
    <section className="appointment-detail-workspace">
      <Button asChild variant="ghost" size="sm">
        <Link to="/appointments">
          <ArrowLeft size={16} />
          Back to appointments
        </Link>
      </Button>
      <PageHeader
        eyebrow="Appointment Detail & Feedback"
        title={appointment.title}
        description={appointment.meetingLocation || appointment.propertyName}
        meta={(
          <>
            <StatusBadge tone={statusTone(appointment.status)}>{appointment.status}</StatusBadge>
            {appointment.code ? <span className="muted">#{appointment.code}</span> : null}
          </>
        )}
        actions={(
          <>
            <Button variant="secondary" disabled={!canConfirm(appointment.status)} onClick={() => openAction("confirm")}>
              <CheckCircle2 size={16} />
              Confirm
            </Button>
            <Button variant="secondary" disabled={!canCancel(appointment.status)} onClick={() => openAction("reschedule")}>
              <RotateCcw size={16} />
              Reschedule
            </Button>
            <Button variant="secondary" disabled={!canComplete(appointment.status)} onClick={() => openAction("complete")}>
              <ClipboardCheck size={16} />
              Complete
            </Button>
            <Button variant="danger" disabled={!canCancel(appointment.status)} onClick={() => openAction("cancel")}>
              <XCircle size={16} />
              Cancel
            </Button>
          </>
        )}
      />
      {normalizedActionError ? <p className="form-alert">{normalizedActionError.message}</p> : null}
      <div className="appointment-detail-layout">
        <div className="appointment-detail-main">
          <SectionCard title="Schedule" description="Viewing time, property and source links." actions={<CalendarClock size={20} />}>
            <DetailGrid
              items={[
                { label: "Start", value: formatAppointmentDateTime(appointment.startAt) },
                { label: "End", value: formatAppointmentDateTime(appointment.endAt) },
                { label: "Timezone", value: appointment.timezone },
                { label: "Location", value: appointment.meetingLocation || "Location updating" },
                { label: "Property", value: appointment.propertyName || appointment.propertyId || "Not linked" },
                { label: "Listing", value: appointment.listingTitle || appointment.listingId || "Not linked" },
                { label: "Lead", value: appointment.leadCode || appointment.leadId || "Not linked" },
                { label: "Created by", value: appointment.createdByName || appointment.createdById || "Unknown" }
              ]}
            />
            {appointment.notes ? <p className="muted">{appointment.notes}</p> : null}
          </SectionCard>
          <SectionCard title="Location" description={appointment.meetingLocation || "Service location updates when the appointment is linked to a property."}>
            <div className="appointment-location-map">
              <span />
              <strong>{appointment.meetingLocation || appointment.propertyName}</strong>
            </div>
          </SectionCard>
          <div className="appointment-detail-grid">
            <SectionCard title="Status lifecycle" description="Confirmation, cancellation, reschedule and completion history.">
              <Timeline items={timelineItems} emptyMessage="No lifecycle activity yet" />
            </SectionCard>
            <SectionCard title="Cancellation and reschedule data" description="Operational data from the current appointment record.">
              <DetailGrid
                items={[
                  { label: "Rescheduled from", value: appointment.rescheduledFromId || "Original appointment" },
                  { label: "Cancellation reason", value: appointment.cancellationReason || "None" },
                  { label: "Cancelled by", value: appointment.cancelledById || "None" },
                  { label: "Cancelled at", value: appointment.cancelledAt ? formatAppointmentDateTime(appointment.cancelledAt) : "None" },
                  { label: "Confirmed at", value: appointment.confirmedAt ? formatAppointmentDateTime(appointment.confirmedAt) : "Pending" },
                  { label: "Completed at", value: appointment.completedAt ? formatAppointmentDateTime(appointment.completedAt) : "Pending" }
                ]}
              />
            </SectionCard>
          </div>
        </div>
        <aside className="appointment-detail-rail">
          <SectionCard title="Participants" description="Customer, agent and invited participants." actions={<Users size={20} />}>
            <div className="appointment-participant-summary">
              <article>
                <span>Customer</span>
                <strong>{appointment.customerName}</strong>
                <small>{appointment.customerId ? `#${appointment.customerId}` : "Not linked"}</small>
              </article>
              <article>
                <span>Agent</span>
                <strong>{appointment.agentName}</strong>
                <small>{appointment.agentId ? `#${appointment.agentId}` : "Unassigned"}</small>
              </article>
            </div>
            <div className="appointment-participant-list">
              {appointment.participants.length ? appointment.participants.map((participant) => (
                <article key={participant.id}>
                  <div>
                    <strong>{participant.userName}</strong>
                    <small>{participant.participantRole} / {participant.responseStatus}</small>
                  </div>
                  {participant.respondedAt ? <span>{formatAppointmentDateTime(participant.respondedAt)}</span> : null}
                  {participant.notes ? <p>{participant.notes}</p> : null}
                </article>
              )) : <p className="timeline-empty">No participants returned by API.</p>}
            </div>
          </SectionCard>
          <SectionCard title="Viewing feedback" description="Capture buyer reaction and next action after completion." actions={<MessageSquare size={20} />}>
            <form className="appointment-feedback-form" onSubmit={submitFeedback}>
              <div className="appointment-feedback-field">
                <span>Interest</span>
                <div className="appointment-interest-segment appointment-interest-buttons">
                  {["LOW", "MEDIUM", "HIGH"].map((level) => (
                    <button
                      className={interestLevel === level ? "active" : ""}
                      key={level}
                      type="button"
                      onClick={() => setInterestLevel(level)}
                    >
                      {level.charAt(0) + level.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="appointment-feedback-field">
                <span>Client rating</span>
                <div className="appointment-rating-stars appointment-rating-buttons">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      aria-label={`${value} star rating`}
                      className={Number(rating) >= value ? "filled" : ""}
                      key={value}
                      type="button"
                      onClick={() => setRating(String(value))}
                    >
                      <Star size={18} />
                    </button>
                  ))}
                </div>
              </div>
              <textarea className="input textarea" value={comments} onChange={(event) => setComments(event.target.value)} placeholder="Buyer reaction and overall comments" />
              <Input label="Positive points" value={positivePoints} onChange={(event) => setPositivePoints(event.target.value)} />
              <Input label="Concerns" value={concerns} onChange={(event) => setConcerns(event.target.value)} />
              <Input label="Next action" value={nextAction} onChange={(event) => setNextAction(event.target.value)} />
              <Button type="submit" disabled={!comments.trim() || feedbackMutation.isPending}>
                Add feedback
              </Button>
            </form>
            <div className="appointment-feedback-list">
              {appointment.feedbacks.length ? appointment.feedbacks.map((item) => (
                <article key={item.id}>
                  <header>
                    <strong>{item.submittedByName}</strong>
                    <StatusBadge tone={item.interestLevel === "HIGH" ? "success" : item.interestLevel === "LOW" ? "danger" : "warning"}>{item.interestLevel}</StatusBadge>
                  </header>
                  <p>{item.comments}</p>
                  <div className="appointment-feedback-meta">
                    <span className="appointment-feedback-stars">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Star className={(item.rating ?? 0) >= value ? "filled" : ""} key={value} size={14} />
                      ))}
                    </span>
                    {item.positivePoints ? <span>Positive: {item.positivePoints}</span> : null}
                    {item.concerns ? <span>Concerns: {item.concerns}</span> : null}
                    {item.nextAction ? <span>Next: {item.nextAction}</span> : null}
                    {item.createdAt ? <span>{formatAppointmentDateTime(item.createdAt)}</span> : null}
                  </div>
                </article>
              )) : <p className="timeline-empty">No viewing feedback yet.</p>}
            </div>
          </SectionCard>
        </aside>
      </div>
      <ActionBar sticky>
        <Button variant="secondary" disabled={!canConfirm(appointment.status)} onClick={() => openAction("confirm")}>Confirm</Button>
        <Button variant="secondary" disabled={!canCancel(appointment.status)} onClick={() => openAction("reschedule")}>Reschedule</Button>
        <Button variant="secondary" disabled={!canComplete(appointment.status)} onClick={() => openAction("complete")}>Complete</Button>
        <Button variant="danger" disabled={!canCancel(appointment.status)} onClick={() => openAction("cancel")}>Cancel</Button>
      </ActionBar>
      <Dialog
        open={Boolean(pendingAction)}
        onClose={() => setPendingAction(null)}
        title={pendingAction ? `${pendingAction} appointment` : "Appointment action"}
      >
        <div className="dialog-body">
          <p>Confirm this appointment action?</p>
          {pendingAction === "cancel" ? (
            <textarea className="input textarea" value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} placeholder="Cancellation reason" />
          ) : null}
          {pendingAction === "reschedule" ? (
            <div className="appointment-reschedule-form">
              <Input label="New start" type="datetime-local" value={rescheduleStart} onChange={(event) => setRescheduleStart(event.target.value)} />
              <Input label="New end" type="datetime-local" value={rescheduleEnd} onChange={(event) => setRescheduleEnd(event.target.value)} />
              <Input label="Meeting location" value={rescheduleLocation} onChange={(event) => setRescheduleLocation(event.target.value)} />
              <textarea className="input textarea" value={rescheduleNotes} onChange={(event) => setRescheduleNotes(event.target.value)} placeholder="Reschedule notes" />
              {hasRescheduleConflict ? <p className="form-alert">Conflict warning: this time overlaps with an appointment already loaded in the calendar.</p> : null}
            </div>
          ) : null}
        </div>
        <footer className="dialog-actions">
          <Button variant="secondary" onClick={() => setPendingAction(null)}>Cancel</Button>
          <Button
            variant={pendingAction === "cancel" ? "danger" : "primary"}
            onClick={submitAction}
            disabled={
              actionMutation.isPending ||
              (pendingAction === "cancel" && !cancelReason.trim()) ||
              (pendingAction === "reschedule" && (!rescheduleStart || !rescheduleEnd))
            }
          >
            Confirm
          </Button>
        </footer>
      </Dialog>
    </section>
  );
}
