import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Input } from "../../shared/ui/Input";
import { Pagination } from "../../shared/ui/Pagination";
import { Select } from "../../shared/ui/Select";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { Table } from "../../shared/ui/Table";
import { searchCustomers, type CustomerSearchParams } from "./customerApi";

const pageSize = 10;

type CustomerFilters = {
  keyword: string;
  priority: string;
  source: string;
  status: string;
};

function getInitialFilters(searchParams: URLSearchParams): CustomerFilters {
  return {
    keyword: searchParams.get("keyword") ?? "",
    priority: searchParams.get("priority") ?? "",
    source: searchParams.get("source") ?? "",
    status: searchParams.get("status") ?? ""
  };
}

function buildSearchParams(filters: CustomerFilters, page: number) {
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

function toApiParams(filters: CustomerFilters, page: number): CustomerSearchParams {
  return {
    keyword: filters.keyword,
    page,
    priority: filters.priority,
    size: pageSize,
    source: filters.source,
    status: filters.status
  };
}

function statusTone(status: string) {
  if (status === "ACTIVE") {
    return "success";
  }

  if (status === "ARCHIVED") {
    return "danger";
  }

  return "neutral";
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

function customerStatusKey(status: string) {
  const statusKeys: Record<string, string> = {
    ACTIVE: "status.active",
    ARCHIVED: "common.archived",
    INACTIVE: "status.inactive"
  };

  return statusKeys[status] ?? status;
}

export function CustomersPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page") ?? 0) || 0;
  const committedFilters = useMemo(() => getInitialFilters(searchParams), [searchParams]);
  const [filters, setFilters] = useState<CustomerFilters>(committedFilters);
  const apiParams = useMemo(() => toApiParams(committedFilters, currentPage), [committedFilters, currentPage]);
  const customersQuery = useQuery({
    queryFn: () => searchCustomers(apiParams),
    queryKey: ["customers", apiParams],
    retry: 1
  });
  const normalizedError = customersQuery.error ? normalizeUnknownError(customersQuery.error) : null;
  const statusOptions = useMemo(
    () => [
      { label: t("common.anyStatus"), value: "" },
      { label: t("status.active"), value: "ACTIVE" },
      { label: t("status.inactive"), value: "INACTIVE" },
      { label: t("common.archived"), value: "ARCHIVED" }
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
  const sourceOptions = useMemo(
    () => [
      { label: t("common.anySource"), value: "" },
      { label: t("common.manual"), value: "MANUAL" },
      { label: t("common.website"), value: "WEBSITE" },
      { label: t("common.referral"), value: "REFERRAL" },
      { label: t("common.import"), value: "IMPORT" },
      { label: t("common.other"), value: "OTHER" }
    ],
    [t]
  );

  useEffect(() => {
    setFilters(committedFilters);
  }, [committedFilters]);

  function updateFilter(field: keyof CustomerFilters, value: string) {
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
          <p className="eyebrow">{t("customers.customers")}</p>
          <h2>{t("customers.customerCrm")}</h2>
        </div>
        <Button asChild>
          <Link to="/customers/new">
            <Plus size={16} />
            {t("customers.newCustomer")}
          </Link>
        </Button>
      </div>
      <form className="filter-bar customer-filter-bar" onSubmit={submitSearch}>
        <Input
          label={t("common.keyword")}
          value={filters.keyword}
          onChange={(event) => updateFilter("keyword", event.target.value)}
          placeholder={t("placeholders.nameEmailPhone")}
        />
        <Select label={t("common.status")} options={statusOptions} value={filters.status} onChange={(event) => updateFilter("status", event.target.value)} />
        <Select label={t("common.priority")} options={priorityOptions} value={filters.priority} onChange={(event) => updateFilter("priority", event.target.value)} />
        <Select label={t("common.source")} options={sourceOptions} value={filters.source} onChange={(event) => updateFilter("source", event.target.value)} />
        <div className="filter-actions">
          <Button type="submit" disabled={customersQuery.isFetching}>
            <Search size={16} />
            {t("actions.search")}
          </Button>
          <Button type="button" variant="secondary" onClick={resetSearch}>
            {t("actions.reset")}
          </Button>
        </div>
      </form>
      {customersQuery.isLoading ? (
        <div className="detail-skeleton">
          <div />
          <div />
        </div>
      ) : null}
      {normalizedError ? (
        <div className="content-section">
          <EmptyState title={t("customers.couldNotLoad")} description={normalizedError.message} action={<Button onClick={() => customersQuery.refetch()}>{t("actions.retry")}</Button>} />
        </div>
      ) : null}
      {customersQuery.data?.content.length === 0 ? (
        <div className="content-section">
          <EmptyState title={t("customers.noCustomersFound")} description={t("customers.adjustFilters")} action={<Button onClick={resetSearch}>{t("actions.clearFilters")}</Button>} />
        </div>
      ) : null}
      {customersQuery.data && customersQuery.data.content.length > 0 ? (
        <>
          <Table>
            <thead>
              <tr>
                <th>{t("customers.customer")}</th>
                <th>{t("common.status")}</th>
                <th>{t("common.priority")}</th>
                <th>{t("common.source")}</th>
                <th>{t("common.contact")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {customersQuery.data.content.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <strong>{customer.fullName}</strong>
                    <small>{customer.code}</small>
                  </td>
                  <td><StatusBadge tone={statusTone(customer.status)}>{t(customerStatusKey(customer.status))}</StatusBadge></td>
                  <td><StatusBadge tone={priorityTone(customer.priority)}>{t(`common.${customer.priority.toLowerCase()}`)}</StatusBadge></td>
                  <td>{customer.source}</td>
                  <td>
                    <small>{customer.email || t("app.noEmail")}</small>
                    <small>{customer.phone || t("customers.noPhone")}</small>
                  </td>
                  <td>
                    <Button asChild variant="secondary" size="sm">
                      <Link to={`/customers/${customer.id}`}>{t("actions.open")}</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination
            page={customersQuery.data.page}
            totalPages={customersQuery.data.totalPages}
            onPageChange={(page) => setSearchParams(buildSearchParams(committedFilters, page))}
          />
        </>
      ) : null}
    </section>
  );
}
