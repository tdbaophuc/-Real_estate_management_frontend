import { useMemo, useState, type DragEvent, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { CheckCircle2, Filter, MoreHorizontal, Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatAppointmentDateTime } from "../appointments/appointmentTime";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Input } from "../../shared/ui/Input";
import { Select } from "../../shared/ui/Select";
import {
  searchLeads,
  createLead,
  updateLeadStatus,
  type LeadPipelineStatus,
  type LeadRecord
} from "./leadApi";
import {
  searchFollowUpTasks,
  updateFollowUpTaskStatus
} from "../follow-up-tasks/followUpTaskApi";

const pipelineStatusOrder: LeadPipelineStatus[] = [
  "NEW",
  "ASSIGNED",
  "CONTACTED",
  "INTERESTED",
  "VIEWING_SCHEDULED",
  "NEGOTIATING",
  "CLOSED_WON",
  "CLOSED_LOST",
  "INVALID"
];

const columnLabels: Record<LeadPipelineStatus, string> = {
  ASSIGNED: "ASSIGNED",
  CLOSED_LOST: "CLOSED LOST",
  CLOSED_WON: "CLOSED WON",
  CONTACTED: "CONTACTED",
  INTERESTED: "INTERESTED",
  INVALID: "INVALID",
  NEGOTIATING: "NEGOTIATING",
  NEW: "NEW",
  VIEWING_SCHEDULED: "VIEWING SCHED"
};

function priorityToneClass(priority: string) {
  if (priority === "HIGH") {
    return "lead-priority-high";
  }

  if (priority === "LOW") {
    return "lead-priority-low";
  }

  return "lead-priority-medium";
}

function statusDotClass(status: string) {
  if (status === "CONTACTED") {
    return "lead-status-contacted";
  }

  if (status === "VIEWING_SCHEDULED") {
    return "lead-status-viewing";
  }

  if (status === "NEGOTIATING" || status === "CLOSED_WON") {
    return "lead-status-negotiating";
  }

  return "lead-status-new";
}

function formatStatusLabel(status: string) {
  return columnLabels[status as LeadPipelineStatus] ?? status.replace(/_/g, " ");
}

function groupLeads(leads: LeadRecord[]) {
  const statuses = Array.from(new Set([
    ...pipelineStatusOrder,
    ...leads.map((lead) => lead.pipelineStatus)
  ])).filter(Boolean);

  return statuses.map((status) => ({
    leads: leads.filter((lead) => lead.pipelineStatus === status),
    status
  }));
}

function initials(name: string, fallback: string) {
  const source = name.trim() || fallback;
  const parts = source.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "U";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : parts[0]?.[1] ?? "";

  return `${first}${last}`.toUpperCase();
}

function leadSubtitle(lead: LeadRecord) {
  return lead.listingTitle || lead.customerName || lead.message || lead.email || lead.phone || "Lead details updating";
}

function leadMeta(lead: LeadRecord) {
  if (lead.listingTitle) {
    return lead.listingTitle;
  }

  return lead.sourceName || lead.sourceCode || "Value pending";
}

function recentActivity(leads: LeadRecord[]) {
  return leads.slice(0, 5).map((lead) => ({
    id: lead.id,
    text: `${initials(lead.assignedAgentName, lead.fullName)} moved ${lead.fullName} to ${formatStatusLabel(lead.pipelineStatus)}`
  }));
}

