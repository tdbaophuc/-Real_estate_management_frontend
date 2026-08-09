import {
  cloneElement,
  forwardRef,
  isValidElement,
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode
} from "react";
import { useText } from "../i18n/useText";
import { cn } from "../lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  children: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

function translateNode(node: ReactNode, tx: (text: string) => string): ReactNode {
  if (typeof node === "string") {
    return tx(node);
  }

  if (Array.isArray(node)) {
    return node.map((child) => translateNode(child, tx));
  }

  if (isValidElement(node)) {
    return cloneElement(node as ReactElement<{ children?: ReactNode }>, {
      children: translateNode((node.props as { children?: ReactNode }).children, tx)
    });
  }

  return node;
}

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
    const tx = useText();
    const buttonClassName = cn(
      "btn",
      `btn-${variant}`,
      `btn-${size}`,
      className
    );

    if (asChild && isValidElement(children)) {
      return cloneElement(children as ReactElement<{ children?: ReactNode; className?: string }>, {
        children: translateNode((children.props as { children?: ReactNode }).children, tx),
        className: cn((children.props as { className?: string }).className, buttonClassName)
      });
    }

    return (
      <button ref={ref} type={type} className={buttonClassName} {...props}>
        {translateNode(children, tx)}
      </button>
    );
  }
);

Button.displayName = "Button";

