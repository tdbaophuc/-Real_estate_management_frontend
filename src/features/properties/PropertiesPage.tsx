import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowUpDown, Bath, BedDouble, Home, MapPin, Plus, Ruler, Search } from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Input } from "../../shared/ui/Input";
import { Pagination } from "../../shared/ui/Pagination";
import { Select } from "../../shared/ui/Select";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { Table, TableEmpty } from "../../shared/ui/Table";
import { statusLabels } from "../../shared/constants/enumLabels";
import { formatCurrency } from "../../shared/lib/format";
import {
  searchProperties,
  type PropertyPurpose,
  type PropertyRecord,
  type PropertySearchParams
} from "./propertyApi";

const pageSize = 10;

const purposeOptions = [
  { label: "Any purpose", value: "" },
  { label: "Sale", value: "SALE" },
  { label: "Rent", value: "RENT" }
];

const statusOptions = [
  { label: "Any status", value: "" },
  { label: "Draft", value: "DRAFT" },
  { label: "Available", value: "AVAILABLE" },
  { label: "Reserved", value: "RESERVED" },
  { label: "Sold", value: "SOLD" },
  { label: "Rented", value: "RENTED" },
  { label: "Inactive", value: "INACTIVE" }
];

const sortOptions = [
  { label: "Newest", value: "createdAt:DESC" },
  { label: "Price low to high", value: "price:ASC" },
  { label: "Price high to low", value: "price:DESC" },
  { label: "Name A-Z", value: "name:ASC" }
];

type PropertyFilterState = {
  keyword: string;
  purpose: "" | PropertyPurpose;
  sort: string;
  status: string;
};

function getParam(searchParams: URLSearchParams, key: keyof PropertyFilterState) {
  return searchParams.get(key) ?? "";
}

function getInitialFilterState(searchParams: URLSearchParams): PropertyFilterState {
  return {
    keyword: getParam(searchParams, "keyword"),
    purpose: getParam(searchParams, "purpose") as "" | PropertyPurpose,
    sort: getParam(searchParams, "sort") || sortOptions[0].value,
    status: getParam(searchParams, "status")
  };
}

