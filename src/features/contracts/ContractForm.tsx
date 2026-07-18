import { useEffect, useMemo, useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  Building2,
  Check,
  CircleDollarSign,
  FileText,
  Link,
  Scale,
  Save,
  Tag,
  UserRound
} from "lucide-react";
import { z } from "zod";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { Input } from "../../shared/ui/Input";
import { Select } from "../../shared/ui/Select";
import { useText } from "../../shared/i18n/useText";
import { formatCurrency } from "../../shared/lib/format";
import { searchAdminUsers } from "../admin/adminUserApi";
import { searchCustomers } from "../customers/customerApi";
import { searchListings } from "../listings/listingApi";
import { searchProperties } from "../properties/propertyApi";
import { searchTransactions } from "../transactions/transactionApi";
import type { ContractRecord, ContractRequest } from "./contractApi";

const optionalNumber = z.string().trim().refine((value) => !value || !Number.isNaN(Number(value)), "Must be a number");

const contractFormSchema = z.object({
  agentId: optionalNumber,
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
  specialConditions: z.string().trim().optional(),
  title: z.string().trim().min(2, "Title is required"),
  totalValue: optionalNumber,
  transactionId: optionalNumber
});

export type ContractFormValues = z.infer<typeof contractFormSchema>;
type ContractSubmitIntent = "draft" | "final";

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
    agentId: toNumber(values.agentId),
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
    specialConditions: values.specialConditions?.trim() || undefined,
    title: values.title.trim(),
    totalValue: toNumber(values.totalValue),
    transactionId: toNumber(values.transactionId)
  };
}

function toDefaultValues(contract?: ContractRecord): ContractFormValues {
  return {
    agentId: contract?.agentId != null ? String(contract.agentId) : "",
    code: contract?.code ?? "",
    contractType: contract?.contractType === "LEASE" ? "LEASE" : "SALE",
    currency: contract?.currency ?? "VND",
    customerId: contract?.customerId != null ? String(contract.customerId) : "",
    effectiveDate: contract?.effectiveDate ?? "",
    endDate: contract?.endDate ?? "",
    listingId: contract?.listingId != null ? String(contract.listingId) : "",
    propertyId: contract?.propertyId != null ? String(contract.propertyId) : "",
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
    specialConditions: contract?.specialConditions ?? "",
    title: contract?.title ?? "",
    totalValue: contract?.totalValue != null ? String(contract.totalValue) : "",
    transactionId: contract?.transactionId != null ? String(contract.transactionId) : ""
  };
}

function FormSection({ children, icon, title }: { children: ReactNode; icon: ReactNode; title: string }) {
  return (
    <section className="contract-form-section">
      <h3>{icon}{title}</h3>
      <div className="form-grid">{children}</div>
    </section>
  );
}

function ContractEntityCard({
  icon,
  meta,
  title
}: {
  icon: ReactNode;
  meta: string;
  title: string;
}) {
  return (
    <article className="contract-entity-card">
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <small>{meta}</small>
      </div>
    </article>
  );
}

type SearchSuggestion = {
  id: number | string;
  meta: string;
  title: string;
};

function EntitySearchPicker({
  error,
  loadError,
  items,
  label,
  loading,
  onQueryChange,
  onSelect,
  placeholder,
  query
}: {
  error?: string;
  loadError?: string;
  items: SearchSuggestion[];
  label: string;
  loading: boolean;
  onQueryChange: (value: string) => void;
  onSelect: (item: SearchSuggestion) => void;
  placeholder: string;
  query: string;
}) {
  const tx = useText();
  const [open, setOpen] = useState(false);
  const showSuggestions = open && (loading || Boolean(loadError) || items.length > 0 || Boolean(query.trim()));

  return (
    <div
      className="field contract-search-picker"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <span>{tx(label)}</span>
      <input
        className={error ? "input input-error" : "input"}
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        onFocus={() => setOpen(true)}
        placeholder={tx(placeholder)}
      />
      {showSuggestions ? (
        <div className="contract-search-suggestions">
          {loading ? <p>{tx("Searching...")}</p> : null}
          {!loading && loadError ? <p className="contract-search-error">{loadError}</p> : null}
          {!loading && !loadError && items.length ? items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelect(item);
                setOpen(false);
              }}
            >
              <strong>{item.title}</strong>
              <small>{item.meta}</small>
            </button>
          )) : null}
          {!loading && !loadError && query.trim() && items.length === 0 ? <p>{tx("No suggestions found")}</p> : null}
        </div>
      ) : null}
      {error ? <small className="field-error">{tx(error)}</small> : null}
    </div>
  );
}

