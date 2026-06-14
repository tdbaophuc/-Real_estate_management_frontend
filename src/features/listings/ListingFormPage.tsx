import { useEffect, useMemo, useState, type ReactNode, type TextareaHTMLAttributes } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { z } from "zod";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Input } from "../../shared/ui/Input";
import { Select } from "../../shared/ui/Select";
import {
  createListing,
  updateListing,
  type ListingCreateRequest,
  type ListingRecord,
  type ListingUpdateRequest
} from "./listingApi";
import { getStoredListing, saveListingWorkflowState } from "./listingWorkflowState";

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
  return toCreateRequest(values);
}

function FormSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="form-section">
      <h3>{title}</h3>
      <div className="form-grid">{children}</div>
    </section>
  );
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

export function ListingFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);
  const cachedListing = id
    ? queryClient.getQueryData<ListingRecord>(["listing-workflow", id])
    : null;
  const storedListing = id ? getStoredListing(id) : null;
  const workflowListing = cachedListing ?? storedListing;
  const defaultValues = useMemo(
    () => toDefaultValues(workflowListing, searchParams.get("propertyId") ?? ""),
    [searchParams, workflowListing]
  );
  const [formError, setFormError] = useState<string | null>(null);
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
  const saveMutation = useMutation({
    mutationFn: (values: ListingFormValues) =>
      isEditMode ? updateListing(id ?? "", toUpdateRequest(values)) : createListing(toCreateRequest(values))
  });
  const title = watch("title");

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  function applyGeneratedSlug() {
    setValue("slug", slugify(title), { shouldDirty: true, shouldValidate: true });
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      const saved = await saveMutation.mutateAsync(values);
      queryClient.setQueryData(["listing-workflow", saved.id], saved);
      saveListingWorkflowState(saved);
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

  if (isEditMode && !workflowListing) {
    return (
      <section className="content-section">
        <EmptyState
          title="Listing edit state not available"
          description="The backend does not expose an internal listing detail endpoint yet. Continue from a listing created or updated in this browser session."
          action={
            <Button asChild>
              <Link to="/listings/new">Create listing</Link>
            </Button>
          }
        />
      </section>
    );
  }

  return (
    <section>
      <Button asChild variant="ghost" size="sm">
        <Link to="/listings">
          <ArrowLeft size={16} />
          Back to listings
        </Link>
      </Button>
      <div className="section-header">
        <div>
          <p className="eyebrow">Listings</p>
          <h2>{isEditMode ? "Edit listing draft" : "Create listing"}</h2>
        </div>
      </div>
      {workflowListing ? (
        <section className="content-section listing-workflow-summary">
          <div>
            <span>Current workflow response</span>
            <strong>{workflowListing.code}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>{workflowListing.status}</strong>
          </div>
          <div>
            <span>Listing id</span>
            <strong>{workflowListing.id}</strong>
          </div>
        </section>
      ) : null}
      <form className="property-form" onSubmit={onSubmit}>
        <FormSection title="Listing source">
          <Input label="Property id" error={errors.propertyId?.message} {...register("propertyId")} />
          <Input label="Listing package id" error={errors.listingPackageId?.message} {...register("listingPackageId")} />
          <Select label="Purpose" options={purposeOptions} error={errors.purpose?.message} {...register("purpose")} />
          <Select label="Visibility" options={visibilityOptions} error={errors.visibility?.message} {...register("visibility")} />
        </FormSection>
        <FormSection title="Content">
          <Input label="Code" error={errors.code?.message} {...register("code")} />
          <Input label="Title" error={errors.title?.message} {...register("title")} />
          <Input label="Slug" error={errors.slug?.message} {...register("slug")} />
          <div className="field field-button-align">
            <Button type="button" variant="secondary" onClick={applyGeneratedSlug} disabled={!title}>
              Generate slug
            </Button>
          </div>
          <TextareaField label="Description" rows={5} error={errors.description?.message} {...register("description")} />
        </FormSection>
        <FormSection title="Pricing">
          <Input label="Asking price" error={errors.askingPrice?.message} {...register("askingPrice")} />
          <Input
            label="Currency"
            error={errors.currency?.message}
            onInput={(event) => {
              event.currentTarget.value = event.currentTarget.value.toUpperCase();
            }}
            {...register("currency")}
          />
        </FormSection>
        <FormSection title="SEO">
          <Input label="SEO title" error={errors.seoTitle?.message} {...register("seoTitle")} />
          <Input label="SEO keywords" error={errors.seoKeywords?.message} {...register("seoKeywords")} />
          <TextareaField label="SEO description" rows={3} error={errors.seoDescription?.message} {...register("seoDescription")} />
        </FormSection>
        {formError ? <p className="form-alert">{formError}</p> : null}
        <div className="form-actions">
          <Button type="submit" disabled={isSubmitting || saveMutation.isPending}>
            <Save size={16} />
            {isEditMode ? "Save listing" : "Create listing"}
          </Button>
        </div>
      </form>
    </section>
  );
}
