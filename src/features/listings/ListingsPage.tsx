import { useMemo, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { Eye, FilePlus2, Heart, Search } from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Input } from "../../shared/ui/Input";
import { Pagination } from "../../shared/ui/Pagination";
import { Select } from "../../shared/ui/Select";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { statusLabels } from "../../shared/constants/enumLabels";
import { formatCurrency } from "../../shared/lib/format";
import { useText } from "../../shared/i18n/useText";
import { searchListings, type ListingPurpose, type ListingSearchParams } from "./listingApi";

const PAGE_SIZE = 12;

const statusOptions = [
  { label: "All statuses", value: "" },
  { label: "Draft", value: "DRAFT" },
  { label: "Pending review", value: "PENDING_REVIEW" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Unpublished", value: "UNPUBLISHED" }
];

const purposeOptions = [
  { label: "All purposes", value: "" },
  { label: "Sale", value: "SALE" },
  { label: "Rent", value: "RENT" }
];

function labelStatus(status: string) {
  return statusLabels[status as keyof typeof statusLabels] ?? status;
}

function statusTone(status: string) {
  if (status === "PUBLISHED" || status === "APPROVED") {
    return "success";
  }

  if (status === "PENDING_REVIEW" || status === "DRAFT") {
    return "warning";
  }

  if (status === "REJECTED" || status === "UNPUBLISHED") {
    return "danger";
  }

  return "neutral";
}

function getInitialFilters(searchParams: URLSearchParams) {
  return {
    keyword: searchParams.get("keyword") ?? "",
    propertyId: searchParams.get("propertyId") ?? "",
    purpose: searchParams.get("purpose") ?? "",
    status: searchParams.get("status") ?? ""
  };
}

function toApiParams(filters: ReturnType<typeof getInitialFilters>, page: number): ListingSearchParams {
  return {
    keyword: filters.keyword,
    page,
    propertyId: filters.propertyId,
    purpose: filters.purpose as ListingPurpose | "",
    size: PAGE_SIZE,
    sortBy: "createdAt",
    sortDirection: "DESC",
    status: filters.status
  };
}

export function ListingsPage() {
  const tx = useText();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => getInitialFilters(searchParams));
  const committedFilters = useMemo(() => getInitialFilters(searchParams), [searchParams]);
  const currentPage = Number(searchParams.get("page") ?? 0) || 0;
  const apiParams = useMemo(
    () => toApiParams(committedFilters, currentPage),
    [committedFilters, currentPage]
  );
  const listingsQuery = useQuery({
    queryFn: () => searchListings(apiParams),
    queryKey: ["listings", apiParams],
    retry: 1
  });
  const normalizedError = listingsQuery.error ? normalizeUnknownError(listingsQuery.error) : null;
  const listings = listingsQuery.data?.content ?? [];

  function updateFilter(name: keyof typeof filters, value: string) {
    setFilters((current) => ({
      ...current,
      [name]: value
    }));
  }

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        nextParams.set(key, value);
      }
    });

    nextParams.set("page", "0");
    setSearchParams(nextParams);
  }

  function handlePageChange(page: number) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", String(page));
    setSearchParams(nextParams);
  }

  return (
    <section>
      <div className="section-header">
        <div>
          <p className="eyebrow">{tx("Listings")}</p>
          <h2>{tx("Internal listing workflow")}</h2>
        </div>
        <Button asChild>
          <Link to="/listings/new">
            <FilePlus2 size={16} />
            {tx("New listing")}
          </Link>
        </Button>
      </div>
      <form className="filter-bar listing-filter-bar" onSubmit={applyFilters}>
        <Input
          label={tx("Keyword")}
          value={filters.keyword}
          onChange={(event) => updateFilter("keyword", event.target.value)}
          placeholder={tx("Title, code, slug")}
        />
        <Select
          label={tx("Status")}
          value={filters.status}
          onChange={(event) => updateFilter("status", event.target.value)}
          options={statusOptions.map((option) => ({ ...option, label: tx(option.label) }))}
        />
        <Select
          label={tx("Purpose")}
          value={filters.purpose}
          onChange={(event) => updateFilter("purpose", event.target.value)}
          options={purposeOptions.map((option) => ({ ...option, label: tx(option.label) }))}
        />
        <Input
          label={tx("Property id")}
          value={filters.propertyId}
          onChange={(event) => updateFilter("propertyId", event.target.value)}
          placeholder={tx("Optional")}
        />
        <div className="filter-actions">
          <Button type="submit">
            <Search size={16} />
            {tx("Search")}
          </Button>
        </div>
      </form>
      {listingsQuery.isLoading ? (
        <section className="content-section">
          <EmptyState title={tx("Loading listings")} description={tx("Fetching internal listing workflow records.")} />
        </section>
      ) : null}
      {normalizedError ? (
        <section className="content-section">
          <EmptyState
            title={tx("Listings could not be loaded")}
            description={normalizedError.message}
            action={<Button onClick={() => listingsQuery.refetch()}>{tx("Retry")}</Button>}
          />
        </section>
      ) : null}
      {!listingsQuery.isLoading && !normalizedError ? (
        <>
          <div className="listing-workflow-list">
            {listings.length ? (
              listings.map((listing) => (
                <article className="listing-workflow-card" key={listing.id}>
                  <div>
                    <div className="detail-badges">
                      <StatusBadge tone={statusTone(listing.status)}>{labelStatus(listing.status)}</StatusBadge>
                      <StatusBadge tone="info">{listing.visibility}</StatusBadge>
                    </div>
                    <h3>{listing.title}</h3>
                    <p className="muted">
                      {listing.code} / {listing.property?.name ?? `Property #${listing.propertyId ?? "n/a"}`} / {listing.slug || "slug pending"}
                    </p>
                    <p className="muted">
                      {listing.creator?.fullName ? `${tx("Created by")} ${listing.creator.fullName}` : tx("Creator updating")}
                    </p>
                  </div>
                  <div className="listing-workflow-metrics">
                    <strong>
                      {listing.askingPrice ? formatCurrency(listing.askingPrice, listing.currency) : tx("Price updating")}
                    </strong>
                    <span>
                      <Eye size={15} />
                      {listing.viewCount ?? 0}
                    </span>
                    <span>
                      <Heart size={15} />
                      {listing.favoriteCount ?? 0}
                    </span>
                  </div>
                  <Button asChild variant="secondary" size="sm">
                    <Link to={`/listings/${listing.id}`}>{tx("View detail")}</Link>
                  </Button>
                </article>
              ))
            ) : (
              <div className="content-section">
                <EmptyState
                  title={tx("No listings found")}
                  description={tx("Create a draft listing or adjust filters to see internal workflow records.")}
                  action={
                    <Button asChild>
                      <Link to="/listings/new">{tx("Create listing")}</Link>
                    </Button>
                  }
                />
              </div>
            )}
          </div>
          <Pagination
            page={listingsQuery.data?.page ?? currentPage}
            totalPages={listingsQuery.data?.totalPages ?? 0}
            onPageChange={handlePageChange}
          />
        </>
      ) : null}
    </section>
  );
}
