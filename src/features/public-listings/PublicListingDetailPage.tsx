import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  Camera,
  Heart,
  Home,
  Mail,
  MapPin,
  Phone,
  Ruler
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { normalizeUnknownError } from "../../shared/api/errors";
import { useAuth } from "../../shared/auth/useAuth";
import { Button } from "../../shared/ui/Button";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Input } from "../../shared/ui/Input";
import { Select } from "../../shared/ui/Select";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { formatCurrency } from "../../shared/lib/format";
import { toIsoDateTime } from "../appointments/appointmentTime";
import {
  addListingFavorite,
  createListingAppointmentRequest,
  createListingInquiry,
  getPublicListingImageUrl,
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

const emptyInquiryDraft = {
  email: "",
  fullName: "",
  message: "",
  phone: "",
  preferredContactMethod: "EMAIL"
};

const emptyAppointmentDraft = {
  email: "",
  fullName: "",
  message: "",
  phone: "",
  preferredEndAt: "",
  preferredStartAt: ""
};

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
  const { t } = useTranslation();
  const { slug } = useParams();
  const { isAuthenticated, user } = useAuth();
  const roles = user?.roles ?? [];
  const canFavorite = isAuthenticated && hasFavoriteAccess(roles);
  const [inquiryDraft, setInquiryDraft] = useState(emptyInquiryDraft);
  const [appointmentDraft, setAppointmentDraft] = useState(emptyAppointmentDraft);
  const [inquirySent, setInquirySent] = useState(false);
  const [appointmentSent, setAppointmentSent] = useState(false);
  const [activeContactTab, setActiveContactTab] = useState<"appointment" | "inquiry">("appointment");
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
  const listingImageUrl = listing ? getPublicListingImageUrl(listing) : null;
  const favoriteListings = favoritesQuery.data?.content;
  const isFavorite = useMemo(() => {
    if (!listing) {
      return false;
    }

    return listing.isFavorite || isListingInFavorites(favoriteListings, listing.id);
  }, [favoriteListings, listing]);
  const inquiryMutation = useMutation({
    mutationFn: (request: typeof inquiryDraft) => {
      if (!listing) {
        throw new Error("Missing listing");
      }

      return createListingInquiry(listing.id, {
        email: request.email,
        fullName: request.fullName,
        message: request.message,
        phone: request.phone || undefined,
        preferredContactMethod: request.preferredContactMethod
      });
    },
    onSuccess: () => {
      setInquiryDraft(emptyInquiryDraft);
      setInquirySent(true);
    }
  });
  const appointmentMutation = useMutation({
    mutationFn: (request: typeof appointmentDraft) => {
      if (!listing) {
        throw new Error("Missing listing");
      }

      return createListingAppointmentRequest(listing.id, {
        email: request.email,
        fullName: request.fullName,
        message: request.message || undefined,
        phone: request.phone || undefined,
        preferredEndAt: toIsoDateTime(request.preferredEndAt) || undefined,
        preferredStartAt: toIsoDateTime(request.preferredStartAt)
      });
    },
    onSuccess: () => {
      setAppointmentDraft(emptyAppointmentDraft);
      setAppointmentSent(true);
    }
  });
  const inquiryError = inquiryMutation.error ? normalizeUnknownError(inquiryMutation.error) : null;
  const appointmentError = appointmentMutation.error ? normalizeUnknownError(appointmentMutation.error) : null;
  const contactMethodOptions = useMemo(
    () => [
      { label: t("common.email"), value: "EMAIL" },
      { label: t("common.phone"), value: "PHONE" },
      { label: t("common.any"), value: "ANY" }
    ],
    [t]
  );

  function updateInquiryDraft(field: keyof typeof inquiryDraft, value: string) {
    setInquiryDraft((current) => ({ ...current, [field]: value }));
    setInquirySent(false);
  }

  function updateAppointmentDraft(field: keyof typeof appointmentDraft, value: string) {
    setAppointmentDraft((current) => ({ ...current, [field]: value }));
    setAppointmentSent(false);
  }

  function submitInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    inquiryMutation.mutate(inquiryDraft);
  }

  function submitAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    appointmentMutation.mutate(appointmentDraft);
  }

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
          Back to home
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
          <div className="detail-grid">
            <div className="detail-main-column">
              <div className="public-listing-hero-image">
                {listingImageUrl ? (
                  <img src={listingImageUrl} alt={listing.images[0]?.alt ?? listing.title} />
                ) : (
                  <div>
                    <Camera size={38} />
                    <span>No images</span>
                  </div>
                )}
              </div>
              <section className="content-section detail-main-section">
                <div className="detail-price-row">
                  <div>
                    <p className="eyebrow">Price</p>
                    <h2>
                      {listing.price
                        ? formatCurrency(listing.price, listing.currency)
                        : "Price updating"}
                    </h2>
                  </div>
                </div>
                <div className="listing-key-facts">
                  <span>
                    <Ruler size={18} />
                    <strong>{formatArea(listing.area)}</strong>
                    <small>Area</small>
                  </span>
                  <span>
                    <BedDouble size={18} />
                    <strong>{listing.bedrooms ?? "-"}</strong>
                    <small>Bedrooms</small>
                  </span>
                  <span>
                    <Bath size={18} />
                    <strong>{listing.bathrooms ?? "-"}</strong>
                    <small>Bathrooms</small>
                  </span>
                  <span>
                    <Building2 size={18} />
                    <strong>{listing.purpose === "RENT" ? "Lease" : "Sale"}</strong>
                    <small>Purpose</small>
                  </span>
                </div>
                <div className="detail-description">
                  <h2>Description</h2>
                  <p>{listing.description}</p>
                </div>
                <div className="detail-amenities">
                  <h2>Amenities</h2>
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
            </div>
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
              <div className="listing-contact-tabs" role="tablist" aria-label="Listing contact forms">
                <button
                  type="button"
                  className={activeContactTab === "appointment" ? "is-active" : ""}
                  onClick={() => setActiveContactTab("appointment")}
                >
                  <CalendarDays size={16} />
                  Request viewing
                </button>
                <button
                  type="button"
                  className={activeContactTab === "inquiry" ? "is-active" : ""}
                  onClick={() => setActiveContactTab("inquiry")}
                >
                  <Mail size={16} />
                  Send question
                </button>
              </div>
              {activeContactTab === "inquiry" ? (
                <form className="listing-contact-form" onSubmit={submitInquiry}>
                  <Input
                    label={t("common.fullName")}
                    value={inquiryDraft.fullName}
                    onChange={(event) => updateInquiryDraft("fullName", event.target.value)}
                    required
                  />
                  <Input
                    label={t("common.email")}
                    type="email"
                    value={inquiryDraft.email}
                    onChange={(event) => updateInquiryDraft("email", event.target.value)}
                    required
                  />
                  <Input
                    label={t("common.phone")}
                    value={inquiryDraft.phone}
                    onChange={(event) => updateInquiryDraft("phone", event.target.value)}
                  />
                  <Select
                    label={t("common.preferredContact")}
                    options={contactMethodOptions}
                    value={inquiryDraft.preferredContactMethod}
                    onChange={(event) => updateInquiryDraft("preferredContactMethod", event.target.value)}
                  />
                  <label className="field">
                    <span>Message</span>
                    <textarea
                      className="input textarea"
                      value={inquiryDraft.message}
                      onChange={(event) => updateInquiryDraft("message", event.target.value)}
                      required
                    />
                  </label>
                  {inquiryError ? <p className="form-alert">{inquiryError.message}</p> : null}
                  {inquirySent ? <p className="form-success">Inquiry sent.</p> : null}
                  <Button type="submit" disabled={inquiryMutation.isPending}>
                    Send inquiry
                  </Button>
                </form>
              ) : (
                <form className="listing-contact-form" onSubmit={submitAppointment}>
                  <Input
                    label={t("common.fullName")}
                    value={appointmentDraft.fullName}
                    onChange={(event) => updateAppointmentDraft("fullName", event.target.value)}
                    required
                  />
                  <Input
                    label={t("common.email")}
                    type="email"
                    value={appointmentDraft.email}
                    onChange={(event) => updateAppointmentDraft("email", event.target.value)}
                    required
                  />
                  <Input
                    label={t("common.phone")}
                    value={appointmentDraft.phone}
                    onChange={(event) => updateAppointmentDraft("phone", event.target.value)}
                  />
                  <Input
                    label="Preferred start"
                    type="datetime-local"
                    value={appointmentDraft.preferredStartAt}
                    onChange={(event) => updateAppointmentDraft("preferredStartAt", event.target.value)}
                    required
                  />
                  <Input
                    label="Preferred end"
                    type="datetime-local"
                    value={appointmentDraft.preferredEndAt}
                    onChange={(event) => updateAppointmentDraft("preferredEndAt", event.target.value)}
                  />
                  <label className="field">
                    <span>Notes</span>
                    <textarea
                      className="input textarea"
                      value={appointmentDraft.message}
                      onChange={(event) => updateAppointmentDraft("message", event.target.value)}
                    />
                  </label>
                  {appointmentError ? <p className="form-alert">{appointmentError.message}</p> : null}
                  {appointmentSent ? <p className="form-success">Appointment request sent.</p> : null}
                  <Button type="submit" disabled={appointmentMutation.isPending}>
                    Request viewing
                  </Button>
                </form>
              )}
            </aside>
          </div>
        </>
      ) : null}
    </section>
  );
}
