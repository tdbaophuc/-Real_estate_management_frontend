import { useMemo, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Code2, Download, Search, ShieldCheck } from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { DatePicker } from "../../shared/ui/DatePicker";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Input } from "../../shared/ui/Input";
import { Select } from "../../shared/ui/Select";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { Table } from "../../shared/ui/Table";
import { searchAdminUsers } from "./adminUserApi";
import { getAuditLog, searchAuditLogs, type AuditLogRecord, type AuditLogSearchParams } from "./auditLogApi";

const pageSize = 10;

type AuditFilters = {
  action: string;
  actorId: string;
  endDate: string;
  resourceId: string;
  resourceType: string;
  startDate: string;
};

const emptyFilters: AuditFilters = {
  action: "",
  actorId: "",
  endDate: "",
  resourceId: "",
  resourceType: "",
  startDate: ""
};

function toDateTime(value: string, endOfDay = false) {
  if (!value) {
    return undefined;
  }

  return `${value}T${endOfDay ? "23:59:59" : "00:00:00"}Z`;
}

function toApiParams(filters: AuditFilters, page: number): AuditLogSearchParams {
  return {
    action: filters.action || undefined,
    actorId: filters.actorId || undefined,
    direction: "DESC",
    from: toDateTime(filters.startDate),
    page,
    resourceId: filters.resourceId || undefined,
    resourceType: filters.resourceType || undefined,
    size: pageSize,
    sortBy: "createdAt",
    to: toDateTime(filters.endDate, true)
  };
}

function formatUtcTimestamp(value: string) {
  if (!value) {
    return "Updating";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toISOString().replace("T", " ").slice(0, 19);
}

function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "SY";
}

function actionTone(action: string) {
  if (/LOGIN_FAILED|FAILED|DELETE|REJECT/i.test(action)) {
    return "danger";
  }

  if (/CREATE|APPROVE|SUCCESS|PAID|SIGN/i.test(action)) {
    return "success";
  }

  if (/UPDATE|CHANGE|UPLOAD|DOWNLOAD/i.test(action)) {
    return "info";
  }

  return "neutral";
}

function actionLabel(action: string) {
  return action.replace(/_/g, " ");
}

function actorLabel(log: AuditLogRecord) {
  return log.actorName || log.actorEmail || (log.actorId ? `User #${log.actorId}` : "System");
}

function parseJson(value: string) {
  if (!value) {
    return "";
  }

  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

function csvEscape(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, "\"\"")}"`;
}

