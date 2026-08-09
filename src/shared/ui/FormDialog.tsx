import type { ReactNode } from "react";
import { Dialog } from "./Dialog";

type FormDialogProps = {
  children: ReactNode;
  onClose: () => void;
  open: boolean;
  title: string;
};

export function FormDialog(props: FormDialogProps) {
  return <Dialog {...props} />;
}
