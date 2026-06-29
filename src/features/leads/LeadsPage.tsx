import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Input } from "../../shared/ui/Input";
import { Pagination } from "../../shared/ui/Pagination";
import { Select } from "../../shared/ui/Select";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { Table } from "../../shared/ui/Table";
import { searchLeads, type LeadPipelineStatus, type LeadRecord, type LeadSearchParams } from "./leadApi";
import { leadStatusKey } from "./leadLabels";

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
  const { t } = useTranslation();
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
  const statusOptions = useMemo(
    () => [
      { label: t("common.anyStatus"), value: "" },
      ...pipelineStatuses.map((status) => ({ label: t(leadStatusKey(status)), value: status }))
    ],
    [t]
  );
  const priorityOptions = useMemo(
    () => [
      { label: t("common.anyPriority"), value: "" },
      { label: t("common.high"), value: "HIGH" },
      { label: t("common.medium"), value: "MEDIUM" },
      { label: t("common.low"), value: "LOW" }
    ],
    [t]
  );

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
          <p className="eyebrow">{t("leads.leads")}</p>
          <h2>{t("leads.leadPipeline")}</h2>
        </div>
      </div>
      <form className="filter-bar lead-filter-bar" onSubmit={submitSearch}>
        <Input
          label={t("common.keyword")}
          value={filters.keyword}
          onChange={(event) => updateFilter("keyword", event.target.value)}
          placeholder={t("placeholders.nameEmailPhone")}
        />
        <Select label={t("common.status")} options={statusOptions} value={filters.status} onChange={(event) => updateFilter("status", event.target.value)} />
        <Select label={t("common.priority")} options={priorityOptions} value={filters.priority} onChange={(event) => updateFilter("priority", event.target.value)} />
        <div className="filter-actions">
          <Button type="submit" disabled={leadsQuery.isFetching}>
            <Search size={16} />
            {t("actions.search")}
          </Button>
          <Button type="button" variant="secondary" onClick={resetSearch}>
            {t("actions.reset")}
          </Button>
        </div>
      </form>
      <section className="content-section">
        <div className="section-header">
          <div>
            <p className="eyebrow">{t("leads.board")}</p>
            <h2>{t("leads.pipelineStatus")}</h2>
          </div>
        </div>
        {boardQuery.error ? (
          <EmptyState title={t("leads.pipelineBoardUnavailable")} description={normalizeUnknownError(boardQuery.error).message} action={<Button onClick={() => boardQuery.refetch()}>{t("actions.retry")}</Button>} />
        ) : null}
        <div className="lead-board">
          {groupLeads(boardQuery.data?.content ?? []).map((column) => (
            <article className="lead-board-column" key={column.status}>
              <header>
                <StatusBadge tone={statusTone(column.status)}>{t(leadStatusKey(column.status))}</StatusBadge>
                <strong>{column.leads.length}</strong>
              </header>
              {column.leads.length ? column.leads.slice(0, 5).map((lead) => (
                <Link className="lead-board-card" to={`/leads/${lead.id}`} key={lead.id}>
                  <strong>{lead.fullName}</strong>
                  <small>{lead.code} / {t(`common.${lead.priority.toLowerCase()}`)}</small>
                </Link>
              )) : <small className="muted">{t("leads.noLeads")}</small>}
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
          <EmptyState title={t("leads.couldNotLoad")} description={normalizedError.message} action={<Button onClick={() => leadsQuery.refetch()}>{t("actions.retry")}</Button>} />
        </div>
      ) : null}
      {leadsQuery.data?.content.length === 0 ? (
        <div className="content-section">
          <EmptyState title={t("leads.noLeadsFound")} description={t("leads.adjustFilters")} action={<Button onClick={resetSearch}>{t("actions.clearFilters")}</Button>} />
        </div>
      ) : null}
      {leadsQuery.data && leadsQuery.data.content.length > 0 ? (
        <>
          <Table>
            <thead>
              <tr>
                <th>{t("common.lead")}</th>
                <th>{t("common.status")}</th>
                <th>{t("common.priority")}</th>
                <th>{t("common.source")}</th>
                <th>{t("common.agent")}</th>
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
                  <td><StatusBadge tone={statusTone(lead.pipelineStatus)}>{t(leadStatusKey(lead.pipelineStatus))}</StatusBadge></td>
                  <td><StatusBadge tone={priorityTone(lead.priority)}>{t(`common.${lead.priority.toLowerCase()}`)}</StatusBadge></td>
                  <td>{lead.sourceCode}</td>
                  <td>{lead.assignedAgentId ?? t("common.unassigned")}</td>
                  <td>
                    <Button asChild variant="secondary" size="sm">
                      <Link to={`/leads/${lead.id}`}>{t("actions.open")}</Link>
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
