import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Search } from "lucide-react";
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

const statusOptions = [
  { label: "Any status", value: "" },
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
  { label: "Archived", value: "ARCHIVED" }
];

const priorityOptions = [
  { label: "Any priority", value: "" },
  { label: "High", value: "HIGH" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Low", value: "LOW" }
];

const sourceOptions = [
  { label: "Any source", value: "" },
  { label: "Manual", value: "MANUAL" },
  { label: "Website", value: "WEBSITE" },
  { label: "Referral", value: "REFERRAL" },
  { label: "Import", value: "IMPORT" },
  { label: "Other", value: "OTHER" }
];

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

export function CustomersPage() {
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
          <p className="eyebrow">Customers</p>
          <h2>Customer CRM</h2>
        </div>
        <Button asChild>
          <Link to="/customers/new">
            <Plus size={16} />
            New customer
          </Link>
        </Button>
      </div>
      <form className="filter-bar customer-filter-bar" onSubmit={submitSearch}>
        <Input
          label="Keyword"
          value={filters.keyword}
          onChange={(event) => updateFilter("keyword", event.target.value)}
          placeholder="Name, email, phone, code"
        />
        <Select label="Status" options={statusOptions} value={filters.status} onChange={(event) => updateFilter("status", event.target.value)} />
        <Select label="Priority" options={priorityOptions} value={filters.priority} onChange={(event) => updateFilter("priority", event.target.value)} />
        <Select label="Source" options={sourceOptions} value={filters.source} onChange={(event) => updateFilter("source", event.target.value)} />
        <div className="filter-actions">
          <Button type="submit" disabled={customersQuery.isFetching}>
            <Search size={16} />
            Search
          </Button>
          <Button type="button" variant="secondary" onClick={resetSearch}>
            Reset
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
          <EmptyState title="Customers could not be loaded" description={normalizedError.message} action={<Button onClick={() => customersQuery.refetch()}>Retry</Button>} />
        </div>
      ) : null}
      {customersQuery.data?.content.length === 0 ? (
        <div className="content-section">
          <EmptyState title="No customers found" description="Adjust filters or create a new customer profile." action={<Button onClick={resetSearch}>Clear filters</Button>} />
        </div>
      ) : null}
      {customersQuery.data && customersQuery.data.content.length > 0 ? (
        <>
          <Table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Source</th>
                <th>Contact</th>
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
                  <td><StatusBadge tone={statusTone(customer.status)}>{customer.status}</StatusBadge></td>
                  <td><StatusBadge tone={priorityTone(customer.priority)}>{customer.priority}</StatusBadge></td>
                  <td>{customer.source}</td>
                  <td>
                    <small>{customer.email || "No email"}</small>
                    <small>{customer.phone || "No phone"}</small>
                  </td>
                  <td>
                    <Button asChild variant="secondary" size="sm">
                      <Link to={`/customers/${customer.id}`}>Open</Link>
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
