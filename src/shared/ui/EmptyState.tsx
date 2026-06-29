import { Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { useText } from "../i18n/useText";

type EmptyStateProps = {
  action?: ReactNode;
  description?: string;
  title: string;
};

export function EmptyState({ action, description, title }: EmptyStateProps) {
  const tx = useText();

  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Inbox size={22} />
      </div>
      <h3>{tx(title)}</h3>
      {description ? <p>{tx(description)}</p> : null}
      {action ? <div>{action}</div> : null}
    </div>
  );
}