function buildSearchParams(filters: PropertyFilterState, page: number) {
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

function toApiParams(filters: PropertyFilterState, page: number): PropertySearchParams {
  const [sortBy, sortDirection] = filters.sort.split(":") as [string, "ASC" | "DESC"];

  return {
    keyword: filters.keyword,
    page,
    purpose: filters.purpose,
    size: pageSize,
    sortBy,
    sortDirection,
    status: filters.status
  };
}

function statusTone(status: string) {
  if (status === "AVAILABLE" || status === "ACTIVE") {
    return "success";
  }

  if (status === "RESERVED" || status === "DRAFT") {
    return "warning";
  }

  if (status === "SOLD" || status === "RENTED") {
    return "info";
  }

  if (status === "INACTIVE" || status === "DELETED") {
    return "danger";
  }

  return "neutral";
}

function labelStatus(status: string) {
  return statusLabels[status as keyof typeof statusLabels] ?? status;
}

function formatArea(property: PropertyRecord) {
  const area = property.floorArea ?? property.landArea;
  return area ? `${area.toLocaleString("vi-VN")} m2` : "Updating";
}

function ErrorState({
  message,
  status,
  onRetry
}: {
  message: string;
  onRetry: () => void;
  status: number;
}) {
  const title =
    status === 403
      ? "You do not have access to properties"
      : status === 404
        ? "Properties were not found"
        : "Properties could not be loaded";

  return (
    <div className="content-section">
      <EmptyState title={title} description={message} action={<Button onClick={onRetry}>Retry</Button>} />
    </div>
  );
}

function PropertyMobileCard({ property }: { property: PropertyRecord }) {
  return (
    <article className="property-card">
      <div className="property-card-header">
        <StatusBadge tone={statusTone(property.status)}>{labelStatus(property.status)}</StatusBadge>
        {property.purpose ? <span>{property.purpose === "SALE" ? "Sale" : "Rent"}</span> : null}
      </div>
      <h3>{property.name}</h3>
      <p className="muted">
        <MapPin size={15} />
        {property.address.fullAddress}
      </p>
      <strong>{property.price ? formatCurrency(property.price, property.currency) : "Price updating"}</strong>
      <div className="listing-meta">
        <span>
          <Ruler size={15} />
          {formatArea(property)}
        </span>
        <span>
          <BedDouble size={15} />
          {property.bedrooms ?? "-"}
        </span>
        <span>
          <Bath size={15} />
          {property.bathrooms ?? "-"}
        </span>
      </div>
      <Button asChild variant="secondary" size="sm">
        <Link to={`/properties/${property.id}`}>View detail</Link>
      </Button>
    </article>
  );
}

export function PropertiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page") ?? 0) || 0;
  const committedFilters = useMemo(() => getInitialFilterState(searchParams), [searchParams]);
  const [filters, setFilters] = useState<PropertyFilterState>(committedFilters);
  const apiParams = useMemo(
    () => toApiParams(committedFilters, currentPage),
    [committedFilters, currentPage]
  );
  const propertiesQuery = useQuery({
    queryFn: () => searchProperties(apiParams),
    queryKey: ["properties", apiParams],
    retry: 1
  });
  const normalizedError = propertiesQuery.error
    ? normalizeUnknownError(propertiesQuery.error)
    : null;

  useEffect(() => {
    setFilters(committedFilters);
  }, [committedFilters]);

  function updateFilter(field: keyof PropertyFilterState, value: string) {
    setFilters((current) => ({
      ...current,
      [field]: value
    }));
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchParams(buildSearchParams(filters, 0));
  }

  function resetSearch() {
    const resetFilters = getInitialFilterState(new URLSearchParams());
    setFilters(resetFilters);
    setSearchParams(buildSearchParams(resetFilters, 0));
  }

  function changePage(page: number) {
    setSearchParams(buildSearchParams(committedFilters, page));
  }

  return (
    <section>
      <div className="section-header">
        <div>
          <p className="eyebrow">Properties</p>
          <h2>Property inventory</h2>
        </div>
        <Button asChild>
          <Link to="/properties/new">
            <Plus size={16} />
            New property
          </Link>
        </Button>
      </div>
      <form className="filter-bar property-filter-bar" onSubmit={submitSearch}>
        <Input
          label="Keyword"
          name="keyword"
          placeholder="Search code, name, address"
          value={filters.keyword}
          onChange={(event) => updateFilter("keyword", event.target.value)}
        />
        <Select
          label="Status"
          name="status"
          options={statusOptions}
          value={filters.status}
          onChange={(event) => updateFilter("status", event.target.value)}
        />
        <Select
          label="Purpose"
          name="purpose"
          options={purposeOptions}
          value={filters.purpose}
          onChange={(event) => updateFilter("purpose", event.target.value)}
        />
        <Select
          label="Sort"
          name="sort"
          options={sortOptions}
          value={filters.sort}
          onChange={(event) => updateFilter("sort", event.target.value)}
        />
        <div className="filter-actions">
          <Button type="submit" disabled={propertiesQuery.isFetching}>
            <Search size={16} />
            Search
          </Button>
          <Button type="button" variant="secondary" onClick={resetSearch}>
            Reset
          </Button>
        </div>
      </form>
      <div className="section-header property-results-header">
        <div>
          <p className="eyebrow">Results</p>
          <h2>
            {propertiesQuery.data
              ? `${propertiesQuery.data.totalElements.toLocaleString("vi-VN")} properties`
              : "Properties"}
          </h2>
        </div>
        <div className="sort-indicator">
          <ArrowUpDown size={16} />
          {sortOptions.find((option) => option.value === committedFilters.sort)?.label}
        </div>
      </div>
      {propertiesQuery.isLoading ? (
        <div className="property-card-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <article className="property-card property-card-skeleton" key={index} />
          ))}
        </div>
      ) : null}
      {normalizedError ? (
        <ErrorState
          status={normalizedError.status}
          message={normalizedError.message}
          onRetry={() => propertiesQuery.refetch()}
        />
      ) : null}
      {propertiesQuery.data && propertiesQuery.data.content.length === 0 ? (
        <div className="content-section">
          <EmptyState
            title="No properties found"
            description="Adjust filters or clear them to view more inventory."
            action={<Button onClick={resetSearch}>Clear filters</Button>}
          />
        </div>
      ) : null}
      {propertiesQuery.data && propertiesQuery.data.content.length > 0 ? (
        <>
          <div className="property-table-desktop">
            <Table>
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Status</th>
                  <th>Purpose</th>
                  <th>Price</th>
                  <th>Area</th>
                  <th>Rooms</th>
                  <th>Agent</th>
                  <th />
                </tr>
              </thead>
              {propertiesQuery.data.content.length ? (
                <tbody>
                  {propertiesQuery.data.content.map((property) => (
                    <tr key={property.id}>
                      <td>
                        <strong>{property.name}</strong>
                        <small>{property.code}</small>
                        <p className="muted">
                          <MapPin size={14} />
                          {property.address.fullAddress}
                        </p>
                      </td>
                      <td>
                        <StatusBadge tone={statusTone(property.status)}>
                          {labelStatus(property.status)}
                        </StatusBadge>
                      </td>
                      <td>{property.purpose ?? "Updating"}</td>
                      <td>{property.price ? formatCurrency(property.price, property.currency) : "Updating"}</td>
                      <td>{formatArea(property)}</td>
                      <td>
                        {property.bedrooms ?? "-"} bed / {property.bathrooms ?? "-"} bath
                      </td>
                      <td>{property.assignedAgent?.fullName ?? "Unassigned"}</td>
                      <td>
                        <Button asChild variant="secondary" size="sm">
                          <Link to={`/properties/${property.id}`}>View</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              ) : (
                <TableEmpty message="No properties found" />
              )}
            </Table>
          </div>
          <div className="property-card-grid property-card-mobile">
            {propertiesQuery.data.content.map((property) => (
              <PropertyMobileCard key={property.id} property={property} />
            ))}
          </div>
          <Pagination
            page={propertiesQuery.data.page}
            totalPages={propertiesQuery.data.totalPages}
            onPageChange={changePage}
          />
        </>
      ) : null}
    </section>
  );
}
