import { BarChart3, CalendarDays, Home, Users } from "lucide-react";
import { useAuth } from "../../shared/auth/useAuth";
import { EmptyState } from "../../shared/ui/EmptyState";

const metrics = [
  { label: "Active properties", value: "128", icon: Home },
  { label: "Open leads", value: "46", icon: Users },
  { label: "Today appointments", value: "9", icon: CalendarDays },
  { label: "Revenue pipeline", value: "12.4B", icon: BarChart3 }
];

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <section className="dashboard">
      <div className="section-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h2>{user?.roles[0] ?? "Workspace"} overview</h2>
        </div>
      </div>
      <div className="metric-grid">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article className="metric-card" key={metric.label}>
              <Icon size={20} />
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </article>
          );
        })}
      </div>
      <EmptyState
        title="Dashboard foundation ready"
        description="Day 6 will connect role-specific dashboard APIs and report widgets."
      />
    </section>
  );
}

