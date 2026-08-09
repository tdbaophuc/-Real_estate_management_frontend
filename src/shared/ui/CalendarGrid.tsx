import type { CSSProperties, ReactNode } from "react";
import { useText } from "../i18n/useText";

export type CalendarGridColumn = {
  content?: ReactNode;
  id: string;
  label: string;
};

type CalendarGridProps = {
  columns: CalendarGridColumn[];
  times: string[];
};

export function CalendarGrid({ columns, times }: CalendarGridProps) {
  const tx = useText();

  return (
    <div className="calendar-grid" style={{ "--calendar-column-count": columns.length } as CSSProperties}>
      <div className="calendar-grid-corner" />
      {columns.map((column) => (
        <div className="calendar-grid-header" key={column.id}>{tx(column.label)}</div>
      ))}
      {times.map((time) => (
        <div className="calendar-grid-row" key={time}>
          <div className="calendar-grid-time">{time}</div>
          {columns.map((column) => (
            <div className="calendar-grid-cell" key={`${time}-${column.id}`}>
              {column.content}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
