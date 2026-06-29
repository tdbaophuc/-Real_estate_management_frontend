import { forwardRef, type InputHTMLAttributes } from "react";
import { useText } from "../i18n/useText";
import { cn } from "../lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  label?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, id, label, ...props }, ref) => {
    const tx = useText();
    const inputId = id ?? props.name;
    const translatedPlaceholder =
      typeof props.placeholder === "string" ? tx(props.placeholder) : props.placeholder;

    return (
      <label className="field" htmlFor={inputId}>
        {label ? <span>{tx(label)}</span> : null}
        <input
          ref={ref}
          id={inputId}
          className={cn("input", error && "input-error", className)}
          {...props}
          placeholder={translatedPlaceholder}
        />
        {error ? <small className="field-error">{tx(error)}</small> : null}
      </label>
    );
  }
);

Input.displayName = "Input";

