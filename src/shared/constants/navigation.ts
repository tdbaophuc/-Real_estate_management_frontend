import type { RoleCode } from "../types/auth";

export type NavigationItem = {
  href: string;
  labelKey: string;
  icon:
  | "dashboard"
  | "favorites"
  | "properties"
  | "listings"
  | "customers"
  | "leads"
  | "tasks"
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
    labelKey: "navigation.dashboard",
    icon: "dashboard",
    roles: ["ADMIN", "MANAGER", "AGENT", "CUSTOMER"]
  },
  {
    href: "/favorites",
    labelKey: "navigation.favorites",
    icon: "favorites",
    roles: ["ADMIN", "MANAGER", "AGENT", "CUSTOMER"]
  },
  {
    href: "/properties",
    labelKey: "navigation.properties",
    icon: "properties",
    roles: ["ADMIN", "MANAGER", "AGENT"]
  },
  {
    href: "/listings",
    labelKey: "navigation.listings",
    icon: "listings",
    roles: ["ADMIN", "MANAGER", "AGENT"]
  },
  {
    href: "/customers",
    labelKey: "navigation.customers",
    icon: "customers",
    roles: ["ADMIN", "MANAGER", "AGENT"]
  },
  {
    href: "/leads",
    labelKey: "navigation.leads",
    icon: "leads",
    roles: ["ADMIN", "MANAGER", "AGENT"]
  },
  {
    href: "/follow-up-tasks",
    labelKey: "navigation.followUpTasks",
    icon: "tasks",
    roles: ["ADMIN", "MANAGER", "AGENT"]
  },
  {
    href: "/appointments",
    labelKey: "navigation.appointments",
    icon: "appointments",
    roles: ["ADMIN", "MANAGER", "AGENT"]
  },
  {
    href: "/contracts",
    labelKey: "navigation.contracts",
    icon: "contracts",
    roles: ["ADMIN", "MANAGER", "AGENT"]
  },
  {
    href: "/transactions",
    labelKey: "navigation.transactions",
    icon: "transactions",
    roles: ["ADMIN", "MANAGER", "AGENT"]
  },
  {
    href: "/commissions",
    labelKey: "navigation.commissions",
    icon: "commissions",
    roles: ["ADMIN", "MANAGER", "AGENT"]
  },
  {
    href: "/notifications",
    labelKey: "navigation.notifications",
    icon: "notifications",
    roles: ["ADMIN", "MANAGER", "AGENT", "CUSTOMER"]
  },
  {
    href: "/reports",
    labelKey: "navigation.reports",
    icon: "reports",
    roles: ["ADMIN", "MANAGER"]
  },
  {
    href: "/ai",
    labelKey: "navigation.aiAssistant",
    icon: "ai",
    roles: ["ADMIN", "MANAGER", "AGENT", "CUSTOMER"]
  },
  {
    href: "/admin/users",
    labelKey: "navigation.adminUsers",
    icon: "admin",
    roles: ["ADMIN"]
  },
  {
    href: "/admin/audit-logs",
    labelKey: "navigation.auditLogs",
    icon: "admin",
    roles: ["ADMIN"]
  }
];

export function canAccessNavigationItem(item: NavigationItem, roles: RoleCode[]) {
  return item.roles.some((role) => roles.includes(role));
}
