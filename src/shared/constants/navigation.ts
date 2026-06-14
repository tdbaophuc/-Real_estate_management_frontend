import type { RoleCode } from "../types/auth";

export type NavigationItem = {
  href: string;
  label: string;
  icon:
  | "dashboard"
  | "favorites"
  | "properties"
  | "listings"
  | "customers"
  | "leads"
  | "appointments"
  | "contracts"
  | "transactions"
  | "commissions"
  | "notifications"
  | "reports"
  | "ai"
  | "admin";
  roles: RoleCode[];
};

export const navigationItems: NavigationItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: "dashboard",
    roles: ["ADMIN", "MANAGER", "AGENT", "CUSTOMER"]
  },
  {
    href: "/favorites",
    label: "Favorites",
    icon: "favorites",
    roles: ["ADMIN", "MANAGER", "AGENT", "CUSTOMER"]
  },
  {
    href: "/properties",
    label: "Properties",
    icon: "properties",
    roles: ["ADMIN", "MANAGER", "AGENT"]
  },
  {
    href: "/listings",
    label: "Listings",
    icon: "listings",
    roles: ["ADMIN", "MANAGER", "AGENT"]
  },
  {
    href: "/customers",
    label: "Customers",
    icon: "customers",
    roles: ["ADMIN", "MANAGER", "AGENT"]
  },
  {
    href: "/leads",
    label: "Leads",
    icon: "leads",
    roles: ["ADMIN", "MANAGER", "AGENT"]
  },
  {
    href: "/appointments",
    label: "Appointments",
    icon: "appointments",
    roles: ["ADMIN", "MANAGER", "AGENT"]
  },
  {
    href: "/contracts",
    label: "Contracts",
    icon: "contracts",
    roles: ["ADMIN", "MANAGER", "AGENT"]
  },
  {
    href: "/transactions",
    label: "Transactions",
    icon: "transactions",
    roles: ["ADMIN", "MANAGER", "AGENT"]
  },
  {
    href: "/commissions",
    label: "Commissions",
    icon: "commissions",
    roles: ["ADMIN", "MANAGER", "AGENT"]
  },
  {
    href: "/notifications",
    label: "Notifications",
    icon: "notifications",
    roles: ["ADMIN", "MANAGER", "AGENT", "CUSTOMER"]
  },
  {
    href: "/reports",
    label: "Reports",
    icon: "reports",
    roles: ["ADMIN", "MANAGER"]
  },
  {
    href: "/ai",
    label: "AI Assistant",
    icon: "ai",
    roles: ["ADMIN", "MANAGER", "AGENT", "CUSTOMER"]
  },
  {
    href: "/admin/users",
    label: "Admin Users",
    icon: "admin",
    roles: ["ADMIN"]
  },
  {
    href: "/admin/audit-logs",
    label: "Audit Logs",
    icon: "admin",
    roles: ["ADMIN"]
  }
];

export function canAccessNavigationItem(item: NavigationItem, roles: RoleCode[]) {
  return item.roles.some((role) => roles.includes(role));
}
