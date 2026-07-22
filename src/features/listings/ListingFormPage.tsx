import { useEffect, useMemo, useState, type ReactNode, type TextareaHTMLAttributes } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Save, UploadCloud, XCircle } from "lucide-react";
import { z } from "zod";
import { normalizeUnknownError } from "../../shared/api/errors";
import { useAuth } from "../../shared/auth/useAuth";
import { Button } from "../../shared/ui/Button";
import { Dialog } from "../../shared/ui/Dialog";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Input } from "../../shared/ui/Input";
import { Select } from "../../shared/ui/Select";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { formatCurrency } from "../../shared/lib/format";
import type { RoleCode } from "../../shared/types/auth";
import {
  createListing,
  getListing,
  runListingWorkflowAction,
  updateListing,
  type ListingCreateRequest,
  type ListingRecord,
  type ListingUpdateRequest,
  type ListingWorkflowAction
} from "./listingApi";
import { getListingPackages } from "../master-data/masterDataApi";
import { searchProperties } from "../properties/propertyApi";

const optionalNumber = z.string().trim().refine((value) => !value || !Number.isNaN(Number(value)), "Must be a number");
const requiredNumber = z.string().trim().min(1, "Required").refine((value) => !Number.isNaN(Number(value)), "Must be a number");

const listingFormSchema = z.object({
  askingPrice: requiredNumber,
  code: z.string().trim().min(2, "Code is required"),
  currency: z.string().trim().min(3, "Currency is required").max(3, "Use 3 characters"),
  description: z.string().trim().min(10, "Description is required"),
  listingPackageId: optionalNumber,
  propertyId: requiredNumber,
  purpose: z.enum(["SALE", "RENT"]),
  seoDescription: z.string().trim().optional(),
  seoKeywords: z.string().trim().optional(),
  seoTitle: z.string().trim().optional(),
  slug: z.string().trim().min(2, "Slug is required"),
  title: z.string().trim().min(2, "Title is required"),
  visibility: z.enum(["PUBLIC", "PRIVATE", "UNLISTED"])
});

type ListingFormValues = z.infer<typeof listingFormSchema>;

const purposeOptions = [
  { label: "Sale", value: "SALE" },
  { label: "Rent", value: "RENT" }
];

const visibilityOptions = [
  { label: "Public", value: "PUBLIC" },
  { label: "Private", value: "PRIVATE" },
  { label: "Unlisted", value: "UNLISTED" }
];

const workflowActionLabels: Record<ListingWorkflowAction, string> = {
  approve: "Approve",
  publish: "Publish",
  reject: "Reject",
  submit: "Submit review",
  unpublish: "Unpublish"
};

type PropertySuggestion = {
  id: number | string;
  meta: string;
  title: string;
};

