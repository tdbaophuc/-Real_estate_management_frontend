import {
  cloneElement,
  forwardRef,
  isValidElement,
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode
} from "react";
import { cn } from "../lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  children: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      asChild = false,
      children,
      className,
      size = "md",
      type = "button",
      variant = "primary",
      ...props
    },
    ref
  ) => {
    const buttonClassName = cn(
      "btn",
      `btn-${variant}`,
      `btn-${size}`,
      className
    );

    if (asChild && isValidElement(children)) {
      return cloneElement(children as ReactElement, {
        className: cn((children.props as { className?: string }).className, buttonClassName)
      });
    }

    return (
      <button ref={ref} type={type} className={buttonClassName} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

