import { useEffect, useMemo, useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { Input } from "../../shared/ui/Input";
import { Select } from "../../shared/ui/Select";
import { getLeadSources } from "../master-data/masterDataApi";
import type { CustomerRecord, CustomerUpsertRequest } from "./customerApi";

const optionalNumber = (message: string) =>
  z.string().trim().refine((value) => !value || !Number.isNaN(Number(value)), message);

function createCustomerFormSchema(t: (key: string) => string) {
  return z
    .object({
      assignedAgentId: optionalNumber(t("validation.numberRequired")),
      code: z.string().trim().min(2, t("validation.codeRequired")),
      email: z.string().trim().email(t("validation.validEmail")).or(z.literal("")),
      fullName: z.string().trim().min(2, t("validation.fullNameRequired")),
      notes: z.string().trim().optional(),
      phone: z.string().trim().optional(),
      preferredContactMethod: z.string().trim().optional(),
      priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
      source: z.string().trim().min(1, t("validation.sourceRequired")),
      status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]),
      userId: optionalNumber(t("validation.numberRequired"))
    })
    .superRefine((values, context) => {
      if (!values.email && !values.phone && !values.userId) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("validation.emailOrPhoneOrUserRequired"),
          path: ["email"]
        });
      }
    });
}

export type CustomerFormValues = z.infer<ReturnType<typeof createCustomerFormSchema>>;

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
    source: customer?.source ?? "MANUAL",
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
  const { t } = useTranslation();
  const [formError, setFormError] = useState<string | null>(null);
  const defaultValues = useMemo(() => toDefaultValues(customer), [customer]);
  const customerFormSchema = useMemo(() => createCustomerFormSchema(t), [t]);
  const statusOptions = useMemo(
    () => [
      { label: t("status.active"), value: "ACTIVE" },
      { label: t("status.inactive"), value: "INACTIVE" },
      { label: t("common.archived"), value: "ARCHIVED" }
    ],
    [t]
  );
  const sourceOptions = useMemo(
    () => [
      { label: t("common.manual"), value: "MANUAL" },
      { label: t("common.website"), value: "WEBSITE" },
      { label: t("common.referral"), value: "REFERRAL" },
      { label: t("common.import"), value: "IMPORT" },
      { label: t("common.other"), value: "OTHER" }
    ],
    [t]
  );
  const priorityOptions = useMemo(
    () => [
      { label: t("common.low"), value: "LOW" },
      { label: t("common.medium"), value: "MEDIUM" },
      { label: t("common.high"), value: "HIGH" }
    ],
    [t]
  );
  const contactOptions = useMemo(
    () => [
      { label: t("common.phone"), value: "PHONE" },
      { label: t("common.email"), value: "EMAIL" },
      { label: "Zalo", value: "ZALO" },
      { label: t("common.any"), value: "ANY" }
    ],
    [t]
  );
  const leadSourcesQuery = useQuery({
    queryFn: getLeadSources,
    queryKey: ["master-data", "lead-sources"],
    retry: 1,
    staleTime: 5 * 60 * 1000
  });
  const resolvedSourceOptions = useMemo(() => {
    const options = leadSourcesQuery.data?.length
      ? leadSourcesQuery.data.map((source) => ({
          label: source.name,
          value: source.code
        }))
      : sourceOptions;

    if (defaultValues.source && !options.some((option) => option.value === defaultValues.source)) {
      return [...options, { label: t("common.currentValue", { value: defaultValues.source }), value: defaultValues.source }];
    }

    return options;
  }, [defaultValues.source, leadSourcesQuery.data, sourceOptions, t]);
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
      <FormSection title={t("common.profile")}>
        <Input label={t("common.code")} error={errors.code?.message} {...register("code")} />
        <Input label={t("common.fullName")} error={errors.fullName?.message} {...register("fullName")} />
        <Select label={t("common.status")} options={statusOptions} error={errors.status?.message} {...register("status")} />
        <Select label={t("common.priority")} options={priorityOptions} error={errors.priority?.message} {...register("priority")} />
      </FormSection>
      <FormSection title={t("common.contact")}>
        <Input label={t("common.email")} error={errors.email?.message} {...register("email")} />
        <Input label={t("common.phone")} error={errors.phone?.message} {...register("phone")} />
        <Input label={t("common.userId")} error={errors.userId?.message} {...register("userId")} />
        <Select
          label={t("common.preferredContact")}
          options={contactOptions}
          error={errors.preferredContactMethod?.message}
          {...register("preferredContactMethod")}
        />
      </FormSection>
      <FormSection title={t("customers.ownership")}>
        <Select
          label={t("common.source")}
          options={resolvedSourceOptions}
          error={errors.source?.message}
          disabled={leadSourcesQuery.isLoading}
          {...register("source")}
        />
        <Input label={t("common.assignedAgentId")} error={errors.assignedAgentId?.message} {...register("assignedAgentId")} />
        <Input label={t("common.notes")} error={errors.notes?.message} {...register("notes")} />
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
