import type { ReactNode } from "react";
import { useText } from "../i18n/useText";
import { cn } from "../lib/cn";

type MetricCardProps = {
  delta?: string;
  icon?: ReactNode;
  label: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  value: ReactNode;
};

export function MetricCard({ delta, icon, label, tone = "neutral", value }: MetricCardProps) {
  const tx = useText();

  return (
    <article className={cn("metric-card", `metric-card-${tone}`)}>
      <div className="metric-card-topline">
        <span>{tx(label)}</span>
        {icon ? <div className="metric-card-icon">{icon}</div> : null}
      </div>
      <strong>{value}</strong>
      {delta ? <small>{tx(delta)}</small> : null}
    </article>
  );
}