function toNumber(value: string) {
  return value.trim() ? Number(value) : undefined;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toDefaultValues(listing: ListingRecord | null, propertyId: string): ListingFormValues {
  return {
    askingPrice: listing?.askingPrice ? String(listing.askingPrice) : "",
    code: listing?.code ?? "",
    currency: listing?.currency ?? "VND",
    description: listing?.description ?? "",
    listingPackageId: listing?.listingPackageId ? String(listing.listingPackageId) : "",
    propertyId: listing?.propertyId ? String(listing.propertyId) : propertyId,
    purpose: listing?.purpose ?? "SALE",
    seoDescription: listing?.seoDescription ?? "",
    seoKeywords: listing?.seoKeywords ?? "",
    seoTitle: listing?.seoTitle ?? "",
    slug: listing?.slug ?? "",
    title: listing?.title ?? "",
    visibility: listing?.visibility === "PRIVATE" || listing?.visibility === "UNLISTED" ? listing.visibility : "PUBLIC"
  };
}

function toCreateRequest(values: ListingFormValues): ListingCreateRequest {
  const listingPackageId = toNumber(values.listingPackageId);

  return {
    askingPrice: Number(values.askingPrice),
    code: values.code.trim(),
    currency: values.currency.trim().toUpperCase(),
    description: values.description.trim(),
    listingPackageId,
    propertyId: Number(values.propertyId),
    purpose: values.purpose,
    seoDescription: values.seoDescription || undefined,
    seoKeywords: values.seoKeywords || undefined,
    seoTitle: values.seoTitle || undefined,
    slug: values.slug.trim(),
    title: values.title.trim(),
    visibility: values.visibility
  };
}

function toUpdateRequest(values: ListingFormValues): ListingUpdateRequest {
  const listingPackageId = toNumber(values.listingPackageId);

  return {
    askingPrice: Number(values.askingPrice),
    currency: values.currency.trim().toUpperCase(),
    description: values.description.trim(),
    listingPackageId,
    purpose: values.purpose,
    seoDescription: values.seoDescription || undefined,
    seoKeywords: values.seoKeywords || undefined,
    seoTitle: values.seoTitle || undefined,
    slug: values.slug.trim(),
    title: values.title.trim(),
    visibility: values.visibility
  };
}

function hasAnyRole(roles: RoleCode[], allowedRoles: RoleCode[]) {
  return roles.some((role) => allowedRoles.includes(role));
}

function getAvailableWorkflowActions(status: string, roles: RoleCode[]) {
  const normalizedStatus = status || "DRAFT";
  const canAgentAct = hasAnyRole(roles, ["ADMIN", "MANAGER", "AGENT"]);
  const canReview = hasAnyRole(roles, ["ADMIN", "MANAGER"]);
  const actions: ListingWorkflowAction[] = [];

  if (canAgentAct && ["DRAFT", "REJECTED", "UNPUBLISHED"].includes(normalizedStatus)) {
    actions.push("submit");
  }

  if (canReview && normalizedStatus === "PENDING_REVIEW") {
    actions.push("approve", "reject");
  }

  if (canAgentAct && ["APPROVED", "UNPUBLISHED"].includes(normalizedStatus)) {
    actions.push("publish");
  }

  if (canAgentAct && normalizedStatus === "PUBLISHED") {
    actions.push("unpublish");
  }

  return actions;
}

function statusTone(status: string) {
  if (status === "PUBLISHED" || status === "APPROVED") {
    return "success";
  }

  if (status === "PENDING_REVIEW") {
    return "warning";
  }

  if (status === "REJECTED") {
    return "danger";
  }

  return "neutral";
}

function TextareaField({
  error,
  label,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string; label: string }) {
  const textareaId = props.id ?? props.name;

  return (
    <label className="field" htmlFor={textareaId}>
      <span>{label}</span>
      <textarea id={textareaId} className={error ? "input input-error textarea" : "input textarea"} {...props} />
      {error ? <small className="field-error">{error}</small> : null}
    </label>
  );
}

function PropertySearchPicker({
  disabled,
  error,
  items,
  loadError,
  loading,
  onQueryChange,
  onSelect,
  query
}: {
  disabled?: boolean;
  error?: string;
  items: PropertySuggestion[];
  loadError?: string;
  loading: boolean;
  onQueryChange: (value: string) => void;
  onSelect: (item: PropertySuggestion) => void;
  query: string;
}) {
  const [open, setOpen] = useState(false);
  const showSuggestions = !disabled && open && (loading || Boolean(loadError) || items.length > 0 || Boolean(query.trim()));

  return (
    <div
      className="field listing-property-picker"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <span>Property</span>
      <input
        className={error ? "input input-error" : "input"}
        disabled={disabled}
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        onFocus={() => setOpen(true)}
        placeholder="Type property name, code, or address"
      />
      {showSuggestions ? (
        <div className="listing-property-suggestions">
          {loading ? <p>Searching...</p> : null}
          {!loading && loadError ? <p className="listing-property-search-error">{loadError}</p> : null}
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
          {!loading && !loadError && query.trim() && items.length === 0 ? <p>No suggestions found</p> : null}
        </div>
      ) : null}
      {error ? <small className="field-error">{error}</small> : null}
    </div>
  );
}

function ListingEditorCard({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="listing-editor-card">
      <h3>{title}</h3>
      <div className="form-grid">{children}</div>
    </section>
  );
}

export function ListingFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isEditMode = Boolean(id);
  const [workflowListing, setWorkflowListing] = useState<ListingRecord | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingWorkflowAction, setPendingWorkflowAction] = useState<ListingWorkflowAction | null>(null);
  const [propertySearch, setPropertySearch] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const listingQuery = useQuery({
    enabled: isEditMode,
    queryFn: () => getListing(id ?? ""),
    queryKey: ["listing", id],
    retry: 1
  });
  const packagesQuery = useQuery({
    queryFn: getListingPackages,
    queryKey: ["master-data", "listing-packages"],
    retry: 1,
    staleTime: 5 * 60 * 1000
  });
  const propertiesQuery = useQuery({
    enabled: !isEditMode,
    queryFn: () => searchProperties({ keyword: propertySearch, page: 0, size: 25, status: "AVAILABLE" }),
    queryKey: ["listing-form-properties", propertySearch],
    retry: 1
  });
  const defaultValues = useMemo(
    () => toDefaultValues(workflowListing, searchParams.get("propertyId") ?? ""),
    [searchParams, workflowListing]
  );
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
    watch
  } = useForm<ListingFormValues>({
    defaultValues,
    resolver: zodResolver(listingFormSchema)
  });
  const watchedValues = watch();
  const saveMutation = useMutation({
    mutationFn: (values: ListingFormValues) =>
      isEditMode ? updateListing(id ?? "", toUpdateRequest(values)) : createListing(toCreateRequest(values)),
    onSuccess: (saved) => {
      persistWorkflowListing(saved);
    }
  });
  const workflowMutation = useMutation({
    mutationFn: ({ action, reason }: { action: ListingWorkflowAction; reason?: string }) => {
      if (!workflowListing) {
        throw new Error("Listing workflow state is not available.");
      }

      return runListingWorkflowAction({ action, current: workflowListing, reason });
    },
    onSuccess: (saved) => {
      persistWorkflowListing(saved);
      setPendingWorkflowAction(null);
      setRejectReason("");
    }
  });
  const availableWorkflowActions = workflowListing
    ? getAvailableWorkflowActions(workflowListing.status, user?.roles ?? [])
    : [];
  const normalizedActionError = workflowMutation.error ? normalizeUnknownError(workflowMutation.error) : null;
  const listingLoadError = listingQuery.error ? normalizeUnknownError(listingQuery.error) : null;
  const propertyLoadError = propertiesQuery.error ? normalizeUnknownError(propertiesQuery.error).message : undefined;
  const listingPackageOptions = useMemo(() => {
    const options = [
      { label: "No package", value: "" },
      ...(packagesQuery.data ?? []).map((item) => ({
        label: `${item.name}${item.price ? ` / ${item.price.toLocaleString("vi-VN")} ${item.currency ?? "VND"}` : ""}`,
        value: String(item.id)
      }))
    ];

    if (
      workflowListing?.listingPackageId &&
      !options.some((option) => option.value === String(workflowListing.listingPackageId))
    ) {
      options.push({
        label: workflowListing.listingPackage?.name ?? `Package #${workflowListing.listingPackageId}`,
        value: String(workflowListing.listingPackageId)
      });
    }

    return options;
  }, [packagesQuery.data, workflowListing?.listingPackage?.name, workflowListing?.listingPackageId]);

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    if (listingQuery.data) {
      setWorkflowListing(listingQuery.data);
    }
  }, [listingQuery.data]);

  useEffect(() => {
    if (workflowListing?.property) {
      setPropertySearch(
        [workflowListing.property.code, workflowListing.property.name, workflowListing.property.address]
          .filter(Boolean)
          .join(" / ")
      );
    }
  }, [workflowListing?.property]);

  function persistWorkflowListing(saved: ListingRecord) {
    setWorkflowListing(saved);
    queryClient.setQueryData(["listing", String(saved.id)], saved);
    void queryClient.invalidateQueries({ queryKey: ["listings"] });
  }

  function applyGeneratedSlug() {
    setValue("slug", slugify(watchedValues.title), { shouldDirty: true, shouldValidate: true });
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      const saved = await saveMutation.mutateAsync(values);
      navigate(`/listings/${saved.id}/edit`, { replace: true });
    } catch (error) {
      const normalizedError = normalizeUnknownError(error);

      Object.entries(normalizedError.fieldErrors).forEach(([field, message]) => {
        const localField = field as keyof ListingFormValues;

        if (localField in defaultValues) {
          setError(localField, { message });
        }
      });

      setFormError(normalizedError.message);
    }
  });

  function confirmWorkflowAction() {
    if (!pendingWorkflowAction) {
      return;
    }

    workflowMutation.mutate({
      action: pendingWorkflowAction,
      reason: pendingWorkflowAction === "reject" ? rejectReason.trim() : undefined
    });
  }

  if (isEditMode && !workflowListing) {
    return (
      <section className="content-section">
        {listingQuery.isLoading ? (
          <EmptyState title="Loading listing" description="Fetching internal listing detail." />
        ) : (
          <EmptyState
            title="Listing could not be loaded"
            description={listingLoadError?.message ?? "The internal listing detail endpoint did not return this listing."}
            action={<Button onClick={() => listingQuery.refetch()}>Retry</Button>}
          />
        )}
      </section>
    );
  }

  const canPublish = availableWorkflowActions.includes("publish");

  return (
    <section className="listing-form-page">
      <Button asChild variant="ghost" size="sm">
        <Link to="/listings">
          <ArrowLeft size={16} />
          Back to listings
        </Link>
      </Button>
      <div className="listing-form-header">
        <div>
          <p className="eyebrow">Listings</p>
          <h2>{isEditMode ? "Edit Listing" : "Create New Listing"}</h2>
          {workflowListing ? <StatusBadge tone={statusTone(workflowListing.status)}>{workflowListing.status}</StatusBadge> : null}
        </div>
        <div className="listing-form-top-actions">
          <Button type="submit" form="listing-editor-form" variant="secondary" disabled={isSubmitting || saveMutation.isPending}>
            <Save size={16} />
            Save Draft
          </Button>
          <Button
            type="button"
            disabled={!workflowListing || !canPublish || workflowMutation.isPending}
            onClick={() => setPendingWorkflowAction("publish")}
          >
            <UploadCloud size={16} />
            Publish Listing
          </Button>
        </div>
      </div>
      {normalizedActionError ? <p className="form-alert">{normalizedActionError.message}</p> : null}
      <div className="listing-editor-layout">
        <form id="listing-editor-form" className="listing-editor-main" onSubmit={onSubmit}>
          <ListingEditorCard title="Target Asset">
            <input type="hidden" {...register("propertyId")} />
            <PropertySearchPicker
              disabled={isEditMode}
              error={errors.propertyId?.message}
              query={
                isEditMode
                  ? propertySearch || workflowListing?.property?.name || (watchedValues.propertyId ? `#${watchedValues.propertyId}` : "")
                  : propertySearch
              }
              onQueryChange={(value) => {
                setPropertySearch(value);
                setValue("propertyId", "", { shouldDirty: true, shouldValidate: true });
              }}
              loading={propertiesQuery.isFetching}
              loadError={propertyLoadError}
              items={(propertiesQuery.data?.content ?? []).map((property) => ({
                id: property.id,
                meta: [property.code, property.address.fullAddress].filter(Boolean).join(" / "),
                title: property.name
              }))}
              onSelect={(item) => {
                setValue("propertyId", String(item.id), { shouldDirty: true, shouldValidate: true });
                setPropertySearch([item.title, item.meta].filter(Boolean).join(" / "));
              }}
            />
            <Input label="Listing Code" error={errors.code?.message} readOnly={isEditMode} {...register("code")} />
            <Select
              label="Listing Package"
              options={listingPackageOptions}
              error={errors.listingPackageId?.message}
              disabled={packagesQuery.isLoading}
              {...register("listingPackageId")}
            />
            <Select label="Visibility" options={visibilityOptions} error={errors.visibility?.message} {...register("visibility")} />
          </ListingEditorCard>
          <ListingEditorCard title="Listing Content">
            <Input label="Title" error={errors.title?.message} {...register("title")} />
            <Input label="Slug" error={errors.slug?.message} {...register("slug")} />
            <div className="field field-button-align">
              <Button type="button" variant="secondary" onClick={applyGeneratedSlug} disabled={!watchedValues.title}>
                Generate slug
              </Button>
            </div>
            <TextareaField label="Description" rows={7} error={errors.description?.message} {...register("description")} />
          </ListingEditorCard>
          <ListingEditorCard title="Pricing & Terms">
            <Select label="Purpose" options={purposeOptions} error={errors.purpose?.message} {...register("purpose")} />
            <Input label="Asking Price" error={errors.askingPrice?.message} {...register("askingPrice")} />
            <Input
              label="Currency"
              error={errors.currency?.message}
              onInput={(event) => {
                event.currentTarget.value = event.currentTarget.value.toUpperCase();
              }}
              {...register("currency")}
            />
          </ListingEditorCard>
          <ListingEditorCard title="SEO">
            <Input label="SEO Title" error={errors.seoTitle?.message} {...register("seoTitle")} />
            <Input label="SEO Keywords" error={errors.seoKeywords?.message} {...register("seoKeywords")} />
            <TextareaField label="SEO Description" rows={3} error={errors.seoDescription?.message} {...register("seoDescription")} />
          </ListingEditorCard>
          {workflowListing && availableWorkflowActions.length ? (
            <section className="listing-editor-card">
              <h3>Workflow Actions</h3>
              <div className="listing-action-buttons">
                {availableWorkflowActions.map((action) => (
                  <Button
                    key={action}
                    type="button"
                    variant={action === "reject" ? "danger" : "secondary"}
                    disabled={workflowMutation.isPending}
                    onClick={() => setPendingWorkflowAction(action)}
                  >
                    {action === "reject" ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                    {workflowActionLabels[action]}
                  </Button>
                ))}
              </div>
            </section>
          ) : null}
          {formError ? <p className="form-alert">{formError}</p> : null}
        </form>
        <aside className="listing-preview-panel">
          <div className="listing-preview-media">
            <span>{watchedValues.purpose}</span>
          </div>
          <div className="listing-preview-body">
            <p className="eyebrow">Live Preview</p>
            <h3>{watchedValues.title || "Listing title"}</h3>
            <p>{workflowListing?.property?.address || workflowListing?.property?.name || `Property #${watchedValues.propertyId || "-"}`}</p>
            <strong>
              {watchedValues.askingPrice && !Number.isNaN(Number(watchedValues.askingPrice))
                ? formatCurrency(Number(watchedValues.askingPrice), watchedValues.currency || "VND")
                : "-"}
            </strong>
            <p>{watchedValues.description || "Description preview updates as you type."}</p>
          </div>
        </aside>
      </div>
      <Dialog
        open={Boolean(pendingWorkflowAction)}
        onClose={() => setPendingWorkflowAction(null)}
        title={`${pendingWorkflowAction ? workflowActionLabels[pendingWorkflowAction] : "Run"} listing`}
      >
        <div className="dialog-body">
          <p>
            Confirm {pendingWorkflowAction ? workflowActionLabels[pendingWorkflowAction].toLowerCase() : "this action"} for
            listing {workflowListing?.code ?? workflowListing?.id}?
          </p>
          {pendingWorkflowAction === "reject" ? (
            <TextareaField
              label="Reject reason"
              rows={4}
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="Explain what needs to be changed"
            />
          ) : null}
        </div>
        <footer className="dialog-actions">
          <Button variant="secondary" onClick={() => setPendingWorkflowAction(null)}>
            Cancel
          </Button>
          <Button
            variant={pendingWorkflowAction === "reject" ? "danger" : "primary"}
            onClick={confirmWorkflowAction}
            disabled={
              workflowMutation.isPending ||
              (pendingWorkflowAction === "reject" && !rejectReason.trim())
            }
          >
            Confirm
          </Button>
        </footer>
      </Dialog>
    </section>
  );
}
