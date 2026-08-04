import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  Contact,
  FileSignature,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  ReceiptText,
  Search,
  ShieldCheck,
  Sparkles,
  X,
  UserRound,
  Users
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../shared/auth/useAuth";
import type { RoleCode } from "../../shared/types/auth";
import { Button } from "../../shared/ui/Button";
import { canAccessNavigationItem, navigationItems } from "../../shared/constants/navigation";
import { getUnreadNotificationCount } from "../../features/notifications/notificationApi";
import { NotificationPopover } from "../../features/notifications/NotificationPopover";
import { LanguageSwitcher } from "../../shared/i18n/LanguageSwitcher";
import { AiAssistantPanel } from "../../features/ai/AiAssistantPanel";
import { cn } from "../../shared/lib/cn";

const iconMap = {
  dashboard: LayoutDashboard,
  browse: Search,
  favorites: Heart,
  properties: Home,
  listings: Building2,
  customers: Contact,
  leads: Users,
  tasks: ClipboardCheck,
  appointments: CalendarDays,
  contracts: FileSignature,
  documents: FileSignature,
  transactions: ReceiptText,
  commissions: BriefcaseBusiness,
  notifications: Bell,
  reports: BarChart3,
  admin: ShieldCheck
};

export function AuthenticatedLayout() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const roles = user?.roles ?? [];
  const visibleItems = navigationItems.filter((item) =>
    canAccessNavigationItem(item, roles)
  );
  const unreadQuery = useQuery({
    queryFn: getUnreadNotificationCount,
    queryKey: ["notifications", "unread-count"],
    refetchInterval: 30_000,
    retry: 1
  });
  const unreadCount = unreadQuery.data ?? 0;
  const closeMobileNav = () => setIsMobileNavOpen(false);
  const homeHref = roles.includes("OWNER") && roles.length === 1 ? "/owner/dashboard" : "/dashboard";
  const commissionSubItems: Array<{ href: string; label: string; roles: RoleCode[] }> = [
    { href: "/commissions/my", label: "My Commissions", roles: ["ADMIN", "MANAGER", "AGENT"] as RoleCode[] },
    { href: "/commissions/manage", label: "Commissions Management", roles: ["ADMIN", "MANAGER"] as RoleCode[] },
    { href: "/commissions/rules", label: "Commission Rules", roles: ["ADMIN", "MANAGER"] as RoleCode[] }
  ].filter((item) => item.roles.some((role) => roles.includes(role)));
  const listingSubItems: Array<{ href: string; label: string; roles: RoleCode[] }> = [
    { href: "/listings", label: "All Listings", roles: ["ADMIN", "MANAGER", "AGENT"] as RoleCode[] },
    { href: "/listings/review-queue", label: "Review Queue", roles: ["ADMIN", "MANAGER"] as RoleCode[] }
  ].filter((item) => item.roles.some((role) => roles.includes(role)));
  const adminSubItems: Array<{ href: string; labelKey: string; roles: RoleCode[] }> = [
    { href: "/admin/users", labelKey: "navigation.adminUsers", roles: ["ADMIN"] as RoleCode[] },
    { href: "/admin/audit-logs", labelKey: "navigation.auditLogs", roles: ["ADMIN"] as RoleCode[] }
  ].filter((item) => item.roles.some((role) => roles.includes(role)));
  const sidebarNavigation = (
    <>
      <div className="sidebar-header">
        <Link className="brand sidebar-brand" to={homeHref} onClick={closeMobileNav}>
          <span className="brand-mark">
            <Building2 size={20} />
          </span>
          <span className="brand-copy">
            <strong>AssetManager</strong>
            <small>Institutional Estate</small>
          </span>
        </Link>
        <button
          className="sidebar-collapse"
          type="button"
          aria-label={isSidebarCollapsed ? t("Expand sidebar") : t("Collapse sidebar")}
          onClick={() => setIsSidebarCollapsed((current) => !current)}
        >
          {isSidebarCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
        </button>
      </div>
      <nav className="sidebar-nav" aria-label={t("app.title")}>
        {visibleItems.map((item) => {
          const Icon = iconMap[item.icon];

          if (item.icon === "commissions") {
            return (
              <details className="sidebar-nav-group" key={item.href} open={location.pathname.startsWith("/commissions")}>
                <summary title={t(item.labelKey)}>
                  <Icon size={17} />
                  <span>{t(item.labelKey)}</span>
                  <ChevronDown className="sidebar-nav-group-chevron" size={15} />
                </summary>
                <div className="sidebar-subnav">
                  {commissionSubItems.map((subItem) => (
                    <NavLink key={subItem.href} to={subItem.href} onClick={closeMobileNav}>
                      <span>{subItem.label}</span>
                    </NavLink>
                  ))}
                </div>
              </details>
            );
          }

          if (item.href === "/listings" && listingSubItems.length > 1) {
            return (
              <details className="sidebar-nav-group" key={item.href} open={location.pathname.startsWith("/listings")}>
                <summary title={t(item.labelKey)}>
                  <Icon size={17} />
                  <span>{t(item.labelKey)}</span>
                  <ChevronDown className="sidebar-nav-group-chevron" size={15} />
                </summary>
                <div className="sidebar-subnav">
                  {listingSubItems.map((subItem) => (
                    <NavLink key={subItem.href} to={subItem.href} onClick={closeMobileNav} end={subItem.href === "/listings"}>
                      <span>{subItem.label}</span>
                    </NavLink>
                  ))}
                </div>
              </details>
            );
          }

          if (item.href === "/admin/audit-logs") {
            return null;
          }

          if (item.href === "/admin/users") {
            return (
              <details className="sidebar-nav-group" key={item.href} open={location.pathname.startsWith("/admin")}>
                <summary title={t("navigation.admin")}>
                  <Icon size={17} />
                  <span>{t("navigation.admin")}</span>
                  <ChevronDown className="sidebar-nav-group-chevron" size={15} />
                </summary>
                <div className="sidebar-subnav">
                  {adminSubItems.map((subItem) => (
                    <NavLink key={subItem.href} to={subItem.href} onClick={closeMobileNav} end={subItem.href === "/admin/users"}>
                      <span>{t(subItem.labelKey)}</span>
                    </NavLink>
                  ))}
                </div>
              </details>
            );
          }

          return (
            <NavLink
              key={item.href}
              to={item.href}
              title={t(item.labelKey)}
              onClick={closeMobileNav}
            >
              <Icon size={17} />
              <span>{t(item.labelKey)}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );

  return (
    <div
      className={cn(
        "app-layout",
        isAiAssistantOpen && "app-layout-ai-open",
        isSidebarCollapsed && "app-layout-sidebar-collapsed"
      )}
    >
      <aside className="sidebar">
        {sidebarNavigation}
      </aside>
      {isMobileNavOpen ? (
        <div className="mobile-nav-layer" role="presentation" onClick={closeMobileNav}>
          <aside
            className="mobile-sidebar"
            role="dialog"
            aria-modal="true"
            aria-label={t("app.title")}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="mobile-nav-close"
              type="button"
              aria-label={t("Close menu")}
              onClick={closeMobileNav}
            >
              <X size={18} />
            </button>
            {sidebarNavigation}
          </aside>
        </div>
      ) : null}
      <div className="app-content">
        <header className="app-topbar">
          <div className="topbar-heading">
            <button
              className="mobile-nav-trigger"
              type="button"
              aria-label={t("Open menu")}
              onClick={() => setIsMobileNavOpen(true)}
            >
              <Menu size={19} />
            </button>
            <div>
              <p className="eyebrow">{t("app.workspace")}</p>
              <h1>{t("app.title")}</h1>
            </div>
          </div>
          <div className="topbar-actions">
            <Button
              variant={isAiAssistantOpen ? "primary" : "secondary"}
              size="sm"
              onClick={() => setIsAiAssistantOpen((current) => !current)}
            >
              <Sparkles size={16} />
              {t("navigation.aiAssistant")}
            </Button>
            <LanguageSwitcher />
            <div className="notification-trigger">
              <Button
                className="notification-button"
                variant="ghost"
                size="icon"
                aria-label={t("app.notifications")}
                aria-expanded={isNotificationOpen}
                onClick={() => setIsNotificationOpen((current) => !current)}
              >
                <Bell size={18} />
                {unreadCount > 0 ? (
                  <span className="notification-badge">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : null}
              </Button>
              {isNotificationOpen ? <NotificationPopover onClose={() => setIsNotificationOpen(false)} /> : null}
            </div>
            <details className="user-menu">
              <summary aria-label={t("app.userMenu")}>
                <span className="user-chip">
                  <span>{user?.fullName ?? "Demo User"}</span>
                  <small>{roles.join(", ") || t("app.noRole")}</small>
                </span>
                <Menu size={17} />
              </summary>
              <div className="user-menu-panel">
                <div>
                  <strong>{user?.fullName ?? "Demo User"}</strong>
                  <small>{user?.email ?? t("app.noEmail")}</small>
                </div>
                <Button asChild variant="secondary" size="sm">
                  <Link to="/account">
                    <UserRound size={16} />
                    {t("app.account")}
                  </Link>
                </Button>
                <Button variant="secondary" size="sm" onClick={logout}>
                  <LogOut size={16} />
                  {t("app.logout")}
                </Button>
              </div>
            </details>
          </div>
        </header>
        <div className="app-workspace">
          <main className="app-main">
            <Outlet />
          </main>
          {isAiAssistantOpen ? (
            <AiAssistantPanel onClose={() => setIsAiAssistantOpen(false)} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
