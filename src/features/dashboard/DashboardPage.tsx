import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Bot,
  CalendarDays,
  CheckCircle2,
  Heart,
  Home,
  LayoutDashboard,
  MapPin,
  Search,
  Users
} from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { useAuth } from "../../shared/auth/useAuth";
import { Button } from "../../shared/ui/Button";
import { EmptyState } from "../../shared/ui/EmptyState";
import { useText } from "../../shared/i18n/useText";
import { formatCurrency } from "../../shared/lib/format";
import { getUnreadNotificationCount } from "../notifications/notificationApi";
import {
  getFavoriteListings,
  searchPublicListings,
  type PublicListing
} from "../public-listings/publicListingApi";
import { getRoleDashboard, type DashboardRole } from "./dashboardApi";

const rolePriority: DashboardRole[] = ["ADMIN", "MANAGER", "AGENT"];

const metricIcons = [Users, Home, LayoutDashboard, BarChart3, CalendarDays, Heart];

function getDashboardRole(roles: string[]) {
  return rolePriority.find((role) => roles.includes(role)) ?? null;
}

function DashboardSkeleton() {
  return (
    <div className="metric-grid">
      {Array.from({ length: 4 }).map((_, index) => (
        <article className="metric-card dashboard-skeleton-card" key={index} />
      ))}
    </div>
  );
}

function CustomerListingPreview({ listing }: { listing: PublicListing }) {
  const tx = useText();

  return (
    <Link className="customer-listing-preview" to={`/listing/${listing.slug}`}>
      <div
        className="customer-listing-media"
        style={listing.coverImageUrl ? { backgroundImage: `url(${listing.coverImageUrl})` } : undefined}
      >
        {!listing.coverImageUrl ? <Home size={18} /> : null}
      </div>
      <span>
        <strong>{listing.title}</strong>
        <small>
          <MapPin size={14} />
          {listing.address}
        </small>
      </span>
      <b>{listing.price ? formatCurrency(listing.price, listing.currency) : tx("Price updating")}</b>
    </Link>
  );
}

