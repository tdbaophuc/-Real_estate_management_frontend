import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock, MessageSquare, XCircle } from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { Dialog } from "../../shared/ui/Dialog";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Input } from "../../shared/ui/Input";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import {
  addViewingFeedback,
  cancelAppointment,
  completeAppointment,
  confirmAppointment,
  getAppointment,
  searchAppointments,
  rescheduleAppointment
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

  return "warning";
}

export function AppointmentDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [rescheduleStart, setRescheduleStart] = useState("");
  const [rescheduleEnd, setRescheduleEnd] = useState("");
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState("");
  const appointmentQuery = useQuery({
    enabled: Boolean(id),
    queryFn: () => getAppointment(id ?? ""),
    queryKey: ["appointment", id],
    retry: 1
  });
  const loadedAppointmentsQuery = useQuery({
    queryFn: () => searchAppointments({ page: 0, size: 100 }),
    queryKey: ["appointments", "calendar"],
    retry: 1
  });
  const invalidateAppointmentData = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["appointment", id] }),
      queryClient.invalidateQueries({ queryKey: ["appointments"] }),
      queryClient.invalidateQueries({ queryKey: ["appointments-my"] })
    ]);
  const confirmMutation = useMutation({
    mutationFn: () => confirmAppointment(id ?? ""),
    onSuccess: () => {
      setPendingAction(null);
      return invalidateAppointmentData();
    }
  });
  const cancelMutation = useMutation({
    mutationFn: () => cancelAppointment(id ?? "", cancelReason.trim()),
    onSuccess: () => {
      setPendingAction(null);
      setCancelReason("");
      return invalidateAppointmentData();
    }
  });
  const rescheduleMutation = useMutation({
    mutationFn: () => rescheduleAppointment(id ?? "", toIsoDateTime(rescheduleStart), toIsoDateTime(rescheduleEnd)),
    onSuccess: () => {
      setPendingAction(null);
      return invalidateAppointmentData();
    }
  });
  const completeMutation = useMutation({
    mutationFn: () => completeAppointment(id ?? ""),
    onSuccess: () => {
      setPendingAction(null);
      return invalidateAppointmentData();
    }
  });
  const feedbackMutation = useMutation({
    mutationFn: () => addViewingFeedback(id ?? "", { feedback: feedback.trim(), rating: rating ? Number(rating) : undefined }),
    onSuccess: () => {
      setFeedback("");
      setRating("");
      return invalidateAppointmentData();
    }
  });
  const appointment = appointmentQuery.data;
  const normalizedError = appointmentQuery.error ? normalizeUnknownError(appointmentQuery.error) : null;
  const actionError =
    confirmMutation.error ??
    cancelMutation.error ??
    rescheduleMutation.error ??
    completeMutation.error ??
    feedbackMutation.error;
  const normalizedActionError = actionError ? normalizeUnknownError(actionError) : null;
  const hasRescheduleConflict = hasAppointmentConflict(
    loadedAppointmentsQuery.data?.content ?? [],
    rescheduleStart ? toIsoDateTime(rescheduleStart) : "",
    rescheduleEnd ? toIsoDateTime(rescheduleEnd) : "",
    id
  );

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

  function openReschedule() {
    if (!appointment) {
      return;
    }

    setRescheduleStart(toLocalInputValue(appointment.startTime));
    setRescheduleEnd(toLocalInputValue(appointment.endTime));
    setPendingAction("reschedule");
  }

  function confirmAction() {
    if (pendingAction === "confirm") {
      confirmMutation.mutate();
    }

    if (pendingAction === "cancel") {
      cancelMutation.mutate();
    }

    if (pendingAction === "reschedule") {
      rescheduleMutation.mutate();
    }

    if (pendingAction === "complete") {
      completeMutation.mutate();
    }
  }

  function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (feedback.trim()) {
      feedbackMutation.mutate();
    }
  }

  return (
    <section>
      <Button asChild variant="ghost" size="sm">
        <Link to="/appointments">
          <ArrowLeft size={16} />
          Back to appointments
        </Link>
      </Button>
      <div className="detail-header">
        <div>
          <div className="detail-badges">
            <StatusBadge tone={statusTone(appointment.status)}>{appointment.status}</StatusBadge>
          </div>
          <h1>{appointment.title}</h1>
          <p className="muted">{appointment.location || "Location updating"}</p>
        </div>
      </div>
      {normalizedActionError ? <p className="form-alert">{normalizedActionError.message}</p> : null}
      <div className="appointment-detail-grid">
        <section className="content-section appointment-profile-card">
          <p className="eyebrow">Schedule</p>
          <div><span>Start</span><strong>{formatAppointmentDateTime(appointment.startTime)}</strong></div>
          <div><span>End</span><strong>{formatAppointmentDateTime(appointment.endTime)}</strong></div>
          <div><span>Agent</span><strong>{appointment.agentId ?? "Unassigned"}</strong></div>
          <div><span>Customer</span><strong>{appointment.customerId ?? "Not linked"}</strong></div>
          <div><span>Lead</span><strong>{appointment.leadId ?? "Not linked"}</strong></div>
          <div><span>Property</span><strong>{appointment.propertyId ?? "Not linked"}</strong></div>
          {appointment.notes ? <p className="muted">{appointment.notes}</p> : null}
        </section>
        <section className="content-section">
          <div className="section-header">
            <div>
              <p className="eyebrow">Workflow</p>
              <h2>Appointment actions</h2>
            </div>
            <Clock size={20} />
          </div>
          <div className="appointment-action-grid">
            <Button variant="secondary" disabled={appointment.status !== "PENDING"} onClick={() => setPendingAction("confirm")}>
              <CheckCircle2 size={16} />
              Confirm
            </Button>
            <Button variant="secondary" disabled={appointment.status === "CANCELLED" || appointment.status === "COMPLETED"} onClick={openReschedule}>
              Reschedule
            </Button>
            <Button variant="secondary" disabled={appointment.status !== "CONFIRMED"} onClick={() => setPendingAction("complete")}>
              Complete
            </Button>
            <Button variant="danger" disabled={appointment.status === "CANCELLED" || appointment.status === "COMPLETED"} onClick={() => setPendingAction("cancel")}>
              <XCircle size={16} />
              Cancel
            </Button>
          </div>
        </section>
      </div>
      <section className="content-section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Feedback</p>
            <h2>Viewing feedback</h2>
          </div>
          <MessageSquare size={20} />
        </div>
        <form className="appointment-feedback-form" onSubmit={submitFeedback}>
          <Input label="Rating" value={rating} onChange={(event) => setRating(event.target.value)} placeholder="1-5" />
          <textarea className="input textarea" value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="Buyer reaction, next steps, objections" />
          <Button type="submit" disabled={!feedback.trim() || feedbackMutation.isPending}>
            Add feedback
          </Button>
        </form>
      </section>
      <Dialog
        open={Boolean(pendingAction)}
        onClose={() => setPendingAction(null)}
        title="Confirm appointment action"
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
              {hasRescheduleConflict ? <p className="form-alert">Conflict warning: this time overlaps with an appointment already loaded in the calendar.</p> : null}
            </div>
          ) : null}
        </div>
        <footer className="dialog-actions">
          <Button variant="secondary" onClick={() => setPendingAction(null)}>Cancel</Button>
          <Button
            variant={pendingAction === "cancel" ? "danger" : "primary"}
            onClick={confirmAction}
            disabled={
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
