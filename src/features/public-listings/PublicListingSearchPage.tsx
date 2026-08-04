import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowUpDown,
  Bath,
  BedDouble,
  Home,
  MapPin,
  Ruler,
  Search
} from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Input } from "../../shared/ui/Input";
import { Pagination } from "../../shared/ui/Pagination";
import { Select } from "../../shared/ui/Select";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { formatCurrency } from "../../shared/lib/format";
import { useText } from "../../shared/i18n/useText";
import {
  searchPublicListings,
  getPublicListingImageUrl,
  type ListingPurpose,
  type PublicListing,
  type PublicListingSearchParams
} from "./publicListingApi";

const pageSize = 8;

const purposeOptions = [
  { label: "Any purpose", value: "" },
  { label: "For sale", value: "SALE" },
  { label: "For rent", value: "RENT" }
];

const roomOptions = [
  { label: "Any", value: "" },
  { label: "1+", value: "1" },
  { label: "2+", value: "2" },
  { label: "3+", value: "3" },
  { label: "4+", value: "4" }
];

const sortOptions = [
  { label: "Newest", value: "publishedAt:DESC" },
  { label: "Price low to high", value: "askingPrice:ASC" },
  { label: "Price high to low", value: "askingPrice:DESC" },
  { label: "Area largest first", value: "floorArea:DESC" }
];

type SearchFormState = {
  areaMax: string;
  areaMin: string;
  bathrooms: string;
  bedrooms: string;
  keyword: string;
  priceMax: string;
  priceMin: string;
  purpose: "" | ListingPurpose;
  sort: string;
};

function getParam(searchParams: URLSearchParams, key: keyof SearchFormState) {
  return searchParams.get(key) ?? "";
}

function getInitialFormState(searchParams: URLSearchParams): SearchFormState {
  return {
    areaMax: getParam(searchParams, "areaMax"),
    areaMin: getParam(searchParams, "areaMin"),
    bathrooms: getParam(searchParams, "bathrooms"),
    bedrooms: getParam(searchParams, "bedrooms"),
    keyword: getParam(searchParams, "keyword"),
    priceMax: getParam(searchParams, "priceMax"),
    priceMin: getParam(searchParams, "priceMin"),
    purpose: getParam(searchParams, "purpose") as "" | ListingPurpose,
    sort: getParam(searchParams, "sort") || sortOptions[0].value
  };
}

function buildSearchParams(formState: SearchFormState, page: number) {
  const params = new URLSearchParams();

  Object.entries(formState).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  if (page > 0) {
    params.set("page", String(page));
  }

  return params;
}

function toApiParams(
  formState: SearchFormState,
  page: number
): PublicListingSearchParams {
  const [sortBy, sortDirection] = formState.sort.split(":") as [
    string,
    "ASC" | "DESC"
  ];

  return {
    areaMax: formState.areaMax,
    areaMin: formState.areaMin,
    bathrooms: formState.bathrooms,
    bedrooms: formState.bedrooms,
    keyword: formState.keyword,
    page,
    priceMax: formState.priceMax,
    priceMin: formState.priceMin,
    purpose: formState.purpose,
    size: pageSize,
    sortBy,
    sortDirection
  };
}

function statusTone(status: string) {
  if (status === "PUBLISHED" || status === "AVAILABLE") {
    return "success";
  }

  if (status === "SOLD" || status === "RENTED") {
    return "warning";
  }

  return "neutral";
}

function formatArea(area: number | null) {
  return area ? `${area.toLocaleString("vi-VN")} m2` : "Area updating";
}

function ListingImage({ listing }: { listing: PublicListing }) {
  const imageUrl = getPublicListingImageUrl(listing);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={listing.title}
        loading="lazy"
        onError={(event) => {
          event.currentTarget.hidden = true;
        }}
      />
    );
  }

  return (
    <div className="listing-image-fallback">
      <Home size={34} />
    </div>
  );
}

