import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Heart,
  Home,
  Mail,
  MapPin,
  Phone,
  Ruler
} from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { useAuth } from "../../shared/auth/useAuth";
import { Button } from "../../shared/ui/Button";
import { EmptyState } from "../../shared/ui/EmptyState";
import { ImageGallery } from "../../shared/ui/ImageGallery";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { formatCurrency } from "../../shared/lib/format";
import {
  addListingFavorite,
  getFavoriteListings,
  getPublicListingDetail,
  removeListingFavorite,
  type PublicListingDetail
} from "./publicListingApi";

const favoriteRoles = ["ADMIN", "MANAGER", "AGENT", "CUSTOMER"];

function hasFavoriteAccess(roles: string[]) {
  return roles.some((role) => favoriteRoles.includes(role));
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

function isListingInFavorites(favoriteListings: { id: number | string }[] | undefined, listingId: number | string) {
  return favoriteListings?.some((listing) => String(listing.id) === String(listingId)) ?? false;
}

function FavoriteButton({
  isFavorite,
  listing
}: {
  isFavorite: boolean;
  listing: PublicListingDetail;
}) {
  const queryClient = useQueryClient();
  const [optimisticFavorite, setOptimisticFavorite] = useState(isFavorite);
  const favoriteMutation = useMutation({
    mutationFn: () =>
      optimisticFavorite
        ? removeListingFavorite(listing.id)
        : addListingFavorite(listing.id),
    onMutate: () => {
      setOptimisticFavorite((current) => !current);
    },
    onError: () => {
      setOptimisticFavorite((current) => !current);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["favorite-listings"] });
      void queryClient.invalidateQueries({ queryKey: ["public-listing-detail", listing.slug] });
    }
  });

  useEffect(() => {
    setOptimisticFavorite(isFavorite);
  }, [isFavorite]);

  return (
    <Button
      variant={optimisticFavorite ? "primary" : "secondary"}
      onClick={() => favoriteMutation.mutate()}
      disabled={favoriteMutation.isPending}
    >
      <Heart size={17} />
      {optimisticFavorite ? "Saved" : "Favorite"}
    </Button>
  );
}

export function PublicListingDetailPage() {
  const { slug } = useParams();
  const { isAuthenticated, user } = useAuth();
  const roles = user?.roles ?? [];
  const canFavorite = isAuthenticated && hasFavoriteAccess(roles);
  const listingQuery = useQuery({
    enabled: Boolean(slug),
    queryFn: () => getPublicListingDetail(slug ?? ""),
    queryKey: ["public-listing-detail", slug],
    retry: 1
  });
  const favoritesQuery = useQuery({
    enabled: canFavorite,
    queryFn: () => getFavoriteListings({ page: 0, size: 100 }),
    queryKey: ["favorite-listings"],
    retry: 1
  });
  const normalizedError = listingQuery.error
    ? normalizeUnknownError(listingQuery.error)
    : null;
  const listing = listingQuery.data;
  const favoriteListings = favoritesQuery.data?.content;
  const isFavorite = useMemo(() => {
    if (!listing) {
      return false;
    }

    return listing.isFavorite || isListingInFavorites(favoriteListings, listing.id);
  }, [favoriteListings, listing]);

  if (!slug) {
    return (
      <section className="detail-page">
        <EmptyState
          title="Listing not found"
          description="The listing URL is missing a slug."
        />
      </section>
    );
  }

  return (
    <section className="detail-page">
      <Button asChild variant="ghost" size="sm">
        <Link to="/">
          <ArrowLeft size={16} />
          Back to search
        </Link>
      </Button>
      {listingQuery.isLoading ? (
        <div className="detail-skeleton">
          <div />
          <div />
          <div />
        </div>
      ) : null}
      {normalizedError ? (
        <div className="content-section">
          <EmptyState
            title="Listing could not be loaded"
            description={normalizedError.message}
            action={<Button onClick={() => listingQuery.refetch()}>Retry</Button>}
          />
        </div>
      ) : null}
      {listing ? (
        <>
          <div className="detail-header">
            <div>
              <div className="detail-badges">
                <StatusBadge tone={statusTone(listing.status)}>{listing.status}</StatusBadge>
                {listing.purpose ? (
                  <StatusBadge tone="info">
                    {listing.purpose === "SALE" ? "For sale" : "For rent"}
                  </StatusBadge>
                ) : null}
              </div>
              <h1>{listing.title}</h1>
              <p className="muted">
                <MapPin size={16} />
                {listing.address}
              </p>
            </div>
            {canFavorite ? <FavoriteButton isFavorite={isFavorite} listing={listing} /> : null}
          </div>
          <ImageGallery images={listing.images} />
          <div className="detail-grid">
            <section className="content-section detail-main-section">
              <h2>
                {listing.price
                  ? formatCurrency(listing.price, listing.currency)
                  : "Price updating"}
              </h2>
              <div className="listing-meta large">
                <span>
                  <Ruler size={16} />
                  {formatArea(listing.area)}
                </span>
                <span>
                  <BedDouble size={16} />
                  {listing.bedrooms ?? "-"} bedrooms
                </span>
                <span>
                  <Bath size={16} />
                  {listing.bathrooms ?? "-"} bathrooms
                </span>
              </div>
              <div className="detail-description">
                <p className="eyebrow">Description</p>
                <p>{listing.description}</p>
              </div>
              <div className="detail-amenities">
                <p className="eyebrow">Amenities</p>
                {listing.amenities.length ? (
                  <div className="amenity-grid">
                    {listing.amenities.map((amenity) => (
                      <span key={amenity.id}>
                        <Home size={15} />
                        {amenity.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="muted">Amenities are being updated.</p>
                )}
              </div>
            </section>
            <aside className="content-section contact-card">
              <p className="eyebrow">Contact</p>
              <h3>{listing.agent?.fullName ?? "Assigned agent"}</h3>
              <p className="muted">
                Talk to the listing owner or agent for viewing availability and
                negotiation details.
              </p>
              <div className="contact-actions">
                {listing.agent?.phone ? (
                  <Button asChild variant="secondary">
                    <a href={`tel:${listing.agent.phone}`}>
                      <Phone size={16} />
                      Call
                    </a>
                  </Button>
                ) : null}
                {listing.agent?.email ? (
                  <Button asChild>
                    <a href={`mailto:${listing.agent.email}`}>
                      <Mail size={16} />
                      Email
                    </a>
                  </Button>
                ) : (
                  <Button disabled>
                    <Mail size={16} />
                    Email unavailable
                  </Button>
                )}
              </div>
              {!isAuthenticated ? (
                <Button asChild variant="ghost">
                  <Link to="/login">Login to save this listing</Link>
                </Button>
              ) : null}
            </aside>
          </div>
        </>
      ) : null}
    </section>
  );
}
