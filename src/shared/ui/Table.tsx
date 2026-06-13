import type { ReactNode } from "react";

type TableProps = {
  children: ReactNode;
};

export function Table({ children }: TableProps) {
  return <div className="table-wrap"><table className="table">{children}</table></div>;
}

export function TableEmpty({ message }: { message: string }) {
  return (
    <tbody>
      <tr>
        <td className="table-empty" colSpan={99}>{message}</td>
      </tr>
    </tbody>
  );
}