export function LeadsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isTaskPanelOpen, setIsTaskPanelOpen] = useState(false);
  const [dismissedAlert, setDismissedAlert] = useState(false);
  const [draggedLeadId, setDraggedLeadId] = useState<number | string | null>(null);
  const [newLead, setNewLead] = useState({
    assignedAgentId: "",
    customerId: "",
    email: "",
    fullName: "",
    listingId: "",
    message: "",
    phone: "",
    priority: "MEDIUM",
    sourceCode: "MANUAL"
  });

  const boardQuery = useQuery({
    queryFn: () => searchLeads({ page: 0, size: 100 }),
    queryKey: ["leads", "board"],
    retry: 1
  });
  const tasksQuery = useQuery({
    queryFn: () =>
      searchFollowUpTasks({
        page: 0,
        size: 8,
        sortBy: "dueAt",
        sortDirection: "ASC"
      }),
    queryKey: ["follow-up-tasks", "lead-panel"],
    retry: 1
  });
  const columns = useMemo(() => groupLeads(boardQuery.data?.content ?? []), [boardQuery.data?.content]);
  const leads = boardQuery.data?.content ?? [];
  const activeTasks = tasksQuery.data?.content ?? [];
  const activities = useMemo(() => recentActivity(leads), [leads]);
  const statusMutation = useMutation({
    mutationFn: ({ leadId, status }: { leadId: number | string; status: LeadPipelineStatus }) =>
      updateLeadStatus(leadId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads"] })
  });
  const createMutation = useMutation({
    mutationFn: () =>
      createLead({
        assignedAgentId: newLead.assignedAgentId ? Number(newLead.assignedAgentId) : undefined,
        customerId: newLead.customerId ? Number(newLead.customerId) : undefined,
        email: newLead.email || undefined,
        fullName: newLead.fullName.trim(),
        listingId: newLead.listingId ? Number(newLead.listingId) : undefined,
        message: newLead.message || undefined,
        phone: newLead.phone || undefined,
        priority: newLead.priority,
        sourceCode: newLead.sourceCode || undefined
      }),
    onSuccess: () => {
      setIsCreateOpen(false);
      setNewLead({
        assignedAgentId: "",
        customerId: "",
        email: "",
        fullName: "",
        listingId: "",
        message: "",
        phone: "",
        priority: "MEDIUM",
        sourceCode: "MANUAL"
      });
      return queryClient.invalidateQueries({ queryKey: ["leads"] });
    }
  });
  const completeTaskMutation = useMutation({
    mutationFn: (taskId: number | string) =>
      updateFollowUpTaskStatus(taskId, {
        completedAt: new Date().toISOString(),
        status: "COMPLETED"
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["follow-up-tasks"] })
  });

  const normalizedBoardError = boardQuery.error ? normalizeUnknownError(boardQuery.error) : null;
  const normalizedTaskError = tasksQuery.error ? normalizeUnknownError(tasksQuery.error) : null;
  const actionError = statusMutation.error ?? createMutation.error ?? completeTaskMutation.error;
  const normalizedActionError = actionError ? normalizeUnknownError(actionError) : null;
  const priorityOptions = useMemo(
    () => [
      { label: t("common.high"), value: "HIGH" },
      { label: t("common.medium"), value: "MEDIUM" },
      { label: t("common.low"), value: "LOW" }
    ],
    [t]
  );

  function updateNewLead(field: keyof typeof newLead, value: string) {
    setNewLead((current) => ({ ...current, [field]: value }));
  }

  function submitCreateLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (newLead.fullName.trim()) {
      createMutation.mutate();
    }
  }

  function startDrag(event: DragEvent<HTMLElement>, leadId: number | string) {
    setDraggedLeadId(leadId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(leadId));
  }

  function dropLead(event: DragEvent<HTMLElement>, status: LeadPipelineStatus) {
    event.preventDefault();
    const leadId = draggedLeadId ?? event.dataTransfer.getData("text/plain");

    if (leadId) {
      statusMutation.mutate({ leadId, status });
    }

    setDraggedLeadId(null);
  }

  return (
    <section className="leads-pipeline-page">
      <div className="lead-top-stack">
        <div className="leads-pipeline-header">
          <div>
            <p className="eyebrow">Leads</p>
            <h1>Active Pipeline</h1>
            <p>Manage your institutional lead flow and acquisition stages.</p>
          </div>
          <div className="leads-pipeline-actions">
            <Button type="button" variant="secondary" onClick={() => setIsTaskPanelOpen((current) => !current)}>
              {isTaskPanelOpen ? <X size={16} /> : <CheckCircle2 size={16} />}
              Follow-up Tasks
            </Button>
            <Button type="button" variant="secondary" onClick={() => setIsFilterOpen((current) => !current)}>
              <Filter size={16} />
              Filter
            </Button>
            <Button type="button" onClick={() => setIsCreateOpen((current) => !current)}>
              <Plus size={16} />
              New lead
            </Button>
          </div>
        </div>

        {isFilterOpen ? (
          <div className="lead-filter-popover content-section">
            <p className="muted">Pipeline currently shows all API-returned statuses from the active lead dataset.</p>
          </div>
        ) : null}

        {isCreateOpen ? (
          <form className="content-section lead-create-form" onSubmit={submitCreateLead}>
          <Input label="Full name" value={newLead.fullName} onChange={(event) => updateNewLead("fullName", event.target.value)} />
          <Input label="Email" value={newLead.email} onChange={(event) => updateNewLead("email", event.target.value)} />
          <Input label="Phone" value={newLead.phone} onChange={(event) => updateNewLead("phone", event.target.value)} />
          <Input label="Customer id" value={newLead.customerId} onChange={(event) => updateNewLead("customerId", event.target.value)} />
          <Input label="Listing id" value={newLead.listingId} onChange={(event) => updateNewLead("listingId", event.target.value)} />
          <Input label="Assigned agent id" value={newLead.assignedAgentId} onChange={(event) => updateNewLead("assignedAgentId", event.target.value)} />
          <Select label={t("common.priority")} value={newLead.priority} onChange={(event) => updateNewLead("priority", event.target.value)} options={priorityOptions} />
          <Input label="Source code" value={newLead.sourceCode} onChange={(event) => updateNewLead("sourceCode", event.target.value)} />
          <textarea className="input textarea" value={newLead.message} onChange={(event) => updateNewLead("message", event.target.value)} placeholder="Message" />
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={!newLead.fullName.trim() || createMutation.isPending}>Create lead</Button>
          </div>
          </form>
        ) : null}

        {normalizedActionError && !dismissedAlert ? (
          <div className="lead-alert">
            <span>{normalizedActionError.message}</span>
            <button type="button" onClick={() => setDismissedAlert(true)} aria-label="Dismiss alert">
              <X size={14} />
            </button>
          </div>
        ) : null}
      </div>

      <div className={`lead-workspace-shell ${isTaskPanelOpen ? "task-panel-open" : ""}`}>
        <div className="lead-board-list-stack">
      <section className="leads-kanban-area">
        {normalizedBoardError ? (
          <EmptyState
            title="Lead pipeline unavailable"
            description={normalizedBoardError.message}
            action={<Button onClick={() => boardQuery.refetch()}>{t("actions.retry")}</Button>}
          />
        ) : null}
        {boardQuery.isLoading ? (
          <div className="detail-skeleton">
            <div />
            <div />
          </div>
        ) : null}
        <div className="lead-board">
          {columns.map((column) => (
            <article
              className="lead-board-column"
              key={column.status}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => dropLead(event, column.status as LeadPipelineStatus)}
            >
              <header>
                <h2>
                  <span className={`lead-status-dot ${statusDotClass(column.status)}`} />
                  {formatStatusLabel(column.status)} ({column.leads.length})
                </h2>
                <button type="button" aria-label={`${formatStatusLabel(column.status)} options`}>
                  <MoreHorizontal size={16} />
                </button>
              </header>
              <div className="lead-board-stack">
                {column.leads.length ? column.leads.map((lead) => (
                  <article
                    className="lead-board-card"
                    draggable
                    key={lead.id}
                    onDragEnd={() => setDraggedLeadId(null)}
                    onDragStart={(event) => startDrag(event, lead.id)}
                  >
                    <div className="lead-card-header">
                      <span className={`lead-priority-badge ${priorityToneClass(lead.priority)}`}>{lead.priority}</span>
                      <span className="lead-card-value">{leadMeta(lead)}</span>
                    </div>
                    <Link to={`/leads/${lead.id}`} className="lead-card-main">
                      <h3>{lead.fullName}</h3>
                      <p>{leadSubtitle(lead)}</p>
                    </Link>
                    <footer className="lead-card-footer">
                      <span className="lead-agent-avatar">{initials(lead.assignedAgentName, lead.fullName)}</span>
                    </footer>
                  </article>
                )) : <div className="lead-empty-dropzone">Drop leads here</div>}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="lead-list-section content-section">
        <div className="section-header compact">
          <div>
            <p className="eyebrow">Lead List</p>
            <h2>All active leads</h2>
          </div>
          <span>{leads.length} leads</span>
        </div>
        <div className="lead-list-table">
          <div className="lead-list-header" aria-hidden="true">
            <span>Priority</span>
            <span>Name</span>
            <span>Status</span>
            <span>Details</span>
            <span>Agent</span>
          </div>
          {leads.length ? leads.map((lead) => (
            <Link className="lead-list-row" key={lead.id} to={`/leads/${lead.id}`}>
              <span className={`lead-priority-badge ${priorityToneClass(lead.priority)}`}>{lead.priority}</span>
              <strong>{lead.fullName}</strong>
              <small>{formatStatusLabel(lead.pipelineStatus)}</small>
              <small>{leadSubtitle(lead)}</small>
              <small>{lead.assignedAgentName || "Unassigned"}</small>
            </Link>
          )) : <p className="muted">No leads returned by the API.</p>}
        </div>
      </section>
        </div>

        {isTaskPanelOpen ? (
        <aside className="lead-task-sidebar">
          <div className="lead-task-panel-body">
            <section className="lead-task-panel-section">
              <div className="lead-task-panel-header">
                <div>
                  <p className="eyebrow">Follow-up</p>
                  <h2>Tasks</h2>
                </div>
                <Link className="lead-task-add-button" to="/follow-up-tasks" aria-label="Open task management">
                  <Plus size={16} />
                </Link>
              </div>

              {normalizedTaskError ? <p className="form-alert">{normalizedTaskError.message}</p> : null}

              <div className="lead-task-list">
                {tasksQuery.isLoading ? <p className="muted">Loading tasks...</p> : null}
                {activeTasks.length ? activeTasks.map((task) => (
                  <article className="lead-task-item" key={task.id}>
                    <button
                      className={`lead-task-checkbox ${task.status === "COMPLETED" ? "checked" : ""}`}
                      type="button"
                      disabled={completeTaskMutation.isPending || task.status === "COMPLETED"}
                      onClick={() => completeTaskMutation.mutate(task.id)}
                      aria-label={`Complete ${task.title}`}
                    >
                      {task.status === "COMPLETED" ? <CheckCircle2 size={14} /> : null}
                    </button>
                    <div>
                      <strong>{task.title}</strong>
                      <small>{task.dueAt ? formatAppointmentDateTime(task.dueAt) : "No due date"}</small>
                    </div>
                  </article>
                )) : !tasksQuery.isLoading ? <p className="muted">No follow-up tasks.</p> : null}
              </div>
            </section>

            <section className="lead-recent-activity">
              <div className="lead-task-panel-header">
                <div>
                  <p className="eyebrow">Recent</p>
                  <h2>Activity</h2>
                </div>
              </div>
              <div className="lead-activity-list">
                {activities.length ? activities.map((activity) => (
                  <p key={activity.id}>{activity.text}</p>
                )) : <p className="muted">No recent activity.</p>}
              </div>
            </section>
          </div>
        </aside>
        ) : null}
      </div>
    </section>
  );
}
