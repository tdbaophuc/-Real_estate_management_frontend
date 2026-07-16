import type { ReactNode } from "react";
import { useText } from "../i18n/useText";

type PageHeaderProps = {
  actions?: ReactNode;
  eyebrow?: string;
  description?: string;
  meta?: ReactNode;
  title: string;
};

export function PageHeader({ actions, description, eyebrow, meta, title }: PageHeaderProps) {
  const tx = useText();

  return (
    <header className="page-header">
      <div>
        {eyebrow ? <p className="eyebrow">{tx(eyebrow)}</p> : null}
        <h1>{tx(title)}</h1>
        {description ? <p>{tx(description)}</p> : null}
        {meta ? <div className="page-header-meta">{meta}</div> : null}
      </div>
      {actions ? <div className="page-header-actions">{actions}</div> : null}
    </header>
  );
}
