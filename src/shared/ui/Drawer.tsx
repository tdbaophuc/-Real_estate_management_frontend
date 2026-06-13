import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./Button";

type DrawerProps = {
  children: ReactNode;
  onClose: () => void;
  open: boolean;
  title: string;
};

export function Drawer({ children, onClose, open, title }: DrawerProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="overlay" role="presentation">
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={title}>
        <header className="dialog-header">
          <h2>{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close drawer">
            <X size={18} />
          </Button>
        </header>
        {children}
      </aside>
    </div>
  );
}