function exportAuditCsv(rows: AuditLogRecord[]) {
  const csvRows = [
    [
      "id",
      "timestampUtc",
      "actorId",
      "actor",
      "actorEmail",
      "action",
      "resourceType",
      "resourceId",
      "ipAddress",
      "oldValue",
      "newValue"
    ],
    ...rows.map((log) => [
      log.id,
      formatUtcTimestamp(log.createdAt),
      log.actorId,
      actorLabel(log),
      log.actorEmail,
      log.action,
      log.resourceType,
      log.resourceId,
      log.ipAddress,
      parseJson(log.oldValue),
      parseJson(log.newValue)
    ])
  ];
  const csv = csvRows.map((row) => row.map(csvEscape).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = "audit-logs.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function optionFrom(value: string, fallback: string) {
  return { label: value || fallback, value };
}

function AuditActor({ log }: { log: AuditLogRecord }) {
  return (
    <div className="audit-actor-cell">
      <span>{initials(actorLabel(log))}</span>
      <div>
        <strong>{actorLabel(log)}</strong>
        {log.actorEmail ? <small>{log.actorEmail}</small> : null}
      </div>
    </div>
  );
}

function AuditLogsListView() {
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<AuditFilters>(emptyFilters);
  const [committedFilters, setCommittedFilters] = useState<AuditFilters>(emptyFilters);
  const [actorSearch, setActorSearch] = useState("");
  const [isActorFocused, setIsActorFocused] = useState(false);
  const apiParams = useMemo(() => toApiParams(committedFilters, page), [committedFilters, page]);
  const auditLogsQuery = useQuery({
    queryFn: () => searchAuditLogs(apiParams),
    queryKey: ["audit-logs", apiParams],
    retry: 1
  });
  const actorQuery = useQuery({
    enabled: actorSearch.trim().length > 0,
    queryFn: () => searchAdminUsers({ keyword: actorSearch.trim(), page: 0, size: 8 }),
    queryKey: ["audit-actor-suggestions", actorSearch.trim()],
    retry: 1
  });
  const logs = auditLogsQuery.data?.content ?? [];
  const actionOptions = [
    { label: "Any action", value: "" },
    ...Array.from(new Set(logs.map((log) => log.action).filter(Boolean))).map((value) => optionFrom(actionLabel(value), value))
  ];
  const resourceOptions = [
    { label: "Any resource", value: "" },
    ...Array.from(new Set(logs.map((log) => log.resourceType).filter(Boolean))).map((value) => optionFrom(value, value))
  ];
  const normalizedError = auditLogsQuery.error ? normalizeUnknownError(auditLogsQuery.error) : null;
  const totalElements = auditLogsQuery.data?.totalElements ?? 0;
  const showingFrom = totalElements ? page * pageSize + 1 : 0;
  const showingTo = totalElements ? Math.min((page + 1) * pageSize, totalElements) : 0;

  function updateFilter(field: keyof AuditFilters, value: string) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCommittedFilters(filters);
    setPage(0);
  }

  function clearFilters() {
    setFilters(emptyFilters);
    setCommittedFilters(emptyFilters);
    setActorSearch("");
    setPage(0);
  }

  return (
    <section className="audit-page">
      <header className="audit-page-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Internal Audit Logs</h1>
          <div className="audit-subtitle">
            <span>System activities and security events.</span>
            <b>ADMIN CLEARANCE</b>
          </div>
        </div>
        <div className="audit-header-actions">
          <Button variant="secondary" onClick={() => exportAuditCsv(logs)} disabled={!logs.length}>
            <Download size={16} />
            Export CSV
          </Button>
        </div>
      </header>

      <form className="audit-filter-card" onSubmit={submitSearch}>
        <div className="audit-date-range-field">
          <span><CalendarDays size={15} />DATE RANGE</span>
          <DatePicker max={filters.endDate || undefined} value={filters.startDate} onChange={(event) => updateFilter("startDate", event.target.value)} />
          <small>to</small>
          <DatePicker min={filters.startDate || undefined} value={filters.endDate} onChange={(event) => updateFilter("endDate", event.target.value)} />
        </div>
        <div className="audit-actor-picker">
          <label className="field">
            <span>ACTOR (USER)</span>
            <span className="audit-actor-input">
              <Search size={15} />
              <input
                className="input"
                placeholder="Search user name or email"
                value={actorSearch}
                onBlur={() => window.setTimeout(() => setIsActorFocused(false), 140)}
                onChange={(event) => {
                  setActorSearch(event.target.value);
                  updateFilter("actorId", "");
                }}
                onFocus={() => setIsActorFocused(true)}
              />
            </span>
          </label>
          {isActorFocused && actorSearch.trim() ? (
            <div className="audit-actor-suggestions">
              {actorQuery.isLoading ? <span>Searching users...</span> : null}
              {actorQuery.data?.content.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => {
                    updateFilter("actorId", String(user.id));
                    setActorSearch(`${user.fullName} / ${user.email}`);
                    setIsActorFocused(false);
                  }}
                >
                  <strong>{user.fullName}</strong>
                  <small>{user.email} / User #{user.id}</small>
                </button>
              ))}
              {!actorQuery.isLoading && !actorQuery.data?.content.length ? <span>No matching users.</span> : null}
            </div>
          ) : null}
          {filters.actorId ? <small className="audit-selected-actor">Selected actor ID: {filters.actorId}</small> : null}
        </div>
        <Select label="ACTION TYPE" options={actionOptions} value={filters.action} onChange={(event) => updateFilter("action", event.target.value)} />
        <Select label="RESOURCE TYPE" options={resourceOptions} value={filters.resourceType} onChange={(event) => updateFilter("resourceType", event.target.value)} />
        <Input
          label="RESOURCE ID (TARGET RECORD)"
          placeholder="ID of affected user/listing/contract..."
          value={filters.resourceId}
          onChange={(event) => updateFilter("resourceId", event.target.value)}
        />
        <div className="audit-filter-actions">
          <button type="button" onClick={clearFilters}>Clear All</button>
          <Button type="submit" variant="secondary" disabled={auditLogsQuery.isFetching}>Apply</Button>
        </div>
      </form>

      <section className="audit-table-card">
        {normalizedError ? (
          <EmptyState
            title="Audit logs could not be loaded"
            description={normalizedError.message}
            action={<Button onClick={() => auditLogsQuery.refetch()}>Retry</Button>}
          />
        ) : null}
        {auditLogsQuery.isLoading ? <div className="audit-table-skeleton" /> : null}
        {!auditLogsQuery.isLoading && !normalizedError && !logs.length ? (
          <EmptyState title="No audit logs found" description="Adjust filters to inspect more activity." action={<Button onClick={clearFilters}>Clear filters</Button>} />
        ) : null}
        {logs.length ? (
          <>
            <Table>
              <thead>
                <tr>
                  <th>TIMESTAMP (UTC)</th>
                  <th>ACTOR</th>
                  <th>ACTION</th>
                  <th>RESOURCE TYPE</th>
                  <th>RESOURCE ID</th>
                  <th>IP ADDRESS</th>
                  <th>DETAILS</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{formatUtcTimestamp(log.createdAt)}</td>
                    <td><AuditActor log={log} /></td>
                    <td><StatusBadge tone={actionTone(log.action)}>{actionLabel(log.action)}</StatusBadge></td>
                    <td>{log.resourceType || "Resource updating"}</td>
                    <td><code className="audit-resource-id">{log.resourceId || "No resource id"}</code></td>
                    <td>{log.ipAddress || "No IP"}</td>
                    <td>
                      <Button asChild size="sm" variant="ghost" aria-label={`Open audit log ${log.id}`}>
                        <Link className="audit-code-link" to={`/admin/audit-logs/${log.id}`}>
                          <Code2 size={16} />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div className="audit-table-footer">
              <span>Showing {showingFrom} to {showingTo} of {totalElements} entries</span>
              <div className="audit-page-buttons">
                {Array.from({ length: Math.max(auditLogsQuery.data?.totalPages ?? 1, 1) }).map((_, index) => (
                  <button className={page === index ? "is-active" : ""} key={index} type="button" onClick={() => setPage(index)}>
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </section>
    </section>
  );
}

function AuditDetailView({ log }: { log: AuditLogRecord }) {
  const oldValue = parseJson(log.oldValue);
  const newValue = parseJson(log.newValue);

  return (
    <section className="audit-detail-page">
      <nav className="audit-breadcrumb">
        <Link to="/admin/users">Admin</Link>
        <span>/</span>
        <Link to="/admin/audit-logs">Audit Logs</Link>
        <span>/</span>
        <strong>Entry #{log.id}</strong>
      </nav>
      <header className="audit-detail-header">
        <div>
          <Link className="audit-back-link" to="/admin/audit-logs"><ArrowLeft size={18} />Audit Log Detail</Link>
          <StatusBadge tone={actionTone(log.action)}>{actionLabel(log.action)}</StatusBadge>
        </div>
        <Button variant="secondary" onClick={() => exportAuditCsv([log])}><Download size={16} />Export Log</Button>
      </header>

      <div className="audit-detail-grid">
        <main className="audit-detail-main">
          <section className="audit-detail-card">
            <h2>Event Metadata</h2>
            <div className="audit-metadata-grid">
              <div><span>TIMESTAMP</span><strong>{formatUtcTimestamp(log.createdAt)}</strong></div>
              <div><span>ACTOR (USER)</span><strong>{actorLabel(log)}</strong></div>
              <div><span>ACTION TYPE</span><strong>{actionLabel(log.action)}</strong></div>
              <div><span>RESOURCE TYPE</span><strong>{log.resourceType || "Resource updating"}</strong></div>
              <div><span>RESOURCE ID</span><code>{log.resourceId || "No resource id"}</code></div>
              <div><span>IP ADDRESS</span><strong>{log.ipAddress || "No IP returned"}</strong></div>
            </div>
          </section>

          <section className="audit-detail-card">
            <h2>Data Changes</h2>
            <div className="audit-json-diff">
              <article>
                <h3>Previous State</h3>
                <pre className="audit-json-old">{oldValue || "No previous state returned by the audit API."}</pre>
              </article>
              <article>
                <h3>New State</h3>
                <pre className="audit-json-new">{newValue || "No new state returned by the audit API."}</pre>
              </article>
            </div>
          </section>
        </main>

        <aside className="audit-detail-side">
          <section className="audit-detail-card audit-actor-context-card">
            <span>{initials(actorLabel(log))}</span>
            <h2>{actorLabel(log)}</h2>
            <p>{log.actorEmail || "Email not returned by the audit API."}</p>
            <div className="audit-context-list">
              <div><span>USER ID</span><strong>{log.actorId || "System"}</strong></div>
              <div><span>DEPARTMENT</span><strong>Not returned</strong></div>
              <div><span>LOCATION</span><strong>Not returned</strong></div>
            </div>
            <Button asChild variant="secondary"><Link to={log.actorId ? `/admin/users` : "/admin/audit-logs"}>View Full Profile</Link></Button>
          </section>

          <section className="audit-detail-card">
            <h2>System Info</h2>
            <div className="audit-system-row">
              <ShieldCheck size={18} />
              <div><strong>MFA Verified</strong><small>Not returned by audit API.</small></div>
            </div>
            <div className="audit-system-row">
              <Code2 size={18} />
              <div><strong>API Source</strong><small>{log.ipAddress || "Source details not returned."}</small></div>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}

export function AuditLogsPage() {
  const { auditLogId } = useParams();
  const auditLogQuery = useQuery({
    enabled: Boolean(auditLogId),
    queryFn: () => getAuditLog(auditLogId ?? ""),
    queryKey: ["audit-log", auditLogId],
    retry: 1
  });
  const normalizedError = auditLogQuery.error ? normalizeUnknownError(auditLogQuery.error) : null;

  if (!auditLogId) {
    return <AuditLogsListView />;
  }

  if (auditLogQuery.isLoading) {
    return <section className="audit-detail-page"><div className="audit-table-skeleton" /></section>;
  }

  if (normalizedError) {
    return (
      <section className="audit-detail-page">
        <EmptyState title="Audit detail could not be loaded" description={normalizedError.message} action={<Button onClick={() => auditLogQuery.refetch()}>Retry</Button>} />
      </section>
    );
  }

  return auditLogQuery.data ? <AuditDetailView log={auditLogQuery.data} /> : null;
}