function ListingCard({ listing }: { listing: PublicListing }) {
  const tx = useText();

  return (
    <article className="listing-card">
      <Link to={`/listing/${listing.slug}`} className="listing-card-link">
        <div className="listing-image">
          <ListingImage listing={listing} />
        </div>
        <div className="listing-body">
          <div className="listing-card-topline">
            <StatusBadge tone={statusTone(listing.status)}>{tx(listing.status)}</StatusBadge>
            {listing.purpose ? <span>{listing.purpose === "SALE" ? tx("Sale") : tx("Rent")}</span> : null}
          </div>
          <h3>{listing.title}</h3>
          <p className="muted">
            <MapPin size={15} />
            {listing.address}
          </p>
          <strong>
            {listing.price
              ? formatCurrency(listing.price, listing.currency)
              : tx("Price updating")}
          </strong>
          <div className="listing-meta">
            <span>
              <Ruler size={15} />
              {formatArea(listing.area)}
            </span>
            <span>
              <BedDouble size={15} />
              {listing.bedrooms ?? "-"}
            </span>
            <span>
              <Bath size={15} />
              {listing.bathrooms ?? "-"}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export function PublicListingSearchPage() {
  const tx = useText();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page") ?? 0) || 0;
  const committedFormState = useMemo(
    () => getInitialFormState(searchParams),
    [searchParams]
  );
  const [formState, setFormState] = useState<SearchFormState>(committedFormState);
  const apiParams = useMemo(
    () => toApiParams(committedFormState, currentPage),
    [committedFormState, currentPage]
  );
  const listingsQuery = useQuery({
    queryFn: () => searchPublicListings(apiParams),
    queryKey: ["public-listings", apiParams],
    retry: 1
  });
  const normalizedError = listingsQuery.error
    ? normalizeUnknownError(listingsQuery.error)
    : null;

  useEffect(() => {
    setFormState(committedFormState);
  }, [committedFormState]);

  function updateFormField(field: keyof SearchFormState, value: string) {
    setFormState((current) => ({
      ...current,
      [field]: value
    }));
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchParams(buildSearchParams(formState, 0));
  }

  function resetSearch() {
    const resetState = getInitialFormState(new URLSearchParams());
    setFormState(resetState);
    setSearchParams(buildSearchParams(resetState, 0));
  }

  function changePage(page: number) {
    setSearchParams(buildSearchParams(committedFormState, page));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <section className="public-search">
      <div className="search-hero">
        <p className="eyebrow">{tx("Published listings")}</p>
        <h1>{tx("Find market-ready homes with the details that matter first.")}</h1>
        <p>
          {tx("Search published inventory by need, budget, size, and room count before opening the full listing.")}
        </p>
      </div>
      <form className="filter-bar listing-filter-bar" onSubmit={submitSearch}>
        <Input
          label={tx("Keyword")}
          name="keyword"
          placeholder={tx("Search by title, code, or location")}
          value={formState.keyword}
          onChange={(event) => updateFormField("keyword", event.target.value)}
        />
        <Select
          label={tx("Purpose")}
          name="purpose"
          options={purposeOptions.map((option) => ({ ...option, label: tx(option.label) }))}
          value={formState.purpose}
          onChange={(event) => updateFormField("purpose", event.target.value)}
        />
        <Input
          label={tx("Min price")}
          name="priceMin"
          type="number"
          min="0"
          placeholder="0"
          value={formState.priceMin}
          onChange={(event) => updateFormField("priceMin", event.target.value)}
        />
        <Input
          label={tx("Max price")}
          name="priceMax"
          type="number"
          min="0"
          placeholder="5000000000"
          value={formState.priceMax}
          onChange={(event) => updateFormField("priceMax", event.target.value)}
        />
        <Input
          label={tx("Min area")}
          name="areaMin"
          type="number"
          min="0"
          placeholder="50"
          value={formState.areaMin}
          onChange={(event) => updateFormField("areaMin", event.target.value)}
        />
        <Input
          label={tx("Max area")}
          name="areaMax"
          type="number"
          min="0"
          placeholder="150"
          value={formState.areaMax}
          onChange={(event) => updateFormField("areaMax", event.target.value)}
        />
        <Select
          label={tx("Bedrooms")}
          name="bedrooms"
          options={roomOptions.map((option) => ({ ...option, label: tx(option.label) }))}
          value={formState.bedrooms}
          onChange={(event) => updateFormField("bedrooms", event.target.value)}
        />
        <Select
          label={tx("Bathrooms")}
          name="bathrooms"
          options={roomOptions.map((option) => ({ ...option, label: tx(option.label) }))}
          value={formState.bathrooms}
          onChange={(event) => updateFormField("bathrooms", event.target.value)}
        />
        <Select
          label={tx("Sort")}
          name="sort"
          options={sortOptions.map((option) => ({ ...option, label: tx(option.label) }))}
          value={formState.sort}
          onChange={(event) => updateFormField("sort", event.target.value)}
        />
        <div className="filter-actions">
          <Button type="submit" disabled={listingsQuery.isFetching}>
            <Search size={16} />
            {tx("Search")}
          </Button>
          <Button type="button" variant="secondary" onClick={resetSearch}>
            {tx("Reset")}
          </Button>
        </div>
      </form>
      <div className="section-header listing-results-header">
        <div>
          <p className="eyebrow">{tx("Search results")}</p>
          <h2>
            {listingsQuery.data
              ? `${listingsQuery.data.totalElements.toLocaleString("vi-VN")} ${tx("Published listings").toLowerCase()}`
              : tx("Published listings")}
          </h2>
        </div>
        <div className="sort-indicator">
          <ArrowUpDown size={16} />
          {tx(sortOptions.find((option) => option.value === committedFormState.sort)?.label ?? "")}
        </div>
      </div>
      {listingsQuery.isLoading ? (
        <div className="listing-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="listing-card listing-card-skeleton" key={index} />
          ))}
        </div>
      ) : null}
      {normalizedError ? (
        <div className="content-section">
          <EmptyState
            title={tx("Listings could not be loaded")}
            description={normalizedError.message}
            action={
              <Button onClick={() => listingsQuery.refetch()}>
                {tx("Retry")}
              </Button>
            }
          />
        </div>
      ) : null}
      {listingsQuery.data && listingsQuery.data.content.length === 0 ? (
        <div className="content-section">
          <EmptyState
            title={tx("No published listings found")}
            description={tx("Adjust filters and search again.")}
            action={<Button onClick={resetSearch}>{tx("Clear filters")}</Button>}
          />
        </div>
      ) : null}
      {listingsQuery.data && listingsQuery.data.content.length > 0 ? (
        <>
          <div className="listing-grid">
            {listingsQuery.data.content.map((listing) => (
              <ListingCard listing={listing} key={listing.id} />
            ))}
          </div>
          <Pagination
            page={listingsQuery.data.page}
            totalPages={listingsQuery.data.totalPages}
            onPageChange={changePage}
          />
        </>
      ) : null}
    </section>
  );
}
