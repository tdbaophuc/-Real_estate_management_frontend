import type { ReactNode } from "react";
import { useText } from "../i18n/useText";

export type TimelineItem = {
  description?: string;
  meta?: ReactNode;
  title: string;
};

type TimelineProps = {
  emptyMessage?: string;
  items: TimelineItem[];
};

export function Timeline({ emptyMessage = "No timeline activity yet", items }: TimelineProps) {
  const tx = useText();

  if (!items.length) {
    return <p className="timeline-empty">{tx(emptyMessage)}</p>;
  }

  return (
    <ol className="timeline">
      {items.map((item, index) => (
        <li key={`${item.title}-${index}`}>
          <span className="timeline-marker" />
          <div>
            <strong>{tx(item.title)}</strong>
            {item.description ? <p>{tx(item.description)}</p> : null}
            {item.meta ? <small>{item.meta}</small> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
