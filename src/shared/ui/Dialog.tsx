import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./Button";

type DialogProps = {
  children: ReactNode;
  onClose: () => void;
  open: boolean;
  title: string;
};

export function Dialog({ children, onClose, open, title }: DialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="overlay" role="presentation">
      <section className="dialog" role="dialog" aria-modal="true" aria-label={title}>
        <header className="dialog-header">
          <h2>{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </Button>
        </header>
        {children}
      </section>
    </div>
  );
}

