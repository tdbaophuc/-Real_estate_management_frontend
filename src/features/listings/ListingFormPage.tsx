import { useEffect, useMemo, useState, type ReactNode, type TextareaHTMLAttributes } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Rocket, Save, Send, Sparkles, XCircle } from "lucide-react";
import { z } from "zod";
import { normalizeUnknownError } from "../../shared/api/errors";
import { useAuth } from "../../shared/auth/useAuth";
import { Button } from "../../shared/ui/Button";
import { Dialog } from "../../shared/ui/Dialog";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Input } from "../../shared/ui/Input";
import { Select } from "../../shared/ui/Select";
import type { RoleCode } from "../../shared/types/auth";
import {
  createListing,
  generateListingDescription,
  runListingWorkflowAction,
  updateListing,
  type ListingDescriptionSuggestion,
  type ListingCreateRequest,
  type ListingRecord,
  type ListingUpdateRequest,
  type ListingWorkflowAction
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

const aiToneOptions = [
  { label: "Professional", value: "PROFESSIONAL" },
  { label: "Friendly", value: "FRIENDLY" },
  { label: "Luxury", value: "LUXURY" },
  { label: "Concise", value: "CONCISE" }
];

const aiLanguageOptions = [
  { label: "Vietnamese", value: "vi" },
  { label: "English", value: "en" }
];

const workflowActionLabels: Record<ListingWorkflowAction, string> = {
  approve: "Approve",
  publish: "Publish",
  reject: "Reject",
  submit: "Submit review",
  unpublish: "Unpublish"
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
  return toCreateRequest(values);
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

function getWorkflowIcon(action: ListingWorkflowAction) {
  if (action === "submit") {
    return <Send size={16} />;
  }

  if (action === "approve") {
    return <CheckCircle2 size={16} />;
  }

  if (action === "reject") {
    return <XCircle size={16} />;
  }

  return <Rocket size={16} />;
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
  const { user } = useAuth();
  const isEditMode = Boolean(id);
  const [workflowListing, setWorkflowListing] = useState<ListingRecord | null>(
    () =>
      id
        ? queryClient.getQueryData<ListingRecord>(["listing-workflow", id]) ?? getStoredListing(id)
        : null
  );
  const defaultValues = useMemo(
    () => toDefaultValues(workflowListing, searchParams.get("propertyId") ?? ""),
    [searchParams, workflowListing]
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingWorkflowAction, setPendingWorkflowAction] =
    useState<ListingWorkflowAction | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [aiTone, setAiTone] = useState("PROFESSIONAL");
  const [aiLanguage, setAiLanguage] = useState("vi");
  const [aiIncludeSeo, setAiIncludeSeo] = useState(true);
  const [aiExtraInstructions, setAiExtraInstructions] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState<ListingDescriptionSuggestion | null>(null);
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
  const aiMutation = useMutation({
    mutationFn: () => {
      if (!workflowListing) {
        throw new Error("Create or save the listing before requesting AI suggestions.");
      }

      return generateListingDescription({
        extraInstructions: aiExtraInstructions || undefined,
        includeSeo: aiIncludeSeo,
        language: aiLanguage,
        listingId: workflowListing.id,
        tone: aiTone
      });
    },
    onSuccess: setAiSuggestion
  });
  const title = watch("title");
  const availableWorkflowActions = workflowListing
    ? getAvailableWorkflowActions(workflowListing.status, user?.roles ?? [])
    : [];
  const actionError = workflowMutation.error ?? aiMutation.error;
  const normalizedActionError = actionError ? normalizeUnknownError(actionError) : null;

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    setWorkflowListing(
      id
        ? queryClient.getQueryData<ListingRecord>(["listing-workflow", id]) ?? getStoredListing(id)
        : null
    );
  }, [id, queryClient]);

  function persistWorkflowListing(saved: ListingRecord) {
    setWorkflowListing(saved);
    queryClient.setQueryData(["listing-workflow", saved.id], saved);
    saveListingWorkflowState(saved);
  }

  function applyGeneratedSlug() {
    setValue("slug", slugify(title), { shouldDirty: true, shouldValidate: true });
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      const saved = await saveMutation.mutateAsync(values);
      persistWorkflowListing(saved);
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

  function applyAiSuggestion(fields: Array<keyof ListingDescriptionSuggestion>) {
    if (!aiSuggestion) {
      return;
    }

    fields.forEach((field) => {
      const value = aiSuggestion[field];

      if (!value) {
        return;
      }

      if (field === "title") {
        setValue("title", value, { shouldDirty: true, shouldValidate: true });
      }

      if (field === "description" || field === "shortDescription") {
        setValue("description", value, { shouldDirty: true, shouldValidate: true });
      }

      if (field === "seoTitle") {
        setValue("seoTitle", value, { shouldDirty: true, shouldValidate: true });
      }

      if (field === "seoDescription") {
        setValue("seoDescription", value, { shouldDirty: true, shouldValidate: true });
      }

      if (field === "seoKeywords") {
        setValue("seoKeywords", value, { shouldDirty: true, shouldValidate: true });
      }
    });
  }

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
      {workflowListing ? (
        <section className="content-section listing-action-panel">
          <div>
            <p className="eyebrow">Workflow</p>
            <h3>Listing actions</h3>
          </div>
          <div className="listing-action-buttons">
            {availableWorkflowActions.length ? (
              availableWorkflowActions.map((action) => (
                <Button
                  key={action}
                  type="button"
                  variant={action === "reject" ? "danger" : "secondary"}
                  disabled={workflowMutation.isPending}
                  onClick={() => setPendingWorkflowAction(action)}
                >
                  {getWorkflowIcon(action)}
                  {workflowActionLabels[action]}
                </Button>
              ))
            ) : (
              <p className="muted">No workflow action is available for your role and this status.</p>
            )}
          </div>
        </section>
      ) : null}
      {normalizedActionError ? <p className="form-alert">{normalizedActionError.message}</p> : null}
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
        <section className="form-section ai-suggestion-panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">AI assist</p>
              <h3>Description and SEO suggestions</h3>
            </div>
            <Button
              type="button"
              variant="secondary"
              disabled={!workflowListing || aiMutation.isPending}
              onClick={() => aiMutation.mutate()}
            >
              <Sparkles size={16} />
              Generate suggestions
            </Button>
          </div>
          <div className="form-grid">
            <Select
              label="Tone"
              options={aiToneOptions}
              value={aiTone}
              onChange={(event) => setAiTone(event.target.value)}
            />
            <Select
              label="Language"
              options={aiLanguageOptions}
              value={aiLanguage}
              onChange={(event) => setAiLanguage(event.target.value)}
            />
            <label className="toggle-field">
              <input
                type="checkbox"
                checked={aiIncludeSeo}
                onChange={(event) => setAiIncludeSeo(event.target.checked)}
              />
              <span>Include SEO</span>
            </label>
            <TextareaField
              label="Extra instructions"
              rows={3}
              value={aiExtraInstructions}
              onChange={(event) => setAiExtraInstructions(event.target.value)}
              placeholder="Emphasize location, amenities, or buyer profile"
            />
          </div>
          {!workflowListing ? (
            <p className="muted">Create or save the listing before requesting AI suggestions.</p>
          ) : null}
          {aiSuggestion ? (
            <div className="ai-suggestion-results">
              {aiSuggestion.title ? (
                <article>
                  <span>Title</span>
                  <p>{aiSuggestion.title}</p>
                  <Button type="button" size="sm" variant="secondary" onClick={() => applyAiSuggestion(["title"])}>
                    Apply title
                  </Button>
                </article>
              ) : null}
              {aiSuggestion.description || aiSuggestion.shortDescription ? (
                <article>
                  <span>Description</span>
                  <p>{aiSuggestion.description || aiSuggestion.shortDescription}</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => applyAiSuggestion([aiSuggestion.description ? "description" : "shortDescription"])}
                  >
                    Apply description
                  </Button>
                </article>
              ) : null}
              {aiSuggestion.seoTitle || aiSuggestion.seoDescription || aiSuggestion.seoKeywords ? (
                <article>
                  <span>SEO</span>
                  <p>{[aiSuggestion.seoTitle, aiSuggestion.seoDescription, aiSuggestion.seoKeywords].filter(Boolean).join(" / ")}</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => applyAiSuggestion(["seoTitle", "seoDescription", "seoKeywords"])}
                  >
                    Apply SEO
                  </Button>
                </article>
              ) : null}
              {aiSuggestion.socialCaption ? (
                <article>
                  <span>Social caption</span>
                  <p>{aiSuggestion.socialCaption}</p>
                </article>
              ) : null}
            </div>
          ) : null}
        </section>
        {formError ? <p className="form-alert">{formError}</p> : null}
        <div className="form-actions">
          <Button type="submit" disabled={isSubmitting || saveMutation.isPending}>
            <Save size={16} />
            {isEditMode ? "Save listing" : "Create listing"}
          </Button>
        </div>
      </form>
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
