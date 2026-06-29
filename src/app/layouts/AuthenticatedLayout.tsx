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
  ReceiptText,
  Search,
  ShieldCheck,
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

  return (
    <div className={cn("app-layout", isAiAssistantOpen && "app-layout-ai-open")}>
      <aside className="sidebar">
        <Link className="brand sidebar-brand" to="/dashboard">
          <span className="brand-mark">
            <Building2 size={20} />
          </span>
          <span>RealEstate Pro</span>
        </Link>
        <nav className="sidebar-nav" aria-label={t("app.title")}>
          {visibleItems.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <NavLink key={item.href} to={item.href}>
                <Icon size={17} />
                {t(item.labelKey)}
              </NavLink>
            );
          })}
        </nav>
        <button
          className="sidebar-ai-toggle"
          type="button"
          aria-pressed={isAiAssistantOpen}
          onClick={() => setIsAiAssistantOpen((current) => !current)}
        >
          <Bot size={18} />
          <span>{t("navigation.aiAssistant")}</span>
        </button>
      </aside>
      <div className="app-content">
        <header className="app-topbar">
          <div>
            <p className="eyebrow">{t("app.workspace")}</p>
            <h1>{t("app.title")}</h1>
          </div>
          <div className="topbar-actions">
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
