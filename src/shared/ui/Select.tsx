import { forwardRef, type SelectHTMLAttributes } from "react";
import { useText } from "../i18n/useText";
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
    const tx = useText();
    const selectId = id ?? props.name;

    return (
      <label className="field" htmlFor={selectId}>
        {label ? <span>{tx(label)}</span> : null}
        <select
          ref={ref}
          id={selectId}
          className={cn("input", error && "input-error", className)}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {tx(option.label)}
            </option>
          ))}
        </select>
        {error ? <small className="field-error">{tx(error)}</small> : null}
      </label>
    );
  }
);

Select.displayName = "Select";
