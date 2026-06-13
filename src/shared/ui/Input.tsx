import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  label?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, id, label, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <label className="field" htmlFor={inputId}>
        {label ? <span>{label}</span> : null}
        <input
          ref={ref}
          id={inputId}
          className={cn("input", error && "input-error", className)}
          {...props}
        />
        {error ? <small className="field-error">{error}</small> : null}
      </label>
    );
  }
);

Input.displayName = "Input";

