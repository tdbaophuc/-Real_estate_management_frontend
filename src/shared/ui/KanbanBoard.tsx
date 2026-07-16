import type { ReactNode } from "react";
import { useText } from "../i18n/useText";

export type KanbanColumn = {
  cards?: ReactNode;
  count?: number;
  id: string;
  title: string;
};

type KanbanBoardProps = {
  columns: KanbanColumn[];
};

export function KanbanBoard({ columns }: KanbanBoardProps) {
  const tx = useText();

  return (
    <div className="kanban-board">
      {columns.map((column) => (
        <section className="kanban-column" key={column.id}>
          <header>
            <strong>{tx(column.title)}</strong>
            {typeof column.count === "number" ? <span>{column.count}</span> : null}
          </header>
          <div className="kanban-column-body">{column.cards}</div>
        </section>
      ))}
    </div>
  );
}
