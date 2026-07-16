import { useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Edit,
  Eye,
  FileText,
  Heart,
  Home,
  Rocket,
  Send,
  Sparkles,
  XCircle
} from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { useAuth } from "../../shared/auth/useAuth";
import { Button } from "../../shared/ui/Button";
import { Dialog } from "../../shared/ui/Dialog";
import { EmptyState } from "../../shared/ui/EmptyState";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { Timeline } from "../../shared/ui/Timeline";
import { statusLabels } from "../../shared/constants/enumLabels";
import { formatCurrency } from "../../shared/lib/format";
import type { RoleCode } from "../../shared/types/auth";
import {
  generateListingDescription,
  getListing,
  runListingWorkflowAction,
  type ListingDescriptionSuggestion,
  type ListingRecord,
  type ListingWorkflowAction
} from "./listingApi";

const workflowActionLabels: Record<ListingWorkflowAction, string> = {
  approve: "Approve",
  publish: "Publish",
  reject: "Reject",
  submit: "Submit review",
  unpublish: "Unpublish"
};

const workflowSteps = ["DRAFT", "PENDING_REVIEW", "APPROVED", "PUBLISHED"];

function labelStatus(status: string) {
  return statusLabels[status as keyof typeof statusLabels] ?? status;
}

function statusTone(status: string) {
  if (status === "PUBLISHED" || status === "APPROVED") {
    return "success";
  }

  if (status === "PENDING_REVIEW" || status === "DRAFT") {
    return "warning";
  }

  if (status === "REJECTED" || status === "UNPUBLISHED") {
    return "danger";
  }

  return "neutral";
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

function workflowIcon(action: ListingWorkflowAction) {
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

function workflowProgress(status: string) {
  const activeIndex = workflowSteps.includes(status) ? workflowSteps.indexOf(status) : 0;

  return workflowSteps.map((step, index) => ({
    active: step === status,
    complete: index <= activeIndex && !["REJECTED", "UNPUBLISHED"].includes(status),
    label: labelStatus(step)
  }));
}

function ListingMetric({
  icon,
  label,
  value
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div>
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function AiSuggestionPanel({
  listing,
  onGenerated,
  suggestion
}: {
  listing: ListingRecord;
  onGenerated: (suggestion: ListingDescriptionSuggestion) => void;
  suggestion: ListingDescriptionSuggestion | null;
}) {
  const aiMutation = useMutation({
    mutationFn: () =>
      generateListingDescription({
        language: "vi",
        listingId: listing.id,
        propertyId: listing.propertyId,
        tone: "PROFESSIONAL"
      }),
    onSuccess: onGenerated
  });
  const aiError = aiMutation.error ? normalizeUnknownError(aiMutation.error) : null;

  return (
    <section className="content-section listing-detail-ai">
      <div className="section-header compact">
        <div>
          <p className="eyebrow">AI assist</p>
          <h3>Listing description generator</h3>
        </div>
        <Button variant="secondary" onClick={() => aiMutation.mutate()} disabled={aiMutation.isPending}>
          <Sparkles size={16} />
          Generate
        </Button>
      </div>
      <p className="muted">
        Generate draft content from the listing and property context. Review before copying into the edit form.
      </p>
      {aiError ? <p className="form-alert">{aiError.message}</p> : null}
      {suggestion ? (
        <div className="ai-suggestion-results">
          <article>
            <span>Title</span>
            <p>{suggestion.title || "No title suggestion"}</p>
          </article>
          <article>
            <span>Description</span>
            <p>{suggestion.description || suggestion.shortDescription || "No description suggestion"}</p>
          </article>
          <article>
            <span>SEO</span>
            <p>{[suggestion.seoTitle, suggestion.seoDescription, suggestion.seoKeywords].filter(Boolean).join(" / ") || "No SEO suggestion"}</p>
          </article>
          <article>
            <span>Social caption</span>
            <p>{suggestion.socialCaption || "No social caption suggestion"}</p>
          </article>
        </div>
      ) : null}
    </section>
  );
}

export function ListingDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [pendingAction, setPendingAction] = useState<ListingWorkflowAction | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState<ListingDescriptionSuggestion | null>(null);
  const listingQuery = useQuery({
    enabled: Boolean(id),
    queryFn: () => getListing(id ?? ""),
    queryKey: ["listing", id],
    retry: 1
  });
  const listing = listingQuery.data;
  const availableActions = useMemo(
    () => (listing ? getAvailableWorkflowActions(listing.status, user?.roles ?? []) : []),
    [listing, user?.roles]
  );
  const workflowMutation = useMutation({
    mutationFn: ({ action, reason }: { action: ListingWorkflowAction; reason?: string }) => {
      if (!listing) {
        throw new Error("Listing is not available.");
      }

      return runListingWorkflowAction({ action, current: listing, reason });
    },
    onSuccess: (updatedListing) => {
      queryClient.setQueryData(["listing", String(updatedListing.id)], updatedListing);
      void queryClient.invalidateQueries({ queryKey: ["listing", id] });
      void queryClient.invalidateQueries({ queryKey: ["listings"] });
      setPendingAction(null);
      setRejectReason("");
    }
  });
  const normalizedError = listingQuery.error ? normalizeUnknownError(listingQuery.error) : null;
  const actionError = workflowMutation.error ? normalizeUnknownError(workflowMutation.error) : null;

  function confirmAction() {
    if (!pendingAction) {
      return;
    }

    workflowMutation.mutate({
      action: pendingAction,
      reason: pendingAction === "reject" ? rejectReason.trim() : undefined
    });
  }

  if (!id) {
    return <EmptyState title="Listing not found" description="The listing URL is missing an id." />;
  }

  return (
    <section>
      <Button asChild variant="ghost" size="sm">
        <Link to="/listings">
          <ArrowLeft size={16} />
          Back to listings
        </Link>
      </Button>
      {listingQuery.isLoading ? (
        <div className="detail-skeleton">
          <div />
          <div />
          <div />
        </div>
      ) : null}
      {normalizedError ? (
        <section className="content-section">
          <EmptyState
            title="Listing could not be loaded"
            description={normalizedError.message}
            action={<Button onClick={() => listingQuery.refetch()}>Retry</Button>}
          />
        </section>
      ) : null}
      {listing ? (
        <>
          <div className="detail-header listing-detail-hero">
            <div>
              <div className="detail-badges">
                <StatusBadge tone={statusTone(listing.status)}>{labelStatus(listing.status)}</StatusBadge>
                <StatusBadge tone="info">{listing.visibility}</StatusBadge>
              </div>
              <h1>{listing.title}</h1>
              <p className="muted">
                {listing.code} / {listing.slug || "slug pending"} / {listing.property?.name ?? `Property #${listing.propertyId ?? "n/a"}`}
              </p>
            </div>
            <div className="property-price-block">
              <span>Asking price</span>
              <strong>{listing.askingPrice ? formatCurrency(listing.askingPrice, listing.currency) : "Updating"}</strong>
              <Button asChild variant="secondary" size="sm">
                <Link to={`/listings/${listing.id}/edit`}>
                  <Edit size={16} />
                  Edit draft
                </Link>
              </Button>
            </div>
          </div>
          {actionError ? <p className="form-alert">{actionError.message}</p> : null}
          <section className="content-section listing-action-panel">
            <div className="section-header compact">
              <div>
                <p className="eyebrow">Workflow</p>
                <h3>Review and publish lifecycle</h3>
              </div>
              <div className="listing-action-buttons">
                {availableActions.length ? (
                  availableActions.map((action) => (
                    <Button
                      key={action}
                      variant={action === "reject" ? "danger" : "secondary"}
                      disabled={workflowMutation.isPending}
                      onClick={() => setPendingAction(action)}
                    >
                      {workflowIcon(action)}
                      {workflowActionLabels[action]}
                    </Button>
                  ))
                ) : (
                  <p className="muted">No workflow action is available for your role and this status.</p>
                )}
              </div>
            </div>
            <div className="listing-workflow-track">
              {workflowProgress(listing.status).map((step) => (
                <div className={step.active ? "workflow-step active" : "workflow-step"} key={step.label}>
                  <CheckCircle2 size={16} />
                  <span>{step.label}</span>
                </div>
              ))}
            </div>
          </section>
          <div className="listing-detail-grid">
            <section className="content-section detail-main-section">
              <div className="property-fact-grid">
                <ListingMetric icon={<FileText size={18} />} label="Purpose" value={listing.purpose ?? "Updating"} />
                <ListingMetric icon={<Eye size={18} />} label="Views" value={listing.viewCount ?? 0} />
                <ListingMetric icon={<Heart size={18} />} label="Favorites" value={listing.favoriteCount ?? 0} />
                <ListingMetric icon={<Clock3 size={18} />} label="Submitted" value={listing.submittedAt || "Not submitted"} />
              </div>
              <div>
                <p className="eyebrow">Description</p>
                <p>{listing.description || "Description is being updated."}</p>
              </div>
              <div className="property-detail-grid">
                <div>
                  <span>SEO title</span>
                  <strong>{listing.seoTitle || "Updating"}</strong>
                </div>
                <div>
                  <span>SEO keywords</span>
                  <strong>{listing.seoKeywords || "Updating"}</strong>
                </div>
                <div>
                  <span>Package</span>
                  <strong>{listing.listingPackage?.name ?? listing.listingPackageId ?? "No package"}</strong>
                </div>
                <div>
                  <span>Created by</span>
                  <strong>{listing.creator?.fullName ?? "Updating"}</strong>
                </div>
              </div>
            </section>
            <aside className="content-section property-side-panel">
              <p className="eyebrow">Property source</p>
              <div className="property-person">
                <Home size={18} />
                <div>
                  <span>{listing.property?.code ?? `#${listing.propertyId ?? "n/a"}`}</span>
                  <strong>{listing.property?.name ?? "Property updating"}</strong>
                  {listing.property?.address ? <small>{listing.property.address}</small> : null}
                </div>
              </div>
              {listing.propertyId ? (
                <Button asChild variant="secondary" size="sm">
                  <Link to={`/properties/${listing.propertyId}`}>Open property</Link>
                </Button>
              ) : null}
              <Timeline
                items={listing.statusHistory.map((history) => ({
                  description: history.reason,
                  meta: history.createdAt || undefined,
                  title: history.toStatus || history.status
                }))}
              />
            </aside>
          </div>
          <AiSuggestionPanel
            listing={listing}
            suggestion={aiSuggestion}
            onGenerated={setAiSuggestion}
          />
        </>
      ) : null}
      <Dialog
        open={Boolean(pendingAction)}
        onClose={() => setPendingAction(null)}
        title={`${pendingAction ? workflowActionLabels[pendingAction] : "Run"} listing`}
      >
        <div className="dialog-body">
          <p>
            Confirm {pendingAction ? workflowActionLabels[pendingAction].toLowerCase() : "this action"} for listing {listing?.code ?? listing?.id}?
          </p>
          {pendingAction === "reject" ? (
            <label className="field">
              <span>Reject reason</span>
              <textarea
                className="input textarea"
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                placeholder="Explain what needs to be changed"
              />
            </label>
          ) : null}
        </div>
        <footer className="dialog-actions">
          <Button variant="secondary" onClick={() => setPendingAction(null)}>Cancel</Button>
          <Button
            variant={pendingAction === "reject" ? "danger" : "primary"}
            onClick={confirmAction}
            disabled={workflowMutation.isPending || (pendingAction === "reject" && !rejectReason.trim())}
          >
            Confirm
          </Button>
        </footer>
      </Dialog>
    </section>
  );
}
