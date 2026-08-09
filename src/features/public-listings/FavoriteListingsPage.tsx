import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, Bath, BedDouble, Heart, MapPin, Ruler, Search } from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Pagination } from "../../shared/ui/Pagination";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { formatCurrency } from "../../shared/lib/format";
import { useText } from "../../shared/i18n/useText";
import { getFavoriteListings, getPublicListingImageUrl, type PublicListing } from "./publicListingApi";

const pageSize = 10;

function statusTone(status: string) {
  if (status === "PUBLISHED" || status === "AVAILABLE") {
    return "success";
  }

  if (status === "SOLD" || status === "RENTED") {
    return "warning";
  }

  return "neutral";
}

function formatArea(area: number | null, tx: (text: string) => string) {
  return area ? `${area.toLocaleString("vi-VN")} m2` : tx("Area updating");
}

function FavoriteListingRow({ listing }: { listing: PublicListing }) {
  const tx = useText();
  const imageUrl = getPublicListingImageUrl(listing);

  return (
    <article className="favorite-listing-row">
      <div
        className="favorite-listing-image"
        style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
      >
        {!imageUrl ? <Heart size={18} /> : null}
      </div>
      <div>
        <StatusBadge tone={statusTone(listing.status)}>{listing.status}</StatusBadge>
        <h3>{listing.title}</h3>
        <p className="muted">
          <MapPin size={15} />
          {listing.address}
        </p>
        <div className="listing-meta">
          <span>
            <Ruler size={15} />
            {formatArea(listing.area, tx)}
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
      <div className="favorite-listing-side">
        <strong>
          {listing.price ? formatCurrency(listing.price, listing.currency) : tx("Price updating")}
        </strong>
        <Button asChild variant="secondary" size="sm">
          <Link to={`/listing/${listing.slug}`}>
            {tx("View detail")}
            <ArrowRight size={15} />
          </Link>
        </Button>
      </div>
    </article>
  );
}

export function FavoriteListingsPage() {
  const tx = useText();
  const [page, setPage] = useState(0);
  const favoritesQuery = useQuery({
    queryFn: () => getFavoriteListings({ page, size: pageSize }),
    queryKey: ["favorite-listings", page],
    retry: 1
  });
  const normalizedError = favoritesQuery.error
    ? normalizeUnknownError(favoritesQuery.error)
    : null;

  return (
    <section className="favorite-shortlist-page">
      <div className="favorite-shortlist-header">
        <div>
          <p className="eyebrow">{tx("Saved shortlist")}</p>
          <h2>{tx("Homes you are reviewing")}</h2>
          <p className="muted">
            {tx("Keep your best options in one focused shortlist before requesting a viewing.")}
          </p>
        </div>
        <div className="favorite-shortlist-actions">
          <Button asChild>
            <Link to="/search">
              <Search size={16} />
              {tx("Browse listings")}
            </Link>
          </Button>
        </div>
      </div>
      {favoritesQuery.isLoading ? (
        <div className="favorite-list">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="favorite-listing-row listing-card-skeleton" key={index} />
          ))}
        </div>
      ) : null}
      {normalizedError ? (
        <div className="content-section">
          <EmptyState
            title={tx("Favorites could not be loaded")}
            description={normalizedError.message}
            action={<Button onClick={() => favoritesQuery.refetch()}>{tx("Retry")}</Button>}
          />
        </div>
      ) : null}
      {favoritesQuery.data && favoritesQuery.data.content.length === 0 ? (
        <div className="content-section">
          <EmptyState
            title={tx("No saved listings yet")}
            description={tx("Start by saving listings that match your budget and preferred locations.")}
            action={
              <Button asChild>
                  <Link to="/search">{tx("Browse listings")}</Link>
              </Button>
            }
          />
        </div>
      ) : null}
      {favoritesQuery.data && favoritesQuery.data.content.length > 0 ? (
        <>
          <div className="favorite-list">
            {favoritesQuery.data.content.map((listing) => (
              <FavoriteListingRow listing={listing} key={listing.id} />
            ))}
          </div>
          <Pagination
            page={favoritesQuery.data.page}
            totalPages={favoritesQuery.data.totalPages}
            onPageChange={setPage}
          />
        </>
      ) : null}
    </section>
  );
}
