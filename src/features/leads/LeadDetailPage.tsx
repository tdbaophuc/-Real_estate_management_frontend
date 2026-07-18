import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Bot, CalendarClock, CheckCircle2, Mail, MessageSquare, Plus, Search, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toIsoDateTime } from "../appointments/appointmentTime";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Input } from "../../shared/ui/Input";
import { Select } from "../../shared/ui/Select";
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
import { updateFollowUpTaskStatus } from "../follow-up-tasks/followUpTaskApi";
import { searchAdminUsers } from "../admin/adminUserApi";

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

function statusBadgeClass(status: string) {
  if (status === "NEW" || status === "ASSIGNED") {
    return "lead-detail-status-new";
  }

  if (status === "CONTACTED" || status === "VIEWING_SCHEDULED") {
    return "lead-detail-status-progress";
  }

  if (status === "INTERESTED" || status === "NEGOTIATING" || status === "CLOSED_WON") {
    return "lead-detail-status-success";
  }

  if (status === "CLOSED_LOST" || status === "INVALID") {
    return "lead-detail-status-danger";
  }

  return "lead-detail-status-neutral";
}

function priorityBadgeClass(priority: string) {
  if (priority === "HIGH") {
    return "lead-detail-priority-high";
  }

  if (priority === "LOW") {
    return "lead-detail-priority-low";
  }

  return "lead-detail-priority-medium";
}

function toNumber(value: string) {
  return value.trim() ? Number(value) : undefined;
}

function readableStatus(status: string) {
  return status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (value) => value.toUpperCase());
}