export function ContractForm({
  contract,
  onSubmit,
  submitLabel
}: {
  contract?: ContractRecord;
  onSubmit: (values: ContractFormValues, intent: ContractSubmitIntent) => Promise<void>;
  submitLabel: string;
}) {
  const tx = useText();
  const [formError, setFormError] = useState<string | null>(null);
  const [agentSearch, setAgentSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [listingSearch, setListingSearch] = useState("");
  const [propertySearch, setPropertySearch] = useState("");
  const [transactionSearch, setTransactionSearch] = useState("");
  const [autosavedAt] = useState(() =>
    new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date())
  );
  const defaultValues = useMemo(() => toDefaultValues(contract), [contract]);
  const customersQuery = useQuery({
    queryFn: () => searchCustomers({ keyword: customerSearch, page: 0, size: 25, status: "ACTIVE" }),
    queryKey: ["contract-form-customers", customerSearch],
    retry: 1
  });
  const propertiesQuery = useQuery({
    queryFn: () => searchProperties({ keyword: propertySearch, page: 0, size: 25, status: "AVAILABLE" }),
    queryKey: ["contract-form-properties", propertySearch],
    retry: 1
  });
  const listingsQuery = useQuery({
    queryFn: () => searchListings({ keyword: listingSearch, page: 0, size: 25 }),
    queryKey: ["contract-form-listings", listingSearch],
    retry: 1
  });
  const agentsQuery = useQuery({
    queryFn: () => searchAdminUsers({ keyword: agentSearch, page: 0, role: "AGENT", size: 25, status: "ACTIVE" }),
    queryKey: ["contract-form-agents", agentSearch],
    retry: 1
  });
  const transactionsQuery = useQuery({
    queryFn: () => searchTransactions({ keyword: transactionSearch, page: 0, size: 25 }),
    queryKey: ["contract-form-transactions", transactionSearch],
    retry: 1
  });
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
    watch
  } = useForm<ContractFormValues>({
    defaultValues,
    resolver: zodResolver(contractFormSchema)
  });
  const values = watch();
  const completionItems = [
    { done: Boolean(values.code && values.title && values.contractType), label: "Particulars" },
    { done: Boolean(values.customerId && values.propertyId), label: "Entities linked" },
    { done: Boolean(values.totalValue && values.currency && values.effectiveDate), label: "Financials" },
    { done: Boolean(values.specialConditions?.trim()), label: "Terms" }
  ];
  const completionPercent = Math.round(
    (completionItems.filter((item) => item.done).length / completionItems.length) * 100
  );
  const selectedCustomer = customersQuery.data?.content.find((customer) => String(customer.id) === values.customerId);
  const selectedProperty = propertiesQuery.data?.content.find((property) => String(property.id) === values.propertyId);
  const selectedListing = listingsQuery.data?.content.find((listing) => String(listing.id) === values.listingId);
  const selectedAgent = agentsQuery.data?.content.find((agent) => String(agent.id) === values.agentId);
  const selectedTransaction = transactionsQuery.data?.content.find((transaction) => String(transaction.id) === values.transactionId);
  const propertyLoadError = propertiesQuery.error ? normalizeUnknownError(propertiesQuery.error).message : undefined;
  const customerLoadError = customersQuery.error ? normalizeUnknownError(customersQuery.error).message : undefined;
  const listingLoadError = listingsQuery.error ? normalizeUnknownError(listingsQuery.error).message : undefined;
  const agentLoadError = agentsQuery.error ? normalizeUnknownError(agentsQuery.error).message : undefined;
  const transactionLoadError = transactionsQuery.error ? normalizeUnknownError(transactionsQuery.error).message : undefined;
  const propertyCard = selectedProperty
    ? {
        meta: [selectedProperty.code, selectedProperty.address.fullAddress].filter(Boolean).join(" / "),
        title: selectedProperty.name
      }
    : values.propertyId
      ? {
          meta: contract?.propertyAddress || "Property metadata is updating",
          title: `Selected property #${values.propertyId}`
        }
      : null;
  const customerCard = selectedCustomer
    ? {
        meta: [selectedCustomer.code, selectedCustomer.phone || selectedCustomer.email].filter(Boolean).join(" / "),
        title: selectedCustomer.fullName
      }
    : values.customerId
      ? {
          meta: "Customer metadata is updating",
          title: `Selected customer #${values.customerId}`
        }
      : null;
  const listingCard = selectedListing
    ? {
        meta: [selectedListing.code, selectedListing.status, selectedListing.property?.name].filter(Boolean).join(" / "),
        title: selectedListing.title
      }
    : values.listingId
      ? {
          meta: "Listing metadata is updating",
          title: `Selected listing #${values.listingId}`
        }
      : null;
  const agentCard = selectedAgent
    ? {
        meta: [selectedAgent.email, selectedAgent.phone].filter(Boolean).join(" / "),
        title: selectedAgent.fullName
      }
    : values.agentId
      ? {
          meta: "Agent metadata is updating",
          title: `Selected agent #${values.agentId}`
        }
      : null;
  const transactionCard = selectedTransaction
    ? {
        meta: [selectedTransaction.code, selectedTransaction.status].filter(Boolean).join(" / "),
        title: selectedTransaction.title
      }
    : values.transactionId
      ? {
          meta: "Transaction metadata is updating",
          title: `Selected transaction #${values.transactionId}`
        }
      : null;
  const displayValue = values.totalValue !== "" && !Number.isNaN(Number(values.totalValue))
    ? formatCurrency(Number(values.totalValue), values.currency || "USD")
    : "Value updating";

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    if (selectedProperty && !propertySearch) {
      setPropertySearch(selectedProperty.name);
    }
  }, [propertySearch, selectedProperty]);

  useEffect(() => {
    if (selectedCustomer && !customerSearch) {
      setCustomerSearch(selectedCustomer.fullName);
    }
  }, [customerSearch, selectedCustomer]);

  useEffect(() => {
    if (selectedListing && !listingSearch) {
      setListingSearch(selectedListing.title);
    }
  }, [listingSearch, selectedListing]);

  useEffect(() => {
    if (selectedAgent && !agentSearch) {
      setAgentSearch(selectedAgent.fullName);
    }
  }, [agentSearch, selectedAgent]);

  useEffect(() => {
    if (selectedTransaction && !transactionSearch) {
      setTransactionSearch(selectedTransaction.title);
    }
  }, [selectedTransaction, transactionSearch]);

  function resetFormToDefaults() {
    reset(defaultValues);
    setAgentSearch("");
    setCustomerSearch("");
    setListingSearch("");
    setPropertySearch("");
    setTransactionSearch("");
  }

  function selectEntity(field: "agentId" | "customerId" | "listingId" | "propertyId" | "transactionId", item: SearchSuggestion) {
    setValue(field, String(item.id), {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });

    if (field === "agentId") {
      setAgentSearch(item.title);
    }

    if (field === "customerId") {
      setCustomerSearch(item.title);
    }

    if (field === "listingId") {
      setListingSearch(item.title);
    }

    if (field === "propertyId") {
      setPropertySearch(item.title);
    }

    if (field === "transactionId") {
      setTransactionSearch(item.title);
    }
  }

  const submit = handleSubmit(async (values, event) => {
    setFormError(null);

    try {
      const submitter = (event?.nativeEvent as SubmitEvent | undefined)?.submitter as HTMLElement | null | undefined;
      const intent = submitter?.getAttribute("value") === "draft" ? "draft" : "final";
      const submittedValues = intent === "draft" ? { ...values, status: "DRAFT" as const } : values;

      await onSubmit(submittedValues, intent);
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
    <form id="contract-editor-form" className="contract-editor-form" onSubmit={submit}>
      <div className="contract-editor-grid">
        <main className="contract-editor-main">
          <FormSection icon={<FileText size={16} />} title={tx("Contract Particulars")}>
            <Input label={tx("Code")} error={errors.code?.message} {...register("code")} />
            <Input label={tx("Title")} error={errors.title?.message} {...register("title")} />
            <Select label={tx("Type")} options={typeOptions.map((option) => ({ ...option, label: tx(option.label) }))} error={errors.contractType?.message} {...register("contractType")} />
            <Select label={tx("Status")} options={statusOptions.map((option) => ({ ...option, label: tx(option.label) }))} error={errors.status?.message} {...register("status")} />
          </FormSection>

          <FormSection icon={<Link size={16} />} title={tx("Entity Linking")}>
            <input type="hidden" {...register("propertyId")} />
            <input type="hidden" {...register("customerId")} />
            <input type="hidden" {...register("listingId")} />
            <input type="hidden" {...register("agentId")} />
            <input type="hidden" {...register("transactionId")} />
            <EntitySearchPicker
              label="Property"
              query={propertySearch}
              onQueryChange={(value) => {
                setPropertySearch(value);
                setValue("propertyId", "", { shouldDirty: true, shouldValidate: true });
              }}
              placeholder="Search and choose property"
              loading={propertiesQuery.isFetching}
              loadError={propertyLoadError}
              items={(propertiesQuery.data?.content ?? []).map((property) => ({
                id: property.id,
                meta: [property.code, property.address.fullAddress].filter(Boolean).join(" / "),
                title: property.name
              }))}
              onSelect={(item) => selectEntity("propertyId", item)}
              error={errors.propertyId?.message}
            />
            <EntitySearchPicker
              label="Customer"
              query={customerSearch}
              onQueryChange={(value) => {
                setCustomerSearch(value);
                setValue("customerId", "", { shouldDirty: true, shouldValidate: true });
              }}
              placeholder="Search and choose customer"
              loading={customersQuery.isFetching}
              loadError={customerLoadError}
              items={(customersQuery.data?.content ?? []).map((customer) => ({
                id: customer.id,
                meta: [customer.code, customer.phone || customer.email].filter(Boolean).join(" / "),
                title: customer.fullName
              }))}
              onSelect={(item) => selectEntity("customerId", item)}
              error={errors.customerId?.message}
            />
            <EntitySearchPicker
              label="Listing"
              query={listingSearch}
              onQueryChange={(value) => {
                setListingSearch(value);
                setValue("listingId", "", { shouldDirty: true, shouldValidate: true });
              }}
              placeholder="Search and choose listing"
              loading={listingsQuery.isFetching}
              loadError={listingLoadError}
              items={(listingsQuery.data?.content ?? []).map((listing) => ({
                id: listing.id,
                meta: [listing.code, listing.status, listing.property?.name].filter(Boolean).join(" / "),
                title: listing.title
              }))}
              onSelect={(item) => selectEntity("listingId", item)}
              error={errors.listingId?.message}
            />
            <EntitySearchPicker
              label="Agent"
              query={agentSearch}
              onQueryChange={(value) => {
                setAgentSearch(value);
                setValue("agentId", "", { shouldDirty: true, shouldValidate: true });
              }}
              placeholder="Search and choose agent"
              loading={agentsQuery.isFetching}
              loadError={agentLoadError}
              items={(agentsQuery.data?.content ?? []).map((agent) => ({
                id: agent.id,
                meta: [agent.email, agent.phone].filter(Boolean).join(" / "),
                title: agent.fullName
              }))}
              onSelect={(item) => selectEntity("agentId", item)}
              error={errors.agentId?.message}
            />
            <div className="contract-selected-entities">
              {propertyCard ? (
                <ContractEntityCard
                  icon={<Building2 size={18} />}
                  title={propertyCard.title}
                  meta={propertyCard.meta}
                />
              ) : null}
              {customerCard ? (
                <ContractEntityCard
                  icon={<UserRound size={18} />}
                  title={customerCard.title}
                  meta={customerCard.meta}
                />
              ) : null}
              {listingCard ? (
                <ContractEntityCard
                  icon={<Tag size={18} />}
                  title={listingCard.title}
                  meta={listingCard.meta}
                />
              ) : null}
              {agentCard ? (
                <ContractEntityCard
                  icon={<UserRound size={18} />}
                  title={agentCard.title}
                  meta={agentCard.meta}
                />
              ) : null}
              {transactionCard ? (
                <ContractEntityCard
                  icon={<CircleDollarSign size={18} />}
                  title={transactionCard.title}
                  meta={transactionCard.meta}
                />
              ) : null}
            </div>
          </FormSection>

          <FormSection icon={<CircleDollarSign size={16} />} title={tx("Financials & Timeline")}>
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
            <EntitySearchPicker
              label="Transaction"
              query={transactionSearch}
              onQueryChange={(value) => {
                setTransactionSearch(value);
                setValue("transactionId", "", { shouldDirty: true, shouldValidate: true });
              }}
              placeholder="Search and choose transaction"
              loading={transactionsQuery.isFetching}
              loadError={transactionLoadError}
              items={(transactionsQuery.data?.content ?? []).map((transaction) => ({
                id: transaction.id,
                meta: [transaction.code, transaction.status].filter(Boolean).join(" / "),
                title: transaction.title
              }))}
              onSelect={(item) => selectEntity("transactionId", item)}
              error={errors.transactionId?.message}
            />
          </FormSection>

          <section className="contract-form-section contract-terms-section">
            <h3><Scale size={16} />{tx("Terms & Conditions")}</h3>
            <label className="field" htmlFor="specialConditions">
              <span>{tx("Special Conditions")}</span>
              <textarea
                id="specialConditions"
                className="input textarea contract-terms-editor"
                placeholder={tx("Add payment milestones, handover clauses, approval notes, and other conditions.")}
                {...register("specialConditions")}
              />
            </label>
          </section>

          {formError ? <p className="form-alert">{formError}</p> : null}
        </main>

        <aside className="contract-editor-side">
          <section className="contract-preview-card">
            <div className="contract-preview-document">
              <span />
              <strong>{values.code || "CTR-DRAFT"}</strong>
              <p>{values.title || "Contract title preview"}</p>
              <small>{displayValue}</small>
            </div>
          </section>

          <section className="contract-utility-card">
            <div className="contract-card-heading">
              <p className="contract-section-title">Completion Status</p>
              <strong>{completionPercent}% READY</strong>
            </div>
            <div className="contract-progress"><span style={{ width: `${completionPercent}%` }} /></div>
            <div className="contract-completion-list">
              {completionItems.map((item) => (
                <span key={item.label} className={item.done ? "is-complete" : undefined}>
                  <Check size={14} />
                  {item.label}
                </span>
              ))}
            </div>
          </section>

          <section className="contract-validation-card">
            <strong>Approval check</strong>
            <p>Contracts above the configured approval limit should be reviewed before final generation.</p>
          </section>

          <section className="contract-utility-card contract-stat-grid">
            <div><span>Properties Found</span><strong>{propertiesQuery.data?.totalElements ?? "--"}</strong></div>
            <div><span>Customers Found</span><strong>{customersQuery.data?.totalElements ?? "--"}</strong></div>
            <div><span>Listings Found</span><strong>{listingsQuery.data?.totalElements ?? "--"}</strong></div>
            <div><span>Agents Found</span><strong>{agentsQuery.data?.totalElements ?? "--"}</strong></div>
            <div><span>Transactions Found</span><strong>{transactionsQuery.data?.totalElements ?? "--"}</strong></div>
          </section>
        </aside>
      </div>

      <footer className="contract-form-actionbar">
        <span>Autosaved at {autosavedAt}</span>
        <div>
          <Button type="button" variant="secondary" onClick={resetFormToDefaults}>
            {tx("Discard Changes")}
          </Button>
          <Button type="submit" name="intent" value="final" disabled={isSubmitting}>
            <Save size={16} />
            {submitLabel}
          </Button>
        </div>
      </footer>
    </form>
  );
}
