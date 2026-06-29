import type { ReactNode } from "react";
import { useText } from "../i18n/useText";

type TableProps = {
  children: ReactNode;
};

export function Table({ children }: TableProps) {
  return <div className="table-wrap"><table className="table">{children}</table></div>;
}

export function TableEmpty({ message }: { message: string }) {
  const tx = useText();

  return (
    <tbody>
      <tr>
        <td className="table-empty" colSpan={99}>{tx(message)}</td>
      </tr>
    </tbody>
  );
}

