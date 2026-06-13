import { forwardRef, type InputHTMLAttributes } from "react";
import { Input } from "./Input";

type DatePickerProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  error?: string;
  label?: string;
};

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (props, ref) => <Input ref={ref} type="date" {...props} />
);

DatePicker.displayName = "DatePicker";

