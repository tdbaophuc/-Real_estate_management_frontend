import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, type FormEvent } from "react";
import { BedDouble, Building2, ChevronDown, MapPin, Ruler, Search } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { EmptyState } from "../../shared/ui/EmptyState";
import { formatCurrency } from "../../shared/lib/format";
import {
  getPublicListingImageUrl,
  searchPublicListings,
  type ListingPurpose,
  type PublicListing
} from "./publicListingApi";

const heroFallbackImage =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1800&q=85";

const propertyTypeOptions = [
  { label: "All property types", value: "" },
  { label: "Villa", value: "villa" },
  { label: "Apartment", value: "apartment" },
  { label: "Office", value: "office" }
];

function formatArea(area: number | null) {
  return area && area > 0 ? `${area.toLocaleString("vi-VN")} m2` : "Area updating";
}

function formatListingPurpose(listing: PublicListing) {
  if (listing.propertyTypeName && listing.propertyTypeName !== "Property") {
    return listing.propertyTypeName;
  }

  if (listing.purpose === "RENT") {
    return "For rent";
  }

  if (listing.purpose === "SALE") {
    return "For sale";
  }

  return "Property";
}

function formatRoomInfo(listing: PublicListing) {
  if (listing.bedrooms && listing.bedrooms > 0) {
    return `${listing.bedrooms} beds`;
  }

  if (listing.bathrooms && listing.bathrooms > 0) {
    return `${listing.bathrooms} baths`;
  }

  return "Rooms updating";
}

function ListingImage({ listing }: { listing: PublicListing }) {
  const imageUrl = getPublicListingImageUrl(listing);

  if (imageUrl) {
    return <img src={imageUrl} alt={listing.title} loading="lazy" />;
  }

  return (
    <div className="landing-listing-image-placeholder">
      <Building2 size={30} />
    </div>
  );
}

