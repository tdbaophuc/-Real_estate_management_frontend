import type { ReactNode } from "react";
import { TableEmpty } from "./Table";
import { useText } from "../i18n/useText";

export type DataTableColumn<T> = {
  align?: "left" | "right" | "center";
  header: string;
  key: string;
  render: (row: T, index: number) => ReactNode;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  emptyMessage?: string;
  getRowKey: (row: T, index: number) => string | number;
  rows: T[];
};

export function DataTable<T>({
  columns,
  emptyMessage = "No records found",
  getRowKey,
  rows
}: DataTableProps<T>) {
  const tx = useText();

  return (
    <div className="table-wrap data-table-wrap">
      <table className="table data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={column.align ? `text-${column.align}` : undefined}>
                {tx(column.header)}
              </th>
            ))}
          </tr>
        </thead>
        {rows.length > 0 ? (
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={getRowKey(row, rowIndex)}>
                {columns.map((column) => (
                  <td key={column.key} className={column.align ? `text-${column.align}` : undefined}>
                    {column.render(row, rowIndex)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        ) : (
          <TableEmpty message={emptyMessage} />
        )}
      </table>
    </div>
  );
}