function CustomerDashboard() {
  const tx = useText();
  const favoritesQuery = useQuery({
    queryFn: () => getFavoriteListings({ page: 0, size: 3 }),
    queryKey: ["favorite-listings", "dashboard"],
    retry: 1
  });
  const unreadQuery = useQuery({
    queryFn: getUnreadNotificationCount,
    queryKey: ["notifications", "unread-count", "customer-dashboard"],
    retry: 1
  });
  const recommendationsQuery = useQuery({
    queryFn: () =>
      searchPublicListings({
        page: 0,
        size: 3,
        sortBy: "publishedAt",
        sortDirection: "DESC"
      }),
    queryKey: ["public-listings", "customer-dashboard-recommendations"],
    retry: 1
  });
  const favoriteListings = favoritesQuery.data?.content ?? [];
  const recommendationListings = recommendationsQuery.data?.content ?? [];
  const unreadCount = unreadQuery.data ?? 0;

  return (
    <section className="customer-portal">
      <div className="customer-portal-hero">
        <div>
          <p className="eyebrow">{tx("Customer portal")}</p>
          <h2>{tx("Your property workspace")}</h2>
          <p className="muted">
            {tx("Review saved listings, compare options, and request the next viewing with a focused customer portal.")}
          </p>
        </div>
        <div className="customer-portal-actions">
          <Button asChild>
            <Link to="/">
              <Search size={16} />
              {tx("Browse listings")}
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/favorites">
              <Heart size={16} />
              {tx("Saved shortlist")}
            </Link>
          </Button>
        </div>
      </div>

      <div className="customer-action-strip" aria-label={tx("Customer next actions")}>
        <Link to="/">
          <Search size={18} />
          <span>
            <strong>{tx("Find a property")}</strong>
            <small>{tx("Search by budget, room count, and location.")}</small>
          </span>
        </Link>
        <Link to="/favorites">
          <Heart size={18} />
          <span>
            <strong>{tx("Review shortlist")}</strong>
            <small>
              {tx("Saved listings")}
              {": "}
              {favoritesQuery.data
                ? favoritesQuery.data.totalElements.toLocaleString("vi-VN")
                : "0"}
            </small>
          </span>
        </Link>
        <Link to="/ai">
          <Bot size={18} />
          <span>
            <strong>{tx("Ask AI")}</strong>
            <small>{tx("Compare neighborhoods, prices, and next steps.")}</small>
          </span>
        </Link>
      </div>

      {favoritesQuery.error ? (
        <div className="content-section">
          <EmptyState
            title={tx("Favorites summary could not be loaded")}
            description={normalizeUnknownError(favoritesQuery.error).message}
            action={<Button onClick={() => favoritesQuery.refetch()}>{tx("Retry")}</Button>}
          />
        </div>
      ) : null}

      <div className="customer-workspace-grid">
        <section className="customer-panel">
          <div className="customer-panel-heading">
            <div>
              <p className="eyebrow">{tx("Saved shortlist")}</p>
              <h3>{tx("Homes you are reviewing")}</h3>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/favorites">
                {tx("View all")}
                <ArrowRight size={15} />
              </Link>
            </Button>
          </div>
          {favoritesQuery.isLoading ? (
            <div className="customer-preview-stack">
              {Array.from({ length: 3 }).map((_, index) => (
                <div className="customer-listing-preview customer-preview-skeleton" key={index} />
              ))}
            </div>
          ) : null}
          {!favoritesQuery.isLoading && favoriteListings.length === 0 ? (
            <EmptyState
              title={tx("No saved listings yet")}
              description={tx("Start by saving listings that match your budget and preferred locations.")}
              action={
                <Button asChild>
                  <Link to="/">{tx("Browse listings")}</Link>
                </Button>
              }
            />
          ) : null}
          {favoriteListings.length > 0 ? (
            <div className="customer-preview-stack">
              {favoriteListings.map((listing) => (
                <CustomerListingPreview listing={listing} key={listing.id} />
              ))}
            </div>
          ) : null}
        </section>

        <aside className="customer-panel customer-next-panel">
          <div className="customer-panel-heading">
            <div>
              <p className="eyebrow">{tx("Next steps")}</p>
              <h3>{tx("Stay ready for a viewing")}</h3>
            </div>
          </div>
          <Link className="customer-status-row" to="/notifications">
            <Bell size={18} />
            <span>
              <strong>{tx("Notification inbox")}</strong>
              <small>
                {unreadCount > 0
                  ? tx("Unread updates")
                  : tx("No unread updates")}
              </small>
            </span>
            <b>{unreadCount > 99 ? "99+" : unreadCount}</b>
          </Link>
          <Link className="customer-status-row" to="/account">
            <CheckCircle2 size={18} />
            <span>
              <strong>{tx("Profile and preferences")}</strong>
              <small>{tx("Keep your contact details current before requesting a viewing.")}</small>
            </span>
          </Link>
          <Link className="customer-status-row" to="/ai">
            <Bot size={18} />
            <span>
              <strong>{tx("AI assistant")}</strong>
              <small>{tx("Ask for listing recommendations and buying guidance.")}</small>
            </span>
          </Link>
        </aside>
      </div>

      <section className="customer-panel">
        <div className="customer-panel-heading">
          <div>
            <p className="eyebrow">{tx("Recommended next")}</p>
            <h3>{tx("Market-ready listings to review")}</h3>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              {tx("Browse all")}
              <ArrowRight size={15} />
            </Link>
          </Button>
        </div>
        {recommendationsQuery.isLoading ? (
          <div className="customer-recommendation-grid">
            {Array.from({ length: 3 }).map((_, index) => (
              <div className="customer-listing-preview customer-preview-skeleton" key={index} />
            ))}
          </div>
        ) : null}
        {recommendationListings.length > 0 ? (
          <div className="customer-recommendation-grid">
            {recommendationListings.map((listing) => (
              <CustomerListingPreview listing={listing} key={listing.id} />
            ))}
          </div>
        ) : null}
      </section>
    </section>
  );
}

export function DashboardPage() {
  const tx = useText();
  const { user } = useAuth();
  const roles = user?.roles ?? [];
  const dashboardRole = useMemo(() => getDashboardRole(roles), [roles]);
  const dashboardQuery = useQuery({
    enabled: Boolean(dashboardRole),
    queryFn: () => getRoleDashboard(dashboardRole as DashboardRole),
    queryKey: ["dashboard", dashboardRole],
    retry: 1
  });
  const normalizedError = dashboardQuery.error
    ? normalizeUnknownError(dashboardQuery.error)
    : null;

  if (!dashboardRole) {
    return <CustomerDashboard />;
  }

  return (
    <section className="dashboard">
      <div className="section-header">
        <div>
          <p className="eyebrow">{tx("Dashboard")}</p>
          <h2>{dashboardQuery.data?.title ?? `${dashboardRole} dashboard`}</h2>
          <p className="muted">{dashboardQuery.data?.summary ?? tx("Loading dashboard metrics.")}</p>
        </div>
      </div>
      {dashboardQuery.isLoading ? <DashboardSkeleton /> : null}
      {normalizedError ? (
        <div className="content-section">
          <EmptyState
            title={tx("Dashboard could not be loaded")}
            description={normalizedError.message}
            action={<Button onClick={() => dashboardQuery.refetch()}>{tx("Retry")}</Button>}
          />
        </div>
      ) : null}
      {dashboardQuery.data ? (
        <>
          <div className="metric-grid">
            {dashboardQuery.data.metrics.map((metric, index) => {
              const Icon = metricIcons[index % metricIcons.length];
              return (
                <article className="metric-card" key={`${metric.label}-${index}`}>
                  <Icon size={20} />
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                </article>
              );
            })}
          </div>
          <div className="dashboard-actions">
            {dashboardQuery.data.actions.map((action) => (
              <Link to={action.href} key={action.href}>
                <LayoutDashboard size={18} />
                <span>
                  <strong>{action.label}</strong>
                  {action.text}
                </span>
              </Link>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
