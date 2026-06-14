import { useEffect, useMemo, useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Save } from "lucide-react";
import { z } from "zod";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { Input } from "../../shared/ui/Input";
import { Select } from "../../shared/ui/Select";
import type { CustomerRecord, CustomerUpsertRequest } from "./customerApi";

const optionalNumber = z.string().trim().refine((value) => !value || !Number.isNaN(Number(value)), "Must be a number");

const customerFormSchema = z
  .object({
    assignedAgentId: optionalNumber,
    code: z.string().trim().min(2, "Code is required"),
    email: z.string().trim().email("Use a valid email").or(z.literal("")),
    fullName: z.string().trim().min(2, "Full name is required"),
    notes: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    preferredContactMethod: z.string().trim().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
    source: z.enum(["MANUAL", "WEBSITE", "REFERRAL", "IMPORT", "OTHER"]),
    status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]),
    userId: optionalNumber
  })
  .superRefine((values, context) => {
    if (!values.email && !values.phone && !values.userId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide at least email, phone, or user id.",
        path: ["email"]
      });
    }
  });

export type CustomerFormValues = z.infer<typeof customerFormSchema>;

const statusOptions = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
  { label: "Archived", value: "ARCHIVED" }
];

const sourceOptions = [
  { label: "Manual", value: "MANUAL" },
  { label: "Website", value: "WEBSITE" },
  { label: "Referral", value: "REFERRAL" },
  { label: "Import", value: "IMPORT" },
  { label: "Other", value: "OTHER" }
];

const priorityOptions = [
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" }
];

const contactOptions = [
  { label: "Phone", value: "PHONE" },
  { label: "Email", value: "EMAIL" },
  { label: "Zalo", value: "ZALO" },
  { label: "Any", value: "ANY" }
];

function toNumber(value: string) {
  return value.trim() ? Number(value) : undefined;
}

export function toCustomerRequest(values: CustomerFormValues): CustomerUpsertRequest {
  return {
    assignedAgentId: toNumber(values.assignedAgentId),
    code: values.code.trim(),
    email: values.email || undefined,
    fullName: values.fullName.trim(),
    notes: values.notes || undefined,
    phone: values.phone || undefined,
    preferredContactMethod: values.preferredContactMethod || undefined,
    priority: values.priority,
    source: values.source,
    status: values.status,
    userId: toNumber(values.userId)
  };
}

function toDefaultValues(customer?: CustomerRecord): CustomerFormValues {
  return {
    assignedAgentId: customer?.assignedAgentId ? String(customer.assignedAgentId) : "",
    code: customer?.code ?? "",
    email: customer?.email ?? "",
    fullName: customer?.fullName ?? "",
    notes: customer?.notes ?? "",
    phone: customer?.phone ?? "",
    preferredContactMethod: customer?.preferredContactMethod ?? "PHONE",
    priority: customer?.priority === "LOW" || customer?.priority === "HIGH" ? customer.priority : "MEDIUM",
    source:
      customer?.source === "WEBSITE" ||
      customer?.source === "REFERRAL" ||
      customer?.source === "IMPORT" ||
      customer?.source === "OTHER"
        ? customer.source
        : "MANUAL",
    status:
      customer?.status === "INACTIVE" || customer?.status === "ARCHIVED"
        ? customer.status
        : "ACTIVE",
    userId: customer?.userId ? String(customer.userId) : ""
  };
}

function FormSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="form-section">
      <h3>{title}</h3>
      <div className="form-grid">{children}</div>
    </section>
  );
}

export function CustomerForm({
  customer,
  onSubmit,
  submitLabel
}: {
  customer?: CustomerRecord;
  onSubmit: (values: CustomerFormValues) => Promise<void>;
  submitLabel: string;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const defaultValues = useMemo(() => toDefaultValues(customer), [customer]);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError
  } = useForm<CustomerFormValues>({
    defaultValues,
    resolver: zodResolver(customerFormSchema)
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const submit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      await onSubmit(values);
    } catch (error) {
      const normalizedError = normalizeUnknownError(error);

      Object.entries(normalizedError.fieldErrors).forEach(([field, message]) => {
        const localField = field as keyof CustomerFormValues;

        if (localField in defaultValues) {
          setError(localField, { message });
        }
      });

      setFormError(normalizedError.message);
    }
  });

  return (
    <form className="property-form" onSubmit={submit}>
      <FormSection title="Profile">
        <Input label="Code" error={errors.code?.message} {...register("code")} />
        <Input label="Full name" error={errors.fullName?.message} {...register("fullName")} />
        <Select label="Status" options={statusOptions} error={errors.status?.message} {...register("status")} />
        <Select label="Priority" options={priorityOptions} error={errors.priority?.message} {...register("priority")} />
      </FormSection>
      <FormSection title="Contact">
        <Input label="Email" error={errors.email?.message} {...register("email")} />
        <Input label="Phone" error={errors.phone?.message} {...register("phone")} />
        <Input label="User id" error={errors.userId?.message} {...register("userId")} />
        <Select
          label="Preferred contact"
          options={contactOptions}
          error={errors.preferredContactMethod?.message}
          {...register("preferredContactMethod")}
        />
      </FormSection>
      <FormSection title="Ownership">
        <Select label="Source" options={sourceOptions} error={errors.source?.message} {...register("source")} />
        <Input label="Assigned agent id" error={errors.assignedAgentId?.message} {...register("assignedAgentId")} />
        <Input label="Notes" error={errors.notes?.message} {...register("notes")} />
      </FormSection>
      {formError ? <p className="form-alert">{formError}</p> : null}
      <div className="form-actions">
        <Button type="submit" disabled={isSubmitting}>
          <Save size={16} />
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
