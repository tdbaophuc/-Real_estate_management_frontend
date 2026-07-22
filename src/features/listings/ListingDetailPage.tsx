import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Edit,
  Eye,
  Heart,
  Home,
  ImageIcon,
  Ruler,
  Tag,
  XCircle
} from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { useAuth } from "../../shared/auth/useAuth";
import { Button } from "../../shared/ui/Button";
import { Dialog } from "../../shared/ui/Dialog";
import { EmptyState } from "../../shared/ui/EmptyState";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { statusLabels } from "../../shared/constants/enumLabels";
import { formatCurrency, formatDate } from "../../shared/lib/format";
import type { RoleCode } from "../../shared/types/auth";
import { getPropertyImages, type PropertyImage } from "../properties/propertyApi";
import {
  getListing,
  runListingWorkflowAction,
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

function labelStatus(status: string) {
  return statusLabels[status as keyof typeof statusLabels] ?? status;
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

function safeFormatDate(value: string) {
  return value ? formatDate(value) : "-";
}

function avatarInitial(name?: string) {
  return (name?.trim().charAt(0) || "?").toUpperCase();
}

function ListingMediaGallery({ images, title }: { images: PropertyImage[]; title: string }) {
  const orderedImages = [...images].sort((left, right) => {
    if (left.isCover && !right.isCover) {
      return -1;
    }

    if (!left.isCover && right.isCover) {
      return 1;
    }

    return left.displayOrder - right.displayOrder;
  });
  const mainImage = orderedImages[0];
  const thumbnails = orderedImages.slice(1, 4);

  if (!mainImage) {
    return (
      <section className="listing-media-empty">
        <ImageIcon size={28} />
        <span>No property images returned by API.</span>
      </section>
    );
  }

  return (
    <section className="listing-media-block">
      <div className="listing-media-main">
        <img src={mainImage.url} alt={mainImage.alt || title} />
        <span>View All ({orderedImages.length})</span>
      </div>
      <div className="listing-media-thumbnails">
        {thumbnails.map((image) => (
          <img key={image.id} src={image.url} alt={image.alt || title} />
        ))}
      </div>
    </section>
  );
}

function PropertyDetailStrip({ listing }: { listing: ListingRecord }) {
  const floorArea = listing.property?.floorArea ?? listing.property?.landArea;

  return (
    <section className="listing-property-strip">
      <div>
        <Tag size={18} />
        <span>Asset Type</span>
        <strong>{listing.property?.propertyTypeName ?? "-"}</strong>
      </div>
      <div>
        <Ruler size={18} />
        <span>Total RSF</span>
        <strong>{floorArea ? `${floorArea.toLocaleString("vi-VN")} m2` : "-"}</strong>
      </div>
      <div>
        <Home size={18} />
        <span>Asking Rate</span>
        <strong>{listing.askingPrice ? formatCurrency(listing.askingPrice, listing.currency) : "-"}</strong>
      </div>
      <div>
        <CheckCircle2 size={18} />
        <span>Lease Type</span>
        <strong>{listing.purpose ?? "-"}</strong>
      </div>
    </section>
  );
}

export function ListingDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [pendingAction, setPendingAction] = useState<ListingWorkflowAction | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [publicPreview, setPublicPreview] = useState(false);
  const listingQuery = useQuery({
    enabled: Boolean(id),
    queryFn: () => getListing(id ?? ""),
    queryKey: ["listing", id],
    retry: 1
  });
  const listing = listingQuery.data;
  const imagesQuery = useQuery({
    enabled: Boolean(listing?.propertyId),
    queryFn: () => getPropertyImages(listing?.propertyId ?? ""),
    queryKey: ["property-images", listing?.propertyId],
    retry: 1
  });
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
    <section className="listing-detail-page">
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
          <div className="listing-detail-header">
            <div>
              <p className="eyebrow">{listing.code}</p>
              <div className="listing-detail-title-row">
                <h1>{listing.title}</h1>
                <StatusBadge tone={statusTone(listing.status)}>{labelStatus(listing.status)}</StatusBadge>
              </div>
              <p className="muted">
                {listing.property?.code ?? `Property #${listing.propertyId ?? "n/a"}`} • {listing.property?.address || listing.property?.name || listing.slug}
              </p>
            </div>
            <div className="listing-detail-actions">
              <label className="listing-preview-toggle">
                <input type="checkbox" checked={publicPreview} onChange={(event) => setPublicPreview(event.target.checked)} />
                <span>Preview Public View</span>
              </label>
              {availableActions.includes("reject") ? (
                <Button variant="danger" onClick={() => setPendingAction("reject")} disabled={workflowMutation.isPending}>
                  <XCircle size={16} />
                  Reject
                </Button>
              ) : null}
              {availableActions.includes("approve") ? (
                <Button onClick={() => setPendingAction("approve")} disabled={workflowMutation.isPending}>
                  <CheckCircle2 size={16} />
                  Approve
                </Button>
              ) : null}
              <Button asChild variant="secondary">
                <Link to={`/listings/${listing.id}/edit`}>
                  <Edit size={16} />
                  Edit
                </Link>
              </Button>
            </div>
          </div>
          {actionError ? <p className="form-alert">{actionError.message}</p> : null}
          <div className="listing-detail-layout">
            <main className={publicPreview ? "listing-detail-main public-preview" : "listing-detail-main"}>
              <ListingMediaGallery images={imagesQuery.data ?? []} title={listing.title} />
              <PropertyDetailStrip listing={listing} />
              <section className="listing-marketing-copy">
                <p className="eyebrow">Marketing Text</p>
                <h3>{listing.seoTitle || listing.title}</h3>
                <p>{listing.description || "No listing description returned by API."}</p>
                {listing.seoDescription || listing.seoKeywords ? (
                  <div className="listing-seo-line">
                    <span>{listing.seoDescription}</span>
                    <small>{listing.seoKeywords}</small>
                  </div>
                ) : null}
              </section>
            </main>
            <aside className="listing-detail-side">
              <section className="listing-side-section">
                <h3>Performance</h3>
                <div className="listing-kpi-grid">
                  <div>
                    <Eye size={17} />
                    <span>Views</span>
                    <strong>{listing.viewCount ?? 0}</strong>
                  </div>
                  <div>
                    <Heart size={17} />
                    <span>Favorites</span>
                    <strong>{listing.favoriteCount ?? 0}</strong>
                  </div>
                </div>
              </section>
              <section className="listing-side-section">
                <h3>Team Roles</h3>
                <div className="listing-team-card">
                  <span>{avatarInitial(listing.creator?.fullName)}</span>
                  <div>
                    <small>Creator</small>
                    <strong>{listing.creator?.fullName ?? "-"}</strong>
                  </div>
                </div>
                <div className="listing-team-card">
                  <span>{avatarInitial(listing.reviewer?.fullName)}</span>
                  <div>
                    <small>Reviewer</small>
                    <strong>{listing.reviewer?.fullName ?? "-"}</strong>
                  </div>
                </div>
              </section>
              <section className="listing-side-section">
                <h3>Property Source</h3>
                <div className="listing-team-card">
                  <span><Home size={18} /></span>
                  <div>
                    <small>{listing.property?.code ?? `#${listing.propertyId ?? "-"}`}</small>
                    <strong>{listing.property?.name ?? "-"}</strong>
                  </div>
                </div>
                {listing.propertyId ? (
                  <Button asChild variant="secondary" size="sm">
                    <Link to={`/properties/${listing.propertyId}`}>Open property</Link>
                  </Button>
                ) : null}
              </section>
              <section className="listing-side-section">
                <h3>Workflow History</h3>
                <div className="listing-timeline">
                  {listing.statusHistory.length ? (
                    listing.statusHistory.map((history) => (
                      <article key={history.id}>
                        <span />
                        <div>
                          <strong>{history.toStatus || history.status}</strong>
                          <small>{safeFormatDate(history.createdAt)} • {history.changedBy?.fullName ?? "-"}</small>
                          {history.reason ? <p>{history.reason}</p> : null}
                        </div>
                      </article>
                    ))
                  ) : (
                    <p className="muted">No workflow history returned by API.</p>
                  )}
                </div>
              </section>
              <section className="listing-side-section">
                <h3>Dates</h3>
                <div className="listing-date-list">
                  <span>Submitted <strong>{safeFormatDate(listing.submittedAt)}</strong></span>
                  <span>Reviewed <strong>{safeFormatDate(listing.reviewedAt)}</strong></span>
                  <span>Published <strong>{safeFormatDate(listing.publishedAt)}</strong></span>
                  <span>Updated <strong>{safeFormatDate(listing.updatedAt)}</strong></span>
                </div>
              </section>
            </aside>
          </div>
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
