import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "../lib/cn";

type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  error?: string;
  label?: string;
  options: SelectOption[];
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, id, label, options, ...props }, ref) => {
    const selectId = id ?? props.name;

    return (
      <label className="field" htmlFor={selectId}>
        {label ? <span>{label}</span> : null}
        <select
          ref={ref}
          id={selectId}
          className={cn("input", error && "input-error", className)}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error ? <small className="field-error">{error}</small> : null}
      </label>
    );
  }
);

Select.displayName = "Select";

