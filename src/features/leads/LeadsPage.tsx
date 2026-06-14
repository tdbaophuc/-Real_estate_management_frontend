import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Input } from "../../shared/ui/Input";
import { Pagination } from "../../shared/ui/Pagination";
import { Select } from "../../shared/ui/Select";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { Table } from "../../shared/ui/Table";
import { searchLeads, type LeadPipelineStatus, type LeadRecord, type LeadSearchParams } from "./leadApi";

const pageSize = 10;

const pipelineStatuses: LeadPipelineStatus[] = [
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

const statusOptions = [
  { label: "Any status", value: "" },
  ...pipelineStatuses.map((status) => ({ label: status.replace(/_/g, " "), value: status }))
];

const priorityOptions = [
  { label: "Any priority", value: "" },
  { label: "High", value: "HIGH" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Low", value: "LOW" }
];

type LeadFilters = {
  keyword: string;
  priority: string;
  status: string;
};

function getInitialFilters(searchParams: URLSearchParams): LeadFilters {
  return {
    keyword: searchParams.get("keyword") ?? "",
    priority: searchParams.get("priority") ?? "",
    status: searchParams.get("status") ?? ""
  };
}

function buildSearchParams(filters: LeadFilters, page: number) {
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

function toApiParams(filters: LeadFilters, page: number): LeadSearchParams {
  return {
    keyword: filters.keyword,
    page,
    priority: filters.priority,
    size: pageSize,
    status: filters.status
  };
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

function groupLeads(leads: LeadRecord[]) {
  return pipelineStatuses.map((status) => ({
    leads: leads.filter((lead) => lead.pipelineStatus === status),
    status
  }));
}

export function LeadsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page") ?? 0) || 0;
  const committedFilters = useMemo(() => getInitialFilters(searchParams), [searchParams]);
  const [filters, setFilters] = useState<LeadFilters>(committedFilters);
  const apiParams = useMemo(() => toApiParams(committedFilters, currentPage), [committedFilters, currentPage]);
  const leadsQuery = useQuery({
    queryFn: () => searchLeads(apiParams),
    queryKey: ["leads", apiParams],
    retry: 1
  });
  const boardQuery = useQuery({
    queryFn: () => searchLeads({ page: 0, size: 100 }),
    queryKey: ["leads", "board"],
    retry: 1
  });
  const normalizedError = leadsQuery.error ? normalizeUnknownError(leadsQuery.error) : null;

  useEffect(() => {
    setFilters(committedFilters);
  }, [committedFilters]);

  function updateFilter(field: keyof LeadFilters, value: string) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchParams(buildSearchParams(filters, 0));
  }

  function resetSearch() {
    const nextFilters = getInitialFilters(new URLSearchParams());
    setFilters(nextFilters);
    setSearchParams(buildSearchParams(nextFilters, 0));
  }

  return (
    <section>
      <div className="section-header">
        <div>
          <p className="eyebrow">Leads</p>
          <h2>Lead pipeline</h2>
        </div>
      </div>
      <form className="filter-bar lead-filter-bar" onSubmit={submitSearch}>
        <Input
          label="Keyword"
          value={filters.keyword}
          onChange={(event) => updateFilter("keyword", event.target.value)}
          placeholder="Name, email, phone, code"
        />
        <Select label="Status" options={statusOptions} value={filters.status} onChange={(event) => updateFilter("status", event.target.value)} />
        <Select label="Priority" options={priorityOptions} value={filters.priority} onChange={(event) => updateFilter("priority", event.target.value)} />
        <div className="filter-actions">
          <Button type="submit" disabled={leadsQuery.isFetching}>
            <Search size={16} />
            Search
          </Button>
          <Button type="button" variant="secondary" onClick={resetSearch}>
            Reset
          </Button>
        </div>
      </form>
      <section className="content-section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Board</p>
            <h2>Pipeline status</h2>
          </div>
        </div>
        {boardQuery.error ? (
          <EmptyState title="Pipeline board unavailable" description={normalizeUnknownError(boardQuery.error).message} action={<Button onClick={() => boardQuery.refetch()}>Retry</Button>} />
        ) : null}
        <div className="lead-board">
          {groupLeads(boardQuery.data?.content ?? []).map((column) => (
            <article className="lead-board-column" key={column.status}>
              <header>
                <StatusBadge tone={statusTone(column.status)}>{column.status.replace(/_/g, " ")}</StatusBadge>
                <strong>{column.leads.length}</strong>
              </header>
              {column.leads.length ? column.leads.slice(0, 5).map((lead) => (
                <Link className="lead-board-card" to={`/leads/${lead.id}`} key={lead.id}>
                  <strong>{lead.fullName}</strong>
                  <small>{lead.code} / {lead.priority}</small>
                </Link>
              )) : <small className="muted">No leads</small>}
            </article>
          ))}
        </div>
      </section>
      {leadsQuery.isLoading ? (
        <div className="detail-skeleton">
          <div />
          <div />
        </div>
      ) : null}
      {normalizedError ? (
        <div className="content-section">
          <EmptyState title="Leads could not be loaded" description={normalizedError.message} action={<Button onClick={() => leadsQuery.refetch()}>Retry</Button>} />
        </div>
      ) : null}
      {leadsQuery.data?.content.length === 0 ? (
        <div className="content-section">
          <EmptyState title="No leads found" description="Adjust filters to see more opportunities." action={<Button onClick={resetSearch}>Clear filters</Button>} />
        </div>
      ) : null}
      {leadsQuery.data && leadsQuery.data.content.length > 0 ? (
        <>
          <Table>
            <thead>
              <tr>
                <th>Lead</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Source</th>
                <th>Agent</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {leadsQuery.data.content.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <strong>{lead.fullName}</strong>
                    <small>{lead.email || lead.phone || lead.code}</small>
                  </td>
                  <td><StatusBadge tone={statusTone(lead.pipelineStatus)}>{lead.pipelineStatus}</StatusBadge></td>
                  <td><StatusBadge tone={priorityTone(lead.priority)}>{lead.priority}</StatusBadge></td>
                  <td>{lead.sourceCode}</td>
                  <td>{lead.assignedAgentId ?? "Unassigned"}</td>
                  <td>
                    <Button asChild variant="secondary" size="sm">
                      <Link to={`/leads/${lead.id}`}>Open</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination
            page={leadsQuery.data.page}
            totalPages={leadsQuery.data.totalPages}
            onPageChange={(page) => setSearchParams(buildSearchParams(committedFilters, page))}
          />
        </>
      ) : null}
    </section>
  );
}