export function LandingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialLocation = searchParams.get("keyword") ?? "";
  const initialPurpose = (searchParams.get("purpose") ?? "") as "" | ListingPurpose;
  const [location, setLocation] = useState(initialLocation);
  const [propertyType, setPropertyType] = useState("");
  const [purpose, setPurpose] = useState<"" | ListingPurpose>(initialPurpose);
  const [appliedSearch, setAppliedSearch] = useState({
    keyword: initialLocation,
    purpose: initialPurpose
  });
  const listingsQuery = useQuery({
    queryFn: () =>
      searchPublicListings({
        keyword: appliedSearch.keyword,
        page: 0,
        size: 6,
        sortBy: "publishedAt",
        direction: "DESC",
        purpose: appliedSearch.purpose
      }),
    queryKey: ["public-landing-listings", appliedSearch],
    retry: 1
  });
  const listings = listingsQuery.data?.content ?? [];
  const normalizedError = listingsQuery.error ? normalizeUnknownError(listingsQuery.error) : null;
  const hasActiveSearch = Boolean(appliedSearch.keyword || appliedSearch.purpose);
  const searchParamsForUrl = useMemo(() => {
    const params = new URLSearchParams();
    const keyword = [location, propertyType].filter(Boolean).join(" ");

    if (keyword) {
      params.set("keyword", keyword);
    }

    if (purpose) {
      params.set("purpose", purpose);
    }

    return params;
  }, [location, propertyType, purpose]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const keyword = searchParamsForUrl.get("keyword") ?? "";
    const nextPurpose = (searchParamsForUrl.get("purpose") ?? "") as "" | ListingPurpose;

    setAppliedSearch({
      keyword,
      purpose: nextPurpose
    });
    setSearchParams(searchParamsForUrl, { replace: true });
  }

  return (
    <div className="landing-page">
      <section className="landing-hero">
        <div className="landing-hero-media">
          <img src={heroFallbackImage} alt="Modern commercial building exterior" />
        </div>
        <div className="landing-hero-content">
          <p className="eyebrow">Real estate marketplace</p>
          <h1>Find Your Next Property Opportunity</h1>
          <p>
            Explore verified residential and commercial listings with current pricing, location, and viewing availability.
          </p>
          <form className="landing-search-card" onSubmit={submitSearch}>
            <label>
              <span>Location</span>
              <div>
                <select value={location} onChange={(event) => setLocation(event.target.value)}>
                  <option value="">Any location</option>
                  <option value="Ho Chi Minh">Ho Chi Minh</option>
                  <option value="Ha Noi">Ha Noi</option>
                  <option value="Da Nang">Da Nang</option>
                </select>
                <ChevronDown size={16} />
              </div>
            </label>
            <label>
              <span>Property Type</span>
              <div>
                <select value={propertyType} onChange={(event) => setPropertyType(event.target.value)}>
                  {propertyTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} />
              </div>
            </label>
            <label>
              <span>Purpose</span>
              <div>
                <select value={purpose} onChange={(event) => setPurpose(event.target.value as "" | ListingPurpose)}>
                  <option value="">Any purpose</option>
                  <option value="SALE">For sale</option>
                  <option value="RENT">For rent</option>
                </select>
                <ChevronDown size={16} />
              </div>
            </label>
            <Button type="submit">
              <Search size={17} />
              Search
            </Button>
          </form>
        </div>
      </section>

      <section className="landing-trust-bar" aria-label="Marketplace metrics">
        <article>
          <strong>142+</strong>
          <span>Active assets</span>
        </article>
        <article>
          <strong>$4.2B</strong>
          <span>Managed portfolio</span>
        </article>
        <article>
          <strong>15+</strong>
          <span>Countries</span>
        </article>
      </section>

      <section className="landing-featured">
        <div className="section-header">
          <div>
            <p className="eyebrow">Featured opportunities</p>
            <h2>{hasActiveSearch ? "Search results" : "Latest published listings"}</h2>
          </div>
          <Button asChild variant="secondary">
            <Link to="/search">View all</Link>
          </Button>
        </div>
        {listingsQuery.isLoading ? (
          <div className="landing-listing-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <article className="landing-listing-card landing-listing-skeleton" key={index} />
            ))}
          </div>
        ) : null}
        {normalizedError ? (
          <EmptyState
            title="Listings could not be loaded"
            description={normalizedError.message}
            action={<Button onClick={() => listingsQuery.refetch()}>Retry</Button>}
          />
        ) : null}
        {!listingsQuery.isLoading && !normalizedError ? (
          <div className="landing-listing-grid">
            {listings.map((listing) => (
              <Link className="landing-listing-card" to={`/listing/${listing.slug}`} key={listing.id}>
                <div className="landing-listing-image">
                  <ListingImage listing={listing} />
                  <span className="landing-listing-badge">New Listing</span>
                </div>
                <div className="landing-listing-body">
                  <div className="landing-listing-title-row">
                    <strong>{listing.title}</strong>
                    <b>{listing.price ? formatCurrency(listing.price, listing.currency) : "-"}</b>
                  </div>
                  <small>
                    <MapPin size={14} />
                    {listing.address}
                  </small>
                  <footer>
                    <span>
                      <Building2 size={14} />
                      {formatListingPurpose(listing)}
                    </span>
                    <span>
                      <Ruler size={14} />
                      {formatArea(listing.area)}
                    </span>
                    <span>
                      <BedDouble size={14} />
                      {formatRoomInfo(listing)}
                    </span>
                  </footer>
                </div>
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      <footer className="landing-footer">
        <div>
          <Link className="brand" to="/">
            <span className="brand-mark">
              <Building2 size={20} />
            </span>
            <span>RealEstate Pro</span>
          </Link>
          <p>Verified property opportunities for buyers, tenants, and investment teams.</p>
        </div>
        <div>
          <strong>Services</strong>
          <Link to="/search">Residential search</Link>
          <Link to="/search">Commercial leasing</Link>
          <Link to="/search">Investment listings</Link>
        </div>
        <div>
          <strong>Company</strong>
          <Link to="/login">Agent portal</Link>
          <Link to="/search">Market inventory</Link>
          <Link to="/register">Create account</Link>
        </div>
        <div>
          <strong>Contact</strong>
          <span>contact@realestatepro.local</span>
          <span>+84 28 0000 0000</span>
          <span>Ho Chi Minh City</span>
        </div>
      </footer>
    </div>
  );
}
