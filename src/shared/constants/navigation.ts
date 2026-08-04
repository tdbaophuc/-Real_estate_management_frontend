import type { RoleCode } from "../types/auth";

export type NavigationItem = {
  href: string;
  labelKey: string;
  icon:
  | "dashboard"
  | "browse"
  | "favorites"
  | "properties"
  | "listings"
  | "customers"
  | "leads"
  | "tasks"
  | "appointments"
  | "contracts"
  | "documents"
  | "transactions"
  | "commissions"
  | "reports"
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
    href: "/owner/dashboard",
    labelKey: "navigation.dashboard",
    icon: "dashboard",
    roles: ["OWNER"]
  },
  {
    href: "/search",
    labelKey: "navigation.browseListings",
    icon: "browse",
    roles: ["CUSTOMER"]
  },
  {
    href: "/favorites",
    labelKey: "navigation.favorites",
    icon: "favorites",
    roles: ["CUSTOMER"]
  },
  {
    href: "/properties",
    labelKey: "navigation.properties",
    icon: "properties",
    roles: ["ADMIN", "MANAGER", "AGENT"]
  },
  {
    href: "/owner/properties",
    labelKey: "navigation.ownerProperties",
    icon: "properties",
    roles: ["OWNER"]
  },
  {
    href: "/listings",
    labelKey: "navigation.listings",
    icon: "listings",
    roles: ["ADMIN", "MANAGER", "AGENT"]
  },
  {
    href: "/owner/listings",
    labelKey: "navigation.ownerListings",
    icon: "listings",
    roles: ["OWNER"]
  },
  {
    href: "/owner/documents",
    labelKey: "navigation.ownerDocuments",
    icon: "documents",
    roles: ["OWNER"]
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
    roles: ["ADMIN", "MANAGER"]
  },
  {
    href: "/appointments/my",
    labelKey: "navigation.appointments",
    icon: "appointments",
    roles: ["AGENT"]
  },
  {
    href: "/contracts",
    labelKey: "navigation.contracts",
    icon: "contracts",
    roles: ["ADMIN", "MANAGER", "AGENT"]
  },
  {
    href: "/owner/contracts",
    labelKey: "navigation.contracts",
    icon: "contracts",
    roles: ["OWNER"]
  },
  {
    href: "/transactions",
    labelKey: "navigation.transactions",
    icon: "transactions",
    roles: ["ADMIN", "MANAGER", "AGENT"]
  },
  {
    href: "/owner/transactions",
    labelKey: "navigation.transactions",
    icon: "transactions",
    roles: ["OWNER"]
  },
  {
    href: "/commissions/my",
    labelKey: "navigation.commissions",
    icon: "commissions",
    roles: ["ADMIN", "MANAGER", "AGENT"]
  },
  {
    href: "/reports",
    labelKey: "navigation.reports",
    icon: "reports",
    roles: ["ADMIN", "MANAGER"]
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
