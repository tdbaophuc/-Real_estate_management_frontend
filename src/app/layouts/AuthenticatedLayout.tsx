import {
  BarChart3,
  Bell,
  Bot,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Contact,
  FileSignature,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  ShieldCheck,
  Users
} from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../shared/auth/useAuth";
import { Button } from "../../shared/ui/Button";
import { canAccessNavigationItem, navigationItems } from "../../shared/constants/navigation";

const iconMap = {
  dashboard: LayoutDashboard,
  favorites: Heart,
  properties: Home,
  listings: Building2,
  customers: Contact,
  leads: Users,
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
  const roles = user?.roles ?? [];
  const visibleItems = navigationItems.filter((item) =>
    canAccessNavigationItem(item, roles)
  );

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <Link className="brand sidebar-brand" to="/dashboard">
          <span className="brand-mark">
            <Building2 size={20} />
          </span>
          <span>RealEstate Pro</span>
        </Link>
        <nav className="sidebar-nav" aria-label="Application navigation">
          {visibleItems.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <NavLink key={item.href} to={item.href}>
                <Icon size={17} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
      <div className="app-content">
        <header className="app-topbar">
          <div>
            <p className="eyebrow">Workspace</p>
            <h1>Real Estate Management</h1>
          </div>
          <div className="topbar-actions">
            <Button asChild variant="ghost" size="icon" aria-label="Notifications">
              <Link to="/notifications">
                <Bell size={18} />
              </Link>
            </Button>
            <details className="user-menu">
              <summary aria-label="User menu">
                <span className="user-chip">
                  <span>{user?.fullName ?? "Demo User"}</span>
                  <small>{roles.join(", ") || "No role"}</small>
                </span>
                <Menu size={17} />
              </summary>
              <div className="user-menu-panel">
                <div>
                  <strong>{user?.fullName ?? "Demo User"}</strong>
                  <small>{user?.email ?? "No email"}</small>
                </div>
                <Button variant="secondary" size="sm" onClick={logout}>
                  <LogOut size={16} />
                  Logout
                </Button>
              </div>
            </details>
          </div>
        </header>
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
