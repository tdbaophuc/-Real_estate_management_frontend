import type { ReactNode } from "react";
import { cn } from "../lib/cn";

type ActionBarProps = {
  children: ReactNode;
  className?: string;
  sticky?: boolean;
};

export function ActionBar({ children, className, sticky = false }: ActionBarProps) {
  return <div className={cn("action-bar", sticky && "action-bar-sticky", className)}>{children}</div>;
}
