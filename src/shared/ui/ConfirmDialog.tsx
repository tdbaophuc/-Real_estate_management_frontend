import { Dialog } from "./Dialog";
import { Button } from "./Button";

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
  return (
    <Dialog open={open} onClose={onCancel} title={title}>
      <div className="dialog-body">
        <p>{description}</p>
      </div>
      <footer className="dialog-actions">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm}>Confirm</Button>
      </footer>
    </Dialog>
  );
}

