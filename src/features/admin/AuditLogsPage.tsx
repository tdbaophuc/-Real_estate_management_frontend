import { useMemo, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye, Search } from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { formatDate } from "../../shared/lib/format";
import { Button } from "../../shared/ui/Button";
import { DatePicker } from "../../shared/ui/DatePicker";
import { Drawer } from "../../shared/ui/Drawer";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Input } from "../../shared/ui/Input";
import { Pagination } from "../../shared/ui/Pagination";
import { Table } from "../../shared/ui/Table";
import { getAuditLog, searchAuditLogs, type AuditLogSearchParams } from "./auditLogApi";

const pageSize = 10;

type AuditFilters = {
  action: string;
  actor: string;
  endDate: string;
  resourceType: string;
  startDate: string;
};

function toApiParams(filters: AuditFilters, page: number): AuditLogSearchParams {
  return {
    action: filters.action,
    actor: filters.actor,
    endDate: filters.endDate,
    page,
    resourceType: filters.resourceType,
    size: pageSize,
    startDate: filters.startDate
  };
}

function formatMaybeDate(value: string) {
  if (!value) {
    return "Updating";
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : formatDate(parsed);
}

export function AuditLogsPage() {
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<AuditFilters>({
    action: "",
    actor: "",
    endDate: "",
    resourceType: "",
    startDate: ""
  });
  const [committedFilters, setCommittedFilters] = useState(filters);
  const [selectedAuditId, setSelectedAuditId] = useState<number | string | null>(null);
  const apiParams = useMemo(() => toApiParams(committedFilters, page), [committedFilters, page]);
  const auditLogsQuery = useQuery({
    queryFn: () => searchAuditLogs(apiParams),
    queryKey: ["audit-logs", apiParams],
    retry: 1
  });
  const auditLogQuery = useQuery({
    enabled: selectedAuditId !== null,
    queryFn: () => getAuditLog(selectedAuditId as number | string),
    queryKey: ["audit-log", selectedAuditId],
    retry: 1
  });
  const normalizedError = auditLogsQuery.error ? normalizeUnknownError(auditLogsQuery.error) : null;

  function updateFilter(field: keyof AuditFilters, value: string) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCommittedFilters(filters);
    setPage(0);
  }

  function resetSearch() {
    const nextFilters = {
      action: "",
      actor: "",
      endDate: "",
      resourceType: "",
      startDate: ""
    };
    setFilters(nextFilters);
    setCommittedFilters(nextFilters);
    setPage(0);
  }

  return (
    <section>
      <div className="section-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h2>Audit logs</h2>
        </div>
      </div>
      <form className="filter-bar audit-filter-bar" onSubmit={submitSearch}>
        <Input label="Action" value={filters.action} onChange={(event) => updateFilter("action", event.target.value)} placeholder="USER_STATUS_CHANGED" />
        <Input label="Resource" value={filters.resourceType} onChange={(event) => updateFilter("resourceType", event.target.value)} placeholder="USER, LISTING" />
        <Input label="Actor" value={filters.actor} onChange={(event) => updateFilter("actor", event.target.value)} placeholder="Name or email" />
        <DatePicker label="Start date" max={filters.endDate || undefined} value={filters.startDate} onChange={(event) => updateFilter("startDate", event.target.value)} />
        <DatePicker label="End date" min={filters.startDate || undefined} value={filters.endDate} onChange={(event) => updateFilter("endDate", event.target.value)} />
        <div className="filter-actions">
          <Button type="submit" disabled={auditLogsQuery.isFetching}>
            <Search size={16} />
            Search
          </Button>
          <Button type="button" variant="secondary" onClick={resetSearch}>
            Reset
          </Button>
        </div>
      </form>
      {normalizedError ? (
        <div className="content-section">
          <EmptyState
            title="Audit logs could not be loaded"
            description={normalizedError.message}
            action={<Button onClick={() => auditLogsQuery.refetch()}>Retry</Button>}
          />
        </div>
      ) : null}
      {auditLogsQuery.isLoading ? (
        <div className="detail-skeleton">
          <div />
          <div />
        </div>
      ) : null}
      {auditLogsQuery.data?.content.length === 0 ? (
        <div className="content-section">
          <EmptyState title="No audit logs found" description="Adjust filters to inspect more activity." action={<Button onClick={resetSearch}>Clear filters</Button>} />
        </div>
      ) : null}
      {auditLogsQuery.data && auditLogsQuery.data.content.length > 0 ? (
        <>
          <Table>
            <thead>
              <tr>
                <th>Action</th>
                <th>Resource</th>
                <th>Actor</th>
                <th>Time</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {auditLogsQuery.data.content.map((log) => (
                <tr key={log.id}>
                  <td>
                    <strong>{log.action}</strong>
                    <small>{log.ipAddress || "No IP"}</small>
                  </td>
                  <td>
                    <strong>{log.resourceType}</strong>
                    <small>{log.resourceId || "No resource id"}</small>
                  </td>
                  <td>
                    <strong>{log.actorName}</strong>
                    <small>{log.actorEmail || log.actorId || "System"}</small>
                  </td>
                  <td>{formatMaybeDate(log.createdAt)}</td>
                  <td>
                    <Button size="sm" variant="secondary" onClick={() => setSelectedAuditId(log.id)}>
                      <Eye size={16} />
                      Detail
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination page={auditLogsQuery.data.page} totalPages={auditLogsQuery.data.totalPages} onPageChange={setPage} />
        </>
      ) : null}
      <Drawer open={selectedAuditId !== null} title="Audit detail" onClose={() => setSelectedAuditId(null)}>
        <div className="dialog-body admin-detail-drawer">
          {auditLogQuery.error ? (
            <EmptyState
              title="Audit detail could not be loaded"
              description={normalizeUnknownError(auditLogQuery.error).message}
              action={<Button onClick={() => auditLogQuery.refetch()}>Retry</Button>}
            />
          ) : null}
          {auditLogQuery.isLoading ? <div className="detail-skeleton"><div /><div /></div> : null}
          {auditLogQuery.data ? (
            <>
              <section className="admin-profile-card">
                <div>
                  <span>Action</span>
                  <strong>{auditLogQuery.data.action}</strong>
                </div>
                <div>
                  <span>Resource</span>
                  <strong>{auditLogQuery.data.resourceType} {auditLogQuery.data.resourceId}</strong>
                </div>
                <div>
                  <span>Actor</span>
                  <strong>{auditLogQuery.data.actorName}</strong>
                  <small>{auditLogQuery.data.actorEmail || auditLogQuery.data.actorId || "System"}</small>
                </div>
                <div>
                  <span>Time</span>
                  <strong>{formatMaybeDate(auditLogQuery.data.createdAt)}</strong>
                </div>
                <div>
                  <span>IP address</span>
                  <strong>{auditLogQuery.data.ipAddress || "Updating"}</strong>
                </div>
              </section>
              <section className="admin-action-panel">
                <h3>Details</h3>
                <pre className="audit-detail-pre">{auditLogQuery.data.details || "No additional details."}</pre>
              </section>
            </>
          ) : null}
        </div>
      </Drawer>
    </section>
  );
}
