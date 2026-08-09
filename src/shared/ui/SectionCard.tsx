import type { ReactNode } from "react";
import { useText } from "../i18n/useText";
import { cn } from "../lib/cn";

type SectionCardProps = {
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  description?: string;
  title?: string;
};

export function SectionCard({ actions, children, className, description, title }: SectionCardProps) {
  const tx = useText();

  return (
    <section className={cn("section-card", className)}>
      {title || description || actions ? (
        <header className="section-card-header">
          <div>
            {title ? <h2>{tx(title)}</h2> : null}
            {description ? <p>{tx(description)}</p> : null}
          </div>
          {actions ? <div className="section-card-actions">{actions}</div> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
