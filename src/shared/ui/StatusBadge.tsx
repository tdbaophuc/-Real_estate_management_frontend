import { cn } from "../lib/cn";
import { useText } from "../i18n/useText";

type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";

type StatusBadgeProps = {
  children: string;
  tone?: StatusTone;
};

export function StatusBadge({ children, tone = "neutral" }: StatusBadgeProps) {
  const tx = useText();

  return <span className={cn("status-badge", `status-${tone}`)}>{tx(children)}</span>;
}
