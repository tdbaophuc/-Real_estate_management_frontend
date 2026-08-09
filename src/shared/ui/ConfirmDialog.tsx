import { Dialog } from "./Dialog";
import { Button } from "./Button";
import { useText } from "../i18n/useText";

type ConfirmDialogProps = {
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
  title: string;
};

export function ConfirmDialog({
  description,
  onCancel,
  onConfirm,
  open,
  title
}: ConfirmDialogProps) {
  const tx = useText();

  return (
    <Dialog open={open} onClose={onCancel} title={title}>
      <div className="dialog-body">
        <p>{tx(description)}</p>
      </div>
      <footer className="dialog-actions">
        <Button variant="secondary" onClick={onCancel}>{tx("Cancel")}</Button>
        <Button variant="danger" onClick={onConfirm}>{tx("Confirm")}</Button>
      </footer>
    </Dialog>
  );
}