function friendlyDate(value: string) {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const time = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  if (date.toDateString() === today.toDateString()) {
    return `Today, ${time}`;
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${time}`;
  }

  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function dueLabel(value: string) {
  if (!value) {
    return { label: "No due date", tone: "neutral" };
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return { label: value, tone: "neutral" };
  }

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return { label: "Due Today", tone: "urgent" };
  }

  if (date.toDateString() === tomorrow.toDateString()) {
    return { label: "Due Tomorrow", tone: "neutral" };
  }

  return {
    label: `Due ${date.toLocaleDateString([], { month: "short", day: "numeric" })}`,
    tone: "neutral"
  };
}

export function LeadDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [assignedAgentId, setAssignedAgentId] = useState("");
  const [agentSearch, setAgentSearch] = useState("");
  const [isAgentPickerOpen, setIsAgentPickerOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState<LeadPipelineStatus>("NEW");
  const [note, setNote] = useState("");
  const [activityType, setActivityType] = useState<LeadActivityType>("CALL");
  const [activityContent, setActivityContent] = useState("");
  const [isTaskComposerOpen, setIsTaskComposerOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueAt, setTaskDueAt] = useState("");
  const [taskPriority, setTaskPriority] = useState("MEDIUM");

  const leadQuery = useQuery({
    enabled: Boolean(id),
    queryFn: () => getLead(id ?? ""),
    queryKey: ["lead", id],
    retry: 1
  });
  const agentsQuery = useQuery({
    enabled: isAgentPickerOpen,
    queryFn: () =>
      searchAdminUsers({
        keyword: agentSearch,
        page: 0,
        role: "AGENT",
        size: 8,
        status: "ACTIVE"
      }),
    queryKey: ["admin-users", "lead-agent-picker", agentSearch],
    retry: 1
  });
  const invalidateLeadData = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["lead", id] }),
      queryClient.invalidateQueries({ queryKey: ["leads"] }),
      queryClient.invalidateQueries({ queryKey: ["leads", "board"] }),
      queryClient.invalidateQueries({ queryKey: ["follow-up-tasks"] })
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
      assignedAgentId: lead?.assignedAgentId ?? undefined,
      dueAt: taskDueAt ? toIsoDateTime(taskDueAt) : undefined,
      priority: taskPriority,
      title: taskTitle.trim()
    }),
    onSuccess: () => {
      setIsTaskComposerOpen(false);
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
  const scoreMutation = useMutation({
    mutationFn: () => scoreLead(id ?? "")
  });
  const lead = leadQuery.data;
  const agentOptions = (agentsQuery.data?.content ?? []).filter((agent) => agent.roles.includes("AGENT"));
  const normalizedError = leadQuery.error ? normalizeUnknownError(leadQuery.error) : null;
  const actionError =
    assignMutation.error ??
    statusMutation.error ??
    noteMutation.error ??
    activityMutation.error ??
    taskMutation.error ??
    completeTaskMutation.error ??
    scoreMutation.error;
  const normalizedActionError = actionError ? normalizeUnknownError(actionError) : null;

  useEffect(() => {
    if (lead?.pipelineStatus) {
      setNextStatus(lead.pipelineStatus as LeadPipelineStatus);
    }
  }, [lead?.pipelineStatus]);

  useEffect(() => {
    if (lead?.assignedAgentName) {
      setAgentSearch(lead.assignedAgentName);
    }
  }, [lead?.assignedAgentName]);

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

  function selectAgent(agent: { fullName: string; id: number | string; email: string }) {
    setAssignedAgentId(String(agent.id));
    setAgentSearch(agent.fullName || agent.email || String(agent.id));
    setIsAgentPickerOpen(false);
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

  const aiScore = scoreMutation.data?.score ?? lead.score;
  const aiReasons = scoreMutation.data?.reasons.length
    ? scoreMutation.data.reasons
    : [
        lead.listingTitle ? `Interested in ${lead.listingTitle}` : "Lead profile is ready for scoring",
        lead.email || lead.phone ? "Contact channel available" : "Contact details need enrichment"
      ];
  const timelineItems = [
    ...lead.notes.map((item) => ({
      content: item.content,
      createdAt: item.createdAt,
      id: `note-${item.id}`,
      title: "Note added"
    })),
    ...lead.activities.map((item) => ({
      content: item.content,
      createdAt: item.createdAt,
      id: `activity-${item.id}`,
      title: readableStatus(item.type)
    }))
  ].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

  return (
    <section className="lead-detail-page">
      <Button asChild variant="ghost" size="sm">
        <Link to="/leads">
          <ArrowLeft size={16} />
          Back to leads
        </Link>
      </Button>

      <header className="lead-detail-header">
        <div>
          <div className="lead-detail-title-line">
            <h1>{lead.fullName}</h1>
            <span className={`lead-detail-badge ${statusBadgeClass(lead.pipelineStatus)}`}>
              {readableStatus(lead.pipelineStatus)}
            </span>
            <span className={`lead-detail-badge ${priorityBadgeClass(lead.priority)}`}>
              {readableStatus(lead.priority)} Priority
            </span>
          </div>
          <p>{lead.code} / {lead.sourceName || lead.sourceCode} / {lead.email || lead.phone || "No contact"}</p>
        </div>
        <div className="lead-detail-header-actions">
          <Button asChild>
            <a href={lead.email ? `mailto:${lead.email}` : "#"}>
              <Mail size={16} />
              Email Lead
            </a>
          </Button>
        </div>
      </header>

      {normalizedActionError ? <p className="form-alert">{normalizedActionError.message}</p> : null}

      <div className="lead-detail-workspace">
        <aside className="lead-detail-column">
          <section className="lead-detail-card">
            <p className="lead-detail-card-label">Contact Details</p>
            <dl className="lead-detail-data-list">
              <div>
                <dt>Email</dt>
                <dd>{lead.email || "Not provided"}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{lead.phone || "Not provided"}</dd>
              </div>
              <div>
                <dt>Customer</dt>
                <dd>{lead.customerName || (lead.customerId ? `Customer #${lead.customerId}` : "Not linked")}</dd>
              </div>
              <div>
                <dt>Assigned Agent</dt>
                <dd>{lead.assignedAgentName || (lead.assignedAgentId ? `Agent #${lead.assignedAgentId}` : "Unassigned")}</dd>
              </div>
            </dl>
          </section>

          <section className="lead-detail-card">
            <p className="lead-detail-card-label">Preferences</p>
            <dl className="lead-detail-data-list">
              <div>
                <dt>Source</dt>
                <dd>{lead.sourceName || lead.sourceCode || "Updating"}</dd>
              </div>
              <div>
                <dt>Priority</dt>
                <dd>{readableStatus(lead.priority)}</dd>
              </div>
              <div>
                <dt>Message</dt>
                <dd>{lead.message || "No message recorded"}</dd>
              </div>
            </dl>
          </section>

          <section className="lead-detail-card lead-primary-interest">
            <div className="lead-primary-interest-media">
              <span>Primary Interest</span>
            </div>
            <h2>{lead.listingTitle || "Listing interest updating"}</h2>
            {lead.listingId ? <Link to={`/listings/${lead.listingId}`}>View Listing -&gt;</Link> : <span>No listing linked</span>}
          </section>
        </aside>

        <main className="lead-detail-column">
          <section className="lead-detail-card lead-note-composer">
            <div className="lead-detail-card-header">
              <div>
                <p className="lead-detail-card-label">Add Note or Log Activity</p>
                <h2>Capture the next interaction</h2>
              </div>
              <MessageSquare size={20} />
            </div>
            <form onSubmit={submitNote}>
              <textarea
                className="lead-detail-textarea"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Add a note for this lead"
              />
              <div className="lead-detail-form-footer">
                <Button type="submit" disabled={!note.trim() || noteMutation.isPending}>
                  Save Note
                </Button>
              </div>
            </form>
            <form className="lead-detail-activity-form" onSubmit={submitActivity}>
              <Select label="Activity type" options={activityTypeOptions} value={activityType} onChange={(event) => setActivityType(event.target.value as LeadActivityType)} />
              <textarea
                className="lead-detail-textarea compact"
                value={activityContent}
                onChange={(event) => setActivityContent(event.target.value)}
                placeholder="Log call, email, meeting, or other activity"
              />
              <div className="lead-detail-form-footer">
                <Button type="submit" variant="secondary" disabled={!activityContent.trim() || activityMutation.isPending}>
                  Log Activity
                </Button>
              </div>
            </form>
          </section>

          <section className="lead-detail-card lead-activity-history">
            <p className="lead-detail-card-label">Activity History</p>
            <div className="lead-detail-timeline">
              {timelineItems.length ? timelineItems.map((item) => (
                <article key={item.id}>
                  <span className="lead-timeline-dot" />
                  <div>
                    <header>
                      <strong>{item.title}</strong>
                      <small>{friendlyDate(item.createdAt)}</small>
                    </header>
                    <p>{item.content}</p>
                  </div>
                </article>
              )) : <p className="muted">No activities recorded.</p>}
            </div>
          </section>
        </main>

        <aside className="lead-detail-column">
          <section className="lead-detail-card lead-ai-score-widget">
            <div className="lead-detail-card-header">
              <div>
                <p className="lead-detail-card-label">AI Lead Score</p>
                <h2>Conversion signals</h2>
              </div>
              <Bot size={20} />
            </div>
            <div className="lead-ai-score-number">
              <strong>{aiScore ?? "N/A"}</strong>
              <span>/ 100</span>
            </div>
            <Button type="button" variant="secondary" onClick={() => scoreMutation.mutate()} disabled={scoreMutation.isPending}>
              Score Lead
            </Button>
            <ul>
              {aiReasons.map((reason) => (
                <li key={reason}>
                  <CheckCircle2 size={16} />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
            {scoreMutation.data?.suggestedAction ? <p>{scoreMutation.data.suggestedAction}</p> : null}
          </section>

          <section className="lead-detail-card lead-quick-actions">
            <p className="lead-detail-card-label">Quick Actions</p>
            <Button asChild variant="secondary">
              <Link
                to={`/appointments?create=1&leadId=${encodeURIComponent(String(lead.id))}&customerId=${encodeURIComponent(String(lead.customerId ?? ""))}&listingId=${encodeURIComponent(String(lead.listingId ?? ""))}`}
              >
                <CalendarClock size={16} />
                Create Appointment
              </Link>
            </Button>
            <form onSubmit={submitStatus}>
              <Select
                label="Change Status"
                options={pipelineStatusOptions.map((option) => ({
                  ...option,
                  label: option.label
                }))}
                value={nextStatus}
                onChange={(event) => setNextStatus(event.target.value as LeadPipelineStatus)}
              />
              <Button type="submit" disabled={nextStatus === lead.pipelineStatus || statusMutation.isPending}>
                Change Status
              </Button>
            </form>
            <form onSubmit={submitAssign}>
              <label className="field lead-agent-picker">
                <span>Assigned agent</span>
                <div className="lead-agent-search-box">
                  <Search size={15} />
                  <input
                    className="input"
                    value={agentSearch}
                    onChange={(event) => {
                      setAgentSearch(event.target.value);
                      setAssignedAgentId("");
                      setIsAgentPickerOpen(true);
                    }}
                    onFocus={() => setIsAgentPickerOpen(true)}
                    placeholder="Search agent by name or email"
                  />
                </div>
                {isAgentPickerOpen ? (
                  <div className="lead-agent-picker-menu">
                    {agentsQuery.isLoading ? <p>Searching agents...</p> : null}
                    {agentOptions.length ? agentOptions.map((agent) => (
                      <button key={agent.id} type="button" onClick={() => selectAgent(agent)}>
                        <strong>{agent.fullName}</strong>
                        <small>{agent.email || agent.phone || `#${agent.id}`}</small>
                      </button>
                    )) : !agentsQuery.isLoading ? <p>No agents found.</p> : null}
                  </div>
                ) : null}
              </label>
              <Button type="submit" disabled={!toNumber(assignedAgentId) || assignMutation.isPending}>
                <UserPlus size={16} />
                Reassign Lead
              </Button>
            </form>
          </section>

          <section className="lead-detail-card lead-task-checklist">
            <div className="lead-detail-card-header">
              <div>
                <p className="lead-detail-card-label">Tasks</p>
                <h2>Follow-up checklist</h2>
              </div>
              <button type="button" onClick={() => setIsTaskComposerOpen(true)} aria-label="Add task">
                <Plus size={16} />
              </button>
            </div>
            <div className="lead-detail-task-list">
              {lead.followUpTasks.length ? lead.followUpTasks.map((task) => {
                const due = dueLabel(task.dueAt);

                return (
                  <article key={task.id}>
                    <button
                      className={`lead-detail-task-checkbox ${task.status === "COMPLETED" ? "checked" : ""}`}
                      type="button"
                      disabled={completeTaskMutation.isPending || task.status === "COMPLETED"}
                      onClick={() => completeTaskMutation.mutate(task.id)}
                      aria-label={`Complete ${task.title}`}
                    >
                      {task.status === "COMPLETED" ? <CheckCircle2 size={14} /> : null}
                    </button>
                    <div>
                      <strong>{task.title}</strong>
                      <small className={due.tone === "urgent" ? "urgent" : ""}>{due.label}</small>
                    </div>
                  </article>
                );
              }) : <p className="muted">No follow-up tasks.</p>}
            </div>
          </section>
        </aside>
      </div>

      {isTaskComposerOpen ? (
        <div className="lead-task-modal-backdrop">
          <form className="lead-task-modal lead-detail-card" onSubmit={submitTask}>
            <div className="lead-detail-card-header">
              <div>
                <p className="lead-detail-card-label">New Task</p>
                <h2>Add follow-up task</h2>
              </div>
              <button type="button" onClick={() => setIsTaskComposerOpen(false)} aria-label="Close task composer">x</button>
            </div>
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
            <div className="lead-detail-form-footer">
              <Button type="button" variant="secondary" onClick={() => setIsTaskComposerOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!taskTitle.trim() || taskMutation.isPending}>Create Task</Button>
            </div>
          </form>
        </div>
      ) : null}

    </section>
  );
}
