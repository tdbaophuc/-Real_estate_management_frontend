import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Bot, CalendarClock, CheckCircle2, MessageSquare, Plus, Trash2, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toIsoDateTime, formatAppointmentDateTime } from "../appointments/appointmentTime";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Input } from "../../shared/ui/Input";
import { Select } from "../../shared/ui/Select";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import {
  addLeadActivity,
  addLeadNote,
  assignLead,
  createFollowUpTask,
  getLead,
  scoreLead,
  updateLeadStatus,
  type LeadActivityType,
  type LeadPipelineStatus
} from "./leadApi";
import {
  cancelFollowUpTask,
  updateFollowUpTaskStatus
} from "../follow-up-tasks/followUpTaskApi";
import { leadStatusKey } from "./leadLabels";

const pipelineStatusOptions: Array<{ label: string; value: LeadPipelineStatus }> = [
  { label: "New", value: "NEW" },
  { label: "Assigned", value: "ASSIGNED" },
  { label: "Contacted", value: "CONTACTED" },
  { label: "Interested", value: "INTERESTED" },
  { label: "Viewing scheduled", value: "VIEWING_SCHEDULED" },
  { label: "Negotiating", value: "NEGOTIATING" },
  { label: "Closed won", value: "CLOSED_WON" },
  { label: "Closed lost", value: "CLOSED_LOST" },
  { label: "Invalid", value: "INVALID" }
];

const activityTypeOptions: Array<{ label: string; value: LeadActivityType }> = [
  { label: "Call", value: "CALL" },
  { label: "Email", value: "EMAIL" },
  { label: "Chat", value: "CHAT" },
  { label: "Meeting", value: "MEETING" },
  { label: "Other", value: "OTHER" }
];

