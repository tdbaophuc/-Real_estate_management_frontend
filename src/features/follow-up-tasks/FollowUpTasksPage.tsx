import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Edit, Search, Trash2 } from "lucide-react";
import { toIsoDateTime, toLocalInputValue, formatAppointmentDateTime } from "../appointments/appointmentTime";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Input } from "../../shared/ui/Input";
import { Pagination } from "../../shared/ui/Pagination";
import { Select } from "../../shared/ui/Select";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { Table } from "../../shared/ui/Table";
import { useText } from "../../shared/i18n/useText";
import {
  cancelFollowUpTask,
  searchFollowUpTasks,
  searchMyFollowUpTasks,
  updateFollowUpTask,
  updateFollowUpTaskStatus,
  type FollowUpTaskPriority,
  type FollowUpTaskRecord,
  type FollowUpTaskSearchParams
} from "./followUpTaskApi";

const pageSize = 10;

const statusOptions = [
  { label: "Any status", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Open", value: "OPEN" },
  { label: "Overdue", value: "OVERDUE" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" }
];

const priorityOptions = [
  { label: "Any priority", value: "" },
  { label: "High", value: "HIGH" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Low", value: "LOW" }
];

const scopeOptions = [
  { label: "My tasks", value: "my" },
  { label: "All tasks", value: "all" }
];

type Filters = {
  keyword: string;
  leadId: string;
  priority: string;
  scope: string;
  status: string;
};

function getInitialFilters(searchParams: URLSearchParams): Filters {
  return {
    keyword: searchParams.get("keyword") ?? "",
    leadId: searchParams.get("leadId") ?? "",
    priority: searchParams.get("priority") ?? "",
    scope: searchParams.get("scope") ?? "my",
    status: searchParams.get("status") ?? ""
  };
}

function buildSearchParams(filters: Filters, page: number) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  if (page > 0) {
    params.set("page", String(page));
  }

  return params;
}

function toApiParams(filters: Filters, page: number): FollowUpTaskSearchParams {
  return {
    keyword: filters.keyword,
    leadId: filters.leadId,
    page,
    priority: filters.priority,
    size: pageSize,
    sortBy: "dueAt",
    sortDirection: "ASC",
    status: filters.status
  };
}

function statusTone(status: string) {
  if (status === "COMPLETED") {
    return "success";
  }

  if (status === "CANCELLED" || status === "OVERDUE") {
    return "danger";
  }

  return "warning";
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

function toUpdateDraft(task: FollowUpTaskRecord) {
  return {
    assignedAgentId: task.assignedAgentId ? String(task.assignedAgentId) : "",
    description: task.description,
    dueAt: toLocalInputValue(task.dueAt),
    priority: task.priority || "MEDIUM",
    title: task.title
  };
}

export function FollowUpTasksPage() {
  const tx = useText();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const currentPage = Number(searchParams.get("page") ?? 0) || 0;
  const committedFilters = useMemo(() => getInitialFilters(searchParams), [searchParams]);
  const [filters, setFilters] = useState<Filters>(committedFilters);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [draft, setDraft] = useState<ReturnType<typeof toUpdateDraft> | null>(null);
  const apiParams = useMemo(() => toApiParams(committedFilters, currentPage), [committedFilters, currentPage]);
  const tasksQuery = useQuery({
    queryFn: () =>
      committedFilters.scope === "all"
        ? searchFollowUpTasks(apiParams)
        : searchMyFollowUpTasks(apiParams),
    queryKey: ["follow-up-tasks", committedFilters.scope, apiParams],
    retry: 1
  });
  const updateMutation = useMutation({
    mutationFn: ({ taskId }: { taskId: number | string }) => {
      if (!draft) {
        throw new Error("No task edit is active.");
      }

      return updateFollowUpTask(taskId, {
        assignedAgentId: draft.assignedAgentId ? Number(draft.assignedAgentId) : undefined,
        description: draft.description || undefined,
        dueAt: draft.dueAt ? toIsoDateTime(draft.dueAt) : undefined,
        priority: draft.priority as FollowUpTaskPriority,
        title: draft.title.trim()
      });
    },
    onSuccess: () => {
      setEditingId(null);
      setDraft(null);
      return queryClient.invalidateQueries({ queryKey: ["follow-up-tasks"] });
    }
  });
  const completeMutation = useMutation({
    mutationFn: (taskId: number | string) =>
      updateFollowUpTaskStatus(taskId, { completedAt: new Date().toISOString(), status: "COMPLETED" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["follow-up-tasks"] })
  });
  const cancelMutation = useMutation({
    mutationFn: cancelFollowUpTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["follow-up-tasks"] })
  });
  const normalizedError = tasksQuery.error ? normalizeUnknownError(tasksQuery.error) : null;
  const actionError = updateMutation.error ?? completeMutation.error ?? cancelMutation.error;
  const normalizedActionError = actionError ? normalizeUnknownError(actionError) : null;

  useEffect(() => {
    setFilters(committedFilters);
  }, [committedFilters]);

  function updateFilter(field: keyof Filters, value: string) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchParams(buildSearchParams(filters, 0));
  }

  function startEdit(task: FollowUpTaskRecord) {
    setEditingId(task.id);
    setDraft(toUpdateDraft(task));
  }

  return (
    <section>
      <div className="section-header">
        <div>
          <p className="eyebrow">Follow-up</p>
          <h2>{tx("Task management")}</h2>
        </div>
      </div>
      <form className="filter-bar follow-up-filter-bar" onSubmit={submitSearch}>
        <Select label={tx("Scope")} options={scopeOptions.map((option) => ({ ...option, label: tx(option.label) }))} value={filters.scope} onChange={(event) => updateFilter("scope", event.target.value)} />
        <Input label={tx("Keyword")} value={filters.keyword} onChange={(event) => updateFilter("keyword", event.target.value)} placeholder={tx("Title or description")} />
        <Input label={tx("Lead id")} value={filters.leadId} onChange={(event) => updateFilter("leadId", event.target.value)} />
        <Select label={tx("Status")} options={statusOptions.map((option) => ({ ...option, label: tx(option.label) }))} value={filters.status} onChange={(event) => updateFilter("status", event.target.value)} />
        <Select label={tx("Priority")} options={priorityOptions.map((option) => ({ ...option, label: tx(option.label) }))} value={filters.priority} onChange={(event) => updateFilter("priority", event.target.value)} />
        <div className="filter-actions">
          <Button type="submit" disabled={tasksQuery.isFetching}>
            <Search size={16} />
            {tx("Search")}
          </Button>
        </div>
      </form>
      {normalizedActionError ? <p className="form-alert">{normalizedActionError.message}</p> : null}
      {tasksQuery.isLoading ? (
        <section className="content-section">
          <EmptyState title={tx("Loading follow-up tasks")} description={tx("Fetching active tasks.")} />
        </section>
      ) : null}
      {normalizedError ? (
        <section className="content-section">
          <EmptyState title={tx("Tasks could not be loaded")} description={normalizedError.message} action={<Button onClick={() => tasksQuery.refetch()}>{tx("Retry")}</Button>} />
        </section>
      ) : null}
      {tasksQuery.data?.content.length === 0 ? (
        <section className="content-section">
          <EmptyState title={tx("No follow-up tasks")} description={tx("Adjust filters or create a task from a lead detail page.")} />
        </section>
      ) : null}
      {tasksQuery.data && tasksQuery.data.content.length > 0 ? (
        <>
          <Table>
            <thead>
              <tr>
                <th>{tx("Task")}</th>
                <th>{tx("Status")}</th>
                <th>{tx("Priority")}</th>
                <th>{tx("Due")}</th>
                <th>Lead</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {tasksQuery.data.content.map((task) => (
                <tr key={task.id}>
                  <td>
                    {editingId === task.id && draft ? (
                      <div className="task-edit-grid">
                        <Input label={tx("Title")} value={draft.title} onChange={(event) => setDraft((current) => current ? { ...current, title: event.target.value } : current)} />
                        <Input label={tx("Description")} value={draft.description} onChange={(event) => setDraft((current) => current ? { ...current, description: event.target.value } : current)} />
                        <Input label={tx("Due at")} type="datetime-local" value={draft.dueAt} onChange={(event) => setDraft((current) => current ? { ...current, dueAt: event.target.value } : current)} />
                        <Select label={tx("Priority")} options={priorityOptions.filter((item) => item.value).map((option) => ({ ...option, label: tx(option.label) }))} value={draft.priority} onChange={(event) => setDraft((current) => current ? { ...current, priority: event.target.value } : current)} />
                        <Input label={tx("Assigned agent id")} value={draft.assignedAgentId} onChange={(event) => setDraft((current) => current ? { ...current, assignedAgentId: event.target.value } : current)} />
                      </div>
                    ) : (
                      <>
                        <strong>{task.title}</strong>
                        <small>{task.description || tx("No description")}</small>
                      </>
                    )}
                  </td>
                  <td><StatusBadge tone={statusTone(task.status)}>{tx(task.status)}</StatusBadge></td>
                  <td><StatusBadge tone={priorityTone(task.priority)}>{tx(task.priority)}</StatusBadge></td>
                  <td>{task.dueAt ? formatAppointmentDateTime(task.dueAt) : tx("Updating")}</td>
                  <td>{task.leadId ? <Link to={`/leads/${task.leadId}`}>Lead #{task.leadId}</Link> : tx("Not linked")}</td>
                  <td>
                    <div className="task-action-row">
                      {editingId === task.id ? (
                        <>
                          <Button size="sm" disabled={!draft?.title.trim() || updateMutation.isPending} onClick={() => updateMutation.mutate({ taskId: task.id })}>{tx("Save")}</Button>
                          <Button size="sm" variant="secondary" onClick={() => { setEditingId(null); setDraft(null); }}>{tx("Cancel")}</Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="secondary" onClick={() => startEdit(task)}>
                            <Edit size={16} />
                            {tx("Edit")}
                          </Button>
                          <Button size="sm" variant="secondary" disabled={completeMutation.isPending || task.status === "COMPLETED"} onClick={() => completeMutation.mutate(task.id)}>
                            <CheckCircle2 size={16} />
                            {tx("Complete")}
                          </Button>
                          <Button size="sm" variant="danger" disabled={cancelMutation.isPending || task.status === "CANCELLED"} onClick={() => cancelMutation.mutate(task.id)}>
                            <Trash2 size={16} />
                            {tx("Cancel")}
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination
            page={tasksQuery.data.page}
            totalPages={tasksQuery.data.totalPages}
            onPageChange={(page) => setSearchParams(buildSearchParams(committedFilters, page))}
          />
        </>
      ) : null}
    </section>
  );
}
