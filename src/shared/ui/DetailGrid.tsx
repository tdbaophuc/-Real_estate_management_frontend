import type { ReactNode } from "react";
import { useText } from "../i18n/useText";

export type DetailGridItem = {
  label: string;
  value: ReactNode;
};

type DetailGridProps = {
  items: DetailGridItem[];
};

export function DetailGrid({ items }: DetailGridProps) {
  const tx = useText();

  return (
    <dl className="detail-grid-list">
      {items.map((item) => (
        <div key={item.label}>
          <dt>{tx(item.label)}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
