import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Bath, BedDouble, Heart, MapPin, Ruler } from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Pagination } from "../../shared/ui/Pagination";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { formatCurrency } from "../../shared/lib/format";
import { getFavoriteListings, type PublicListing } from "./publicListingApi";

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

function formatArea(area: number | null) {
  return area ? `${area.toLocaleString("vi-VN")} m2` : "Area updating";
}

function FavoriteListingRow({ listing }: { listing: PublicListing }) {
  return (
    <article className="favorite-listing-row">
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
      <div className="favorite-listing-side">
        <strong>
          {listing.price ? formatCurrency(listing.price, listing.currency) : "Price updating"}
        </strong>
        <Button asChild variant="secondary" size="sm">
          <Link to={`/listing/${listing.slug}`}>View detail</Link>
        </Button>
      </div>
    </article>
  );
}

export function FavoriteListingsPage() {
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
    <section>
      <div className="section-header">
        <div>
          <p className="eyebrow">Favorites</p>
          <h2>Saved listings</h2>
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
            title="Favorites could not be loaded"
            description={normalizedError.message}
            action={<Button onClick={() => favoritesQuery.refetch()}>Retry</Button>}
          />
        </div>
      ) : null}
      {favoritesQuery.data && favoritesQuery.data.content.length === 0 ? (
        <div className="content-section">
          <EmptyState
            title="No saved listings yet"
            description="Favorite published listings from the public detail page."
            action={
              <Button asChild>
                <Link to="/">Browse listings</Link>
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
