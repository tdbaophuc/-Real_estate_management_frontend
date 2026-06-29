import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Bot,
  CalendarDays,
  Heart,
  Home,
  LayoutDashboard,
  Users
} from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { useAuth } from "../../shared/auth/useAuth";
import { Button } from "../../shared/ui/Button";
import { EmptyState } from "../../shared/ui/EmptyState";
import { useText } from "../../shared/i18n/useText";
import { getFavoriteListings } from "../public-listings/publicListingApi";
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

function CustomerDashboard() {
  const tx = useText();
  const favoritesQuery = useQuery({
    queryFn: () => getFavoriteListings({ page: 0, size: 1 }),
    queryKey: ["favorite-listings", "dashboard"],
    retry: 1
  });

  return (
    <section className="dashboard">
      <div className="section-header">
        <div>
          <p className="eyebrow">{tx("Dashboard")}</p>
          <h2>{tx("Customer dashboard")}</h2>
        </div>
      </div>
      <div className="metric-grid">
        <article className="metric-card">
          <Heart size={20} />
          <span>{tx("Saved listings")}</span>
          <strong>
            {favoritesQuery.data
              ? favoritesQuery.data.totalElements.toLocaleString("vi-VN")
              : "0"}
          </strong>
        </article>
        <article className="metric-card">
          <Bot size={20} />
          <span>{tx("AI assistant")}</span>
          <strong>{tx("Ready")}</strong>
        </article>
        <article className="metric-card">
          <CalendarDays size={20} />
          <span>{tx("Appointments")}</span>
          <strong>{tx("Shortcut")}</strong>
        </article>
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
      <div className="dashboard-actions">
        <Link to="/favorites">
          <Heart size={18} />
          <span>
            <strong>{tx("Favorites")}</strong>
            {tx("Saved homes and listing detail shortcuts.")}
          </span>
        </Link>
        <Link to="/ai">
          <Bot size={18} />
          <span>
            <strong>{tx("AI assistant")}</strong>
            {tx("Ask for listing recommendations and buying guidance.")}
          </span>
        </Link>
        <Link to="/appointments">
          <CalendarDays size={18} />
          <span>
            <strong>{tx("Appointments")}</strong>
            {tx("Open appointment workflow when it becomes available.")}
          </span>
        </Link>
      </div>
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