const taskPriorityOptions = [
  { label: "High", value: "HIGH" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Low", value: "LOW" }
];

function statusTone(status: string) {
  if (status === "CLOSED_WON") {
    return "success";
  }

  if (status === "CLOSED_LOST" || status === "INVALID") {
    return "danger";
  }

  if (status === "NEW" || status === "ASSIGNED") {
    return "warning";
  }

  return "info";
}

function priorityTone(priority: string) {
  if (priority === "HIGH") {
    return "danger";
  }

  if (priority === "MEDIUM") {
    return "warning";
  }

  return "neutral";
}

function toNumber(value: string) {
  return value.trim() ? Number(value) : undefined;
}

export function LeadDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [assignedAgentId, setAssignedAgentId] = useState("");
  const [nextStatus, setNextStatus] = useState<LeadPipelineStatus>("NEW");
  const [note, setNote] = useState("");
  const [activityType, setActivityType] = useState<LeadActivityType>("CALL");
  const [activityContent, setActivityContent] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueAt, setTaskDueAt] = useState("");
  const [taskPriority, setTaskPriority] = useState("MEDIUM");

  const leadQuery = useQuery({
    enabled: Boolean(id),
    queryFn: () => getLead(id ?? ""),
    queryKey: ["lead", id],
    retry: 1
  });
  const invalidateLeadData = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["lead", id] }),
      queryClient.invalidateQueries({ queryKey: ["leads"] }),
      queryClient.invalidateQueries({ queryKey: ["leads", "board"] })
    ]);
  const assignMutation = useMutation({
    mutationFn: () => assignLead(id ?? "", Number(assignedAgentId)),
    onSuccess: () => {
      setAssignedAgentId("");
      return invalidateLeadData();
    }
  });
  const statusMutation = useMutation({
    mutationFn: () => updateLeadStatus(id ?? "", nextStatus),
    onSuccess: invalidateLeadData
  });
  const noteMutation = useMutation({
    mutationFn: () => addLeadNote(id ?? "", note.trim()),
    onSuccess: () => {
      setNote("");
      return invalidateLeadData();
    }
  });
  const activityMutation = useMutation({
    mutationFn: () => addLeadActivity(id ?? "", { content: activityContent.trim(), type: activityType }),
    onSuccess: () => {
      setActivityContent("");
      return invalidateLeadData();
    }
  });
  const taskMutation = useMutation({
    mutationFn: () => createFollowUpTask(id ?? "", {
      dueAt: taskDueAt ? toIsoDateTime(taskDueAt) : undefined,
      priority: taskPriority,
      title: taskTitle.trim()
    }),
    onSuccess: () => {
      setTaskTitle("");
      setTaskDueAt("");
      setTaskPriority("MEDIUM");
      return invalidateLeadData();
    }
  });
  const completeTaskMutation = useMutation({
    mutationFn: (taskId: number | string) =>
      updateFollowUpTaskStatus(taskId, {
        completedAt: new Date().toISOString(),
        status: "COMPLETED"
      }),
    onSuccess: invalidateLeadData
  });
  const cancelTaskMutation = useMutation({
    mutationFn: cancelFollowUpTask,
    onSuccess: invalidateLeadData
  });
  const scoreMutation = useMutation({
    mutationFn: () => scoreLead(id ?? "")
  });
  const lead = leadQuery.data;
  const normalizedError = leadQuery.error ? normalizeUnknownError(leadQuery.error) : null;
  const actionError =
    assignMutation.error ??
    statusMutation.error ??
    noteMutation.error ??
    activityMutation.error ??
    taskMutation.error ??
    completeTaskMutation.error ??
    cancelTaskMutation.error ??
    scoreMutation.error;
  const normalizedActionError = actionError ? normalizeUnknownError(actionError) : null;

  if (!id) {
    return (
      <section className="content-section">
        <EmptyState title="Lead not found" description="The lead URL is missing an id." />
      </section>
    );
  }

  if (leadQuery.isLoading) {
    return (
      <section className="detail-skeleton">
        <div />
        <div />
        <div />
      </section>
    );
  }

  if (normalizedError) {
    return (
      <section className="content-section">
        <EmptyState title="Lead could not be loaded" description={normalizedError.message} action={<Button onClick={() => leadQuery.refetch()}>Retry</Button>} />
      </section>
    );
  }

  if (!lead) {
    return null;
  }

  function submitAssign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (toNumber(assignedAgentId)) {
      assignMutation.mutate();
    }
  }

  function submitStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    statusMutation.mutate();
  }

  function submitNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (note.trim()) {
      noteMutation.mutate();
    }
  }

  function submitActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (activityContent.trim()) {
      activityMutation.mutate();
    }
  }

  function submitTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (taskTitle.trim()) {
      taskMutation.mutate();
    }
  }

  return (
    <section>
      <Button asChild variant="ghost" size="sm">
        <Link to="/leads">
          <ArrowLeft size={16} />
          Back to leads
        </Link>
      </Button>
      <div className="detail-header">
        <div>
          <div className="detail-badges">
            <StatusBadge tone={statusTone(lead.pipelineStatus)}>{t(leadStatusKey(lead.pipelineStatus))}</StatusBadge>
            <StatusBadge tone={priorityTone(lead.priority)}>{t(`common.${lead.priority.toLowerCase()}`)}</StatusBadge>
          </div>
          <h1>{lead.fullName}</h1>
          <p className="muted">{lead.code} / {lead.sourceCode} / {lead.email || lead.phone || "No contact"}</p>
        </div>
      </div>
      {normalizedActionError ? <p className="form-alert">{normalizedActionError.message}</p> : null}
      <div className="lead-detail-grid">
        <section className="content-section lead-profile-card">
          <p className="eyebrow">Profile</p>
          <div><span>Email</span><strong>{lead.email || "Not provided"}</strong></div>
          <div><span>Phone</span><strong>{lead.phone || "Not provided"}</strong></div>
          <div><span>Customer id</span><strong>{lead.customerId ?? "Not linked"}</strong></div>
          <div><span>Listing id</span><strong>{lead.listingId ?? "Not linked"}</strong></div>
          <div><span>Assigned agent</span><strong>{lead.assignedAgentId ?? "Unassigned"}</strong></div>
          {lead.message ? <p className="muted">{lead.message}</p> : null}
        </section>
        <section className="content-section lead-ai-card">
          <div className="section-header">
            <div>
              <p className="eyebrow">AI score</p>
              <h2>Lead scoring</h2>
            </div>
            <Bot size={20} />
          </div>
          <Button type="button" variant="secondary" onClick={() => scoreMutation.mutate()} disabled={scoreMutation.isPending}>
            Score lead
          </Button>
          {scoreMutation.data ? (
            <div className="lead-score-card">
              <strong>{scoreMutation.data.score ?? "N/A"}</strong>
              <span>{scoreMutation.data.priority}</span>
              {scoreMutation.data.suggestedAction ? <p>{scoreMutation.data.suggestedAction}</p> : null}
              {scoreMutation.data.reasons.length ? <small>{scoreMutation.data.reasons.join(" / ")}</small> : null}
            </div>
          ) : (
            <p className="muted">Run AI scoring to see priority signals and suggested follow-up.</p>
          )}
        </section>
      </div>
      <section className="content-section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Actions</p>
            <h2>Assignment and pipeline</h2>
          </div>
        </div>
        <div className="lead-action-grid">
          <form className="customer-inline-form" onSubmit={submitAssign}>
            <Input label="Assigned agent id" value={assignedAgentId} onChange={(event) => setAssignedAgentId(event.target.value)} />
            <Button type="submit" disabled={!toNumber(assignedAgentId) || assignMutation.isPending}>
              <UserPlus size={16} />
              Assign
            </Button>
          </form>
          <form className="customer-inline-form" onSubmit={submitStatus}>
            <Select
              label={t("leads.pipelineStatus")}
              options={pipelineStatusOptions.map((option) => ({
                ...option,
                label: t(leadStatusKey(option.value))
              }))}
              value={nextStatus}
              onChange={(event) => setNextStatus(event.target.value as LeadPipelineStatus)}
            />
            <Button type="submit" disabled={nextStatus === lead.pipelineStatus || statusMutation.isPending}>
              Update status
            </Button>
          </form>
        </div>
      </section>
      <div className="lead-detail-grid">
        <section className="content-section">
          <div className="section-header">
            <div>
              <p className="eyebrow">Notes</p>
              <h2>Lead notes</h2>
            </div>
            <MessageSquare size={20} />
          </div>
          <form className="customer-inline-form" onSubmit={submitNote}>
            <textarea className="input textarea" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add note" />
            <Button type="submit" disabled={!note.trim() || noteMutation.isPending}>
              <Plus size={16} />
              Add note
            </Button>
          </form>
          <div className="customer-list-stack">
            {lead.notes.length ? lead.notes.map((item) => (
              <article key={item.id}>
                <strong>{item.content}</strong>
                {item.createdAt ? <small>{item.createdAt}</small> : null}
              </article>
            )) : <p className="muted">No notes recorded.</p>}
          </div>
        </section>
        <section className="content-section">
          <div className="section-header">
            <div>
              <p className="eyebrow">Activities</p>
              <h2>Lead activity</h2>
            </div>
          </div>
          <form className="customer-inline-form" onSubmit={submitActivity}>
            <Select label="Type" options={activityTypeOptions} value={activityType} onChange={(event) => setActivityType(event.target.value as LeadActivityType)} />
            <textarea className="input textarea" value={activityContent} onChange={(event) => setActivityContent(event.target.value)} placeholder="Activity details" />
            <Button type="submit" disabled={!activityContent.trim() || activityMutation.isPending}>
              <Plus size={16} />
              Add activity
            </Button>
          </form>
          <div className="customer-list-stack">
            {lead.activities.length ? lead.activities.map((item) => (
              <article key={item.id}>
                <strong>{item.type}</strong>
                <p>{item.content}</p>
                {item.createdAt ? <small>{item.createdAt}</small> : null}
              </article>
            )) : <p className="muted">No activities recorded.</p>}
          </div>
        </section>
      </div>
      <section className="content-section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Follow-up</p>
            <h2>Tasks</h2>
          </div>
          <CalendarClock size={20} />
        </div>
        <form className="lead-task-form" onSubmit={submitTask}>
          <Input label="Task title" value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} />
          <Input label="Due at" type="datetime-local" value={taskDueAt} onChange={(event) => setTaskDueAt(event.target.value)} />
          <Select
            label={t("common.priority")}
            options={taskPriorityOptions.map((option) => ({
              ...option,
              label: t(`common.${option.value.toLowerCase()}`)
            }))}
            value={taskPriority}
            onChange={(event) => setTaskPriority(event.target.value)}
          />
          <Button type="submit" disabled={!taskTitle.trim() || taskMutation.isPending}>
            Create follow-up task
          </Button>
        </form>
        <div className="customer-list-stack">
          {lead.followUpTasks.length ? lead.followUpTasks.map((task) => (
            <article key={task.id}>
              <strong>{task.title}</strong>
              <small>{task.status} / {task.priority}</small>
              {task.dueAt ? <small>{formatAppointmentDateTime(task.dueAt)}</small> : null}
              <div className="task-action-row">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={completeTaskMutation.isPending || task.status === "COMPLETED"}
                  onClick={() => completeTaskMutation.mutate(task.id)}
                >
                  <CheckCircle2 size={16} />
                  Complete
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  disabled={cancelTaskMutation.isPending || task.status === "CANCELLED"}
                  onClick={() => cancelTaskMutation.mutate(task.id)}
                >
                  <Trash2 size={16} />
                  Cancel
                </Button>
              </div>
            </article>
          )) : <p className="muted">No follow-up tasks.</p>}
        </div>
      </section>
    </section>
  );
}
