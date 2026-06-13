import { apiClient } from "../../shared/api/client";
import type { RoleCode } from "../../shared/types/auth";

export type DashboardRole = Extract<RoleCode, "ADMIN" | "MANAGER" | "AGENT">;

export type DashboardMetric = {
  label: string;
  value: string;
};

export type DashboardAction = {
  href: string;
  label: string;
  text: string;
};

export type RoleDashboard = {
  actions: DashboardAction[];
  metrics: DashboardMetric[];
  role: DashboardRole;
  summary: string;
  title: string;
};

type BackendDashboard = Record<string, unknown>;

const dashboardCopy: Record<DashboardRole, Pick<RoleDashboard, "actions" | "summary" | "title">> = {
  ADMIN: {
    actions: [
      { href: "/admin/users", label: "Manage users", text: "Review account status and roles." },
      { href: "/reports", label: "Open reports", text: "Check revenue, leads, and transactions." },
      { href: "/admin/audit-logs", label: "Audit logs", text: "Inspect recent platform activity." }
    ],
    summary: "System-wide controls, reporting, and audit activity.",
    title: "Admin dashboard"
  },
  AGENT: {
    actions: [
      { href: "/leads", label: "Open leads", text: "Work assigned opportunities." },
      { href: "/appointments", label: "My appointments", text: "Prepare for viewings and follow-ups." },
      { href: "/commissions", label: "Commissions", text: "Track personal commission status." }
    ],
    summary: "Assigned sales work, appointments, and commission progress.",
    title: "Agent dashboard"
  },
  MANAGER: {
    actions: [
      { href: "/listings", label: "Review listings", text: "Moderate listing workflow and approvals." },
      { href: "/reports", label: "Team reports", text: "Review performance and revenue signals." },
      { href: "/commissions", label: "Commissions", text: "Approve and mark payouts." }
    ],
    summary: "Team operations, approvals, and sales performance.",
    title: "Manager dashboard"
  }
};

const fallbackMetrics: Record<DashboardRole, DashboardMetric[]> = {
  ADMIN: [
    { label: "Users", value: "0" },
    { label: "Properties", value: "0" },
    { label: "Listings", value: "0" },
    { label: "Revenue", value: "0" }
  ],
  AGENT: [
    { label: "Assigned leads", value: "0" },
    { label: "Today appointments", value: "0" },
    { label: "Active listings", value: "0" },
    { label: "Commission", value: "0" }
  ],
  MANAGER: [
    { label: "Pending listings", value: "0" },
    { label: "Open leads", value: "0" },
    { label: "Team appointments", value: "0" },
    { label: "Revenue", value: "0" }
  ]
};

function titleize(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function stringifyValue(value: unknown) {
  if (typeof value === "number") {
    return value.toLocaleString("vi-VN");
  }

  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return null;
}

function flattenMetricCandidates(payload: BackendDashboard) {
  const candidates: Array<[string, unknown]> = [];
  const nestedKeys = ["metrics", "summary", "totals", "statistics", "stats"];

  Object.entries(payload).forEach(([key, value]) => {
    if (nestedKeys.includes(key) && value && typeof value === "object" && !Array.isArray(value)) {
      Object.entries(value as BackendDashboard).forEach(([nestedKey, nestedValue]) => {
        candidates.push([nestedKey, nestedValue]);
      });
      return;
    }

    if (!Array.isArray(value) && (!value || typeof value !== "object")) {
      candidates.push([key, value]);
    }
  });

  return candidates;
}

function normalizeDashboard(role: DashboardRole, payload: BackendDashboard): RoleDashboard {
  const metrics = flattenMetricCandidates(payload)
    .map(([key, value]) => {
      const metricValue = stringifyValue(value);

      return metricValue
        ? {
            label: titleize(key),
            value: metricValue
          }
        : null;
    })
    .filter((metric): metric is DashboardMetric => Boolean(metric))
    .slice(0, 8);
  const copy = dashboardCopy[role];

  return {
    ...copy,
    metrics: metrics.length ? metrics : fallbackMetrics[role],
    role
  };
}

export function getRoleDashboard(role: DashboardRole) {
  return apiClient
    .get<BackendDashboard>(`/dashboard/${role.toLowerCase()}`)
    .then((payload) => normalizeDashboard(role, payload ?? {}));
}
