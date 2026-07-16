import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Bell,
  Bot,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
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
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../shared/auth/useAuth";
import { Button } from "../../shared/ui/Button";
import { canAccessNavigationItem, navigationItems } from "../../shared/constants/navigation";
import { getUnreadNotificationCount } from "../../features/notifications/notificationApi";
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
  transactions: ReceiptText,
  commissions: BriefcaseBusiness,
  notifications: Bell,
  reports: BarChart3,
  ai: Bot,
  admin: ShieldCheck
};

export function AuthenticatedLayout() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
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
  const sidebarNavigation = (
    <>
      <div className="sidebar-header">
        <Link className="brand sidebar-brand" to="/dashboard" onClick={closeMobileNav}>
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
      <button
        className="sidebar-ai-toggle"
        type="button"
        aria-pressed={isAiAssistantOpen}
        onClick={() => {
          setIsAiAssistantOpen((current) => !current);
          closeMobileNav();
        }}
      >
        <Bot size={18} />
        <span>{t("navigation.aiAssistant")}</span>
      </button>
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
            <Button asChild variant="ghost" size="icon" aria-label={t("app.notifications")}>
              <Link className="notification-button" to="/notifications">
                <Bell size={18} />
                {unreadCount > 0 ? (
                  <span className="notification-badge">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : null}
              </Link>
            </Button>
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
