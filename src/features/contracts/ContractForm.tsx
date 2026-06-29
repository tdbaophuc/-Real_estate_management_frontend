import { useEffect, useMemo, useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Save } from "lucide-react";
import { z } from "zod";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { Input } from "../../shared/ui/Input";
import { Select } from "../../shared/ui/Select";
import { useText } from "../../shared/i18n/useText";
import type { ContractRecord, ContractRequest } from "./contractApi";

const optionalNumber = z.string().trim().refine((value) => !value || !Number.isNaN(Number(value)), "Must be a number");

const contractFormSchema = z.object({
  code: z.string().trim().min(2, "Code is required"),
  contractType: z.enum(["SALE", "LEASE"]),
  currency: z.string().trim().min(3, "Currency is required").max(3, "Use 3 characters"),
  customerId: optionalNumber,
  effectiveDate: z.string().trim().optional(),
  endDate: z.string().trim().optional(),
  listingId: optionalNumber,
  propertyId: optionalNumber,
  startDate: z.string().trim().optional(),
  status: z.enum(["DRAFT", "PENDING_REVIEW", "PENDING_SIGNATURE", "SIGNED", "ACTIVE", "EXPIRED", "CANCELLED", "TERMINATED"]),
  title: z.string().trim().min(2, "Title is required"),
  totalValue: optionalNumber,
  transactionId: optionalNumber
});

export type ContractFormValues = z.infer<typeof contractFormSchema>;

const typeOptions = [
  { label: "Sale", value: "SALE" },
  { label: "Lease", value: "LEASE" }
];

const statusOptions = [
  { label: "Draft", value: "DRAFT" },
  { label: "Pending review", value: "PENDING_REVIEW" },
  { label: "Pending signature", value: "PENDING_SIGNATURE" },
  { label: "Signed", value: "SIGNED" },
  { label: "Active", value: "ACTIVE" },
  { label: "Expired", value: "EXPIRED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Terminated", value: "TERMINATED" }
];

function toNumber(value: string) {
  return value.trim() ? Number(value) : undefined;
}

export function toContractRequest(values: ContractFormValues): ContractRequest {
  return {
    code: values.code.trim(),
    contractType: values.contractType,
    currency: values.currency.trim().toUpperCase(),
    customerId: toNumber(values.customerId),
    effectiveDate: values.effectiveDate || undefined,
    endDate: values.endDate || undefined,
    listingId: toNumber(values.listingId),
    propertyId: toNumber(values.propertyId),
    startDate: values.startDate || undefined,
    status: values.status,
    title: values.title.trim(),
    totalValue: toNumber(values.totalValue),
    transactionId: toNumber(values.transactionId)
  };
}

function toDefaultValues(contract?: ContractRecord): ContractFormValues {
  return {
    code: contract?.code ?? "",
    contractType: contract?.contractType === "LEASE" ? "LEASE" : "SALE",
    currency: contract?.currency ?? "VND",
    customerId: contract?.customerId ? String(contract.customerId) : "",
    effectiveDate: contract?.effectiveDate ?? "",
    endDate: contract?.endDate ?? "",
    listingId: contract?.listingId ? String(contract.listingId) : "",
    propertyId: contract?.propertyId ? String(contract.propertyId) : "",
    startDate: contract?.startDate ?? "",
    status:
      contract?.status === "PENDING_REVIEW" ||
      contract?.status === "PENDING_SIGNATURE" ||
      contract?.status === "SIGNED" ||
      contract?.status === "ACTIVE" ||
      contract?.status === "EXPIRED" ||
      contract?.status === "CANCELLED" ||
      contract?.status === "TERMINATED"
        ? contract.status
        : "DRAFT",
    title: contract?.title ?? "",
    totalValue: contract?.totalValue ? String(contract.totalValue) : "",
    transactionId: contract?.transactionId ? String(contract.transactionId) : ""
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

export function ContractForm({
  contract,
  onSubmit,
  submitLabel
}: {
  contract?: ContractRecord;
  onSubmit: (values: ContractFormValues) => Promise<void>;
  submitLabel: string;
}) {
  const tx = useText();
  const [formError, setFormError] = useState<string | null>(null);
  const defaultValues = useMemo(() => toDefaultValues(contract), [contract]);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError
  } = useForm<ContractFormValues>({
    defaultValues,
    resolver: zodResolver(contractFormSchema)
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
        const localField = field as keyof ContractFormValues;

        if (localField in defaultValues) {
          setError(localField, { message });
        }
      });

      setFormError(normalizedError.message);
    }
  });

  return (
    <form className="property-form" onSubmit={submit}>
      <FormSection title={tx("Basic")}>
        <Input label={tx("Code")} error={errors.code?.message} {...register("code")} />
        <Input label={tx("Title")} error={errors.title?.message} {...register("title")} />
        <Select label={tx("Type")} options={typeOptions.map((option) => ({ ...option, label: tx(option.label) }))} error={errors.contractType?.message} {...register("contractType")} />
        <Select label={tx("Status")} options={statusOptions.map((option) => ({ ...option, label: tx(option.label) }))} error={errors.status?.message} {...register("status")} />
      </FormSection>
      <FormSection title={tx("Value and dates")}>
        <Input label={tx("Total value")} error={errors.totalValue?.message} {...register("totalValue")} />
        <Input
          label={tx("Currency")}
          error={errors.currency?.message}
          onInput={(event) => {
            event.currentTarget.value = event.currentTarget.value.toUpperCase();
          }}
          {...register("currency")}
        />
        <Input label={tx("Effective date")} type="date" error={errors.effectiveDate?.message} {...register("effectiveDate")} />
        <Input label={tx("Start date")} type="date" error={errors.startDate?.message} {...register("startDate")} />
        <Input label={tx("End date")} type="date" error={errors.endDate?.message} {...register("endDate")} />
      </FormSection>
      <FormSection title={tx("Links")}>
        <Input label={tx("Customer id")} error={errors.customerId?.message} {...register("customerId")} />
        <Input label={tx("Property id")} error={errors.propertyId?.message} {...register("propertyId")} />
        <Input label={tx("Listing id")} error={errors.listingId?.message} {...register("listingId")} />
        <Input label={tx("Transaction id")} error={errors.transactionId?.message} {...register("transactionId")} />
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
