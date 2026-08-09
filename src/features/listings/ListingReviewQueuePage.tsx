import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { CheckCircle2, Edit, ImageIcon, XCircle } from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { Dialog } from "../../shared/ui/Dialog";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Pagination } from "../../shared/ui/Pagination";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { Table, TableEmpty } from "../../shared/ui/Table";
import { formatCurrency } from "../../shared/lib/format";
import { getPropertyImages } from "../properties/propertyApi";
import {
  runListingWorkflowAction,
  searchListings,
  type ListingRecord
} from "./listingApi";

const PAGE_SIZE = 10;

function priceVariance(masterPrice?: number | null, proposedPrice?: number | null) {
  if (!masterPrice || !proposedPrice) {
    return null;
  }

  return proposedPrice - masterPrice;
}

function ListingReviewThumbnail({ listing }: { listing: ListingRecord }) {
  const imagesQuery = useQuery({
    enabled: Boolean(listing.propertyId),
    queryFn: () => getPropertyImages(listing.propertyId ?? ""),
    queryKey: ["property-images", listing.propertyId, "review-thumb"],
    retry: 1,
    staleTime: 5 * 60 * 1000
  });
  const image = (imagesQuery.data ?? []).find((item) => item.isCover) ?? imagesQuery.data?.[0];

  if (!image) {
    return (
      <span className="listing-review-thumb empty">
        <ImageIcon size={16} />
      </span>
    );
  }

  return <img className="listing-review-thumb" src={image.url} alt={image.alt || listing.property?.name || listing.title} />;
}

export function ListingReviewQueuePage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Array<number | string>>([]);
  const [pendingRejectListings, setPendingRejectListings] = useState<ListingRecord[]>([]);
  const [rejectReason, setRejectReason] = useState("");
  const reviewQuery = useQuery({
    queryFn: () =>
      searchListings({
        page,
        size: PAGE_SIZE,
        sortBy: "submittedAt",
        sortDirection: "DESC",
        status: "PENDING_REVIEW"
      }),
    queryKey: ["listings", "review-queue", page],
    retry: 1
  });
  const listings = reviewQuery.data?.content ?? [];
  const selectedListings = useMemo(
    () => listings.filter((listing) => selectedIds.includes(listing.id)),
    [listings, selectedIds]
  );
  const workflowMutation = useMutation({
    mutationFn: async ({ action, listings: actionListings, reason }: { action: "approve" | "reject"; listings: ListingRecord[]; reason?: string }) =>
      Promise.all(
        actionListings.map((listing) =>
          runListingWorkflowAction({
            action,
            current: listing,
            reason
          })
        )
      ),
    onSuccess: () => {
      setSelectedIds([]);
      setPendingRejectListings([]);
      setRejectReason("");
      void queryClient.invalidateQueries({ queryKey: ["listings"] });
    }
  });
  const normalizedError = reviewQuery.error ? normalizeUnknownError(reviewQuery.error) : null;
  const workflowError = workflowMutation.error ? normalizeUnknownError(workflowMutation.error) : null;

  function toggleSelection(listingId: number | string, checked: boolean) {
    setSelectedIds((current) =>
      checked ? [...current, listingId] : current.filter((id) => id !== listingId)
    );
  }

  function toggleAll(checked: boolean) {
    setSelectedIds(checked ? listings.map((listing) => listing.id) : []);
  }

  return (
    <section className="listing-review-page">
      <div className="listing-page-header">
        <div>
          <p className="eyebrow">Listings</p>
          <h2>Listing Review Queue</h2>
        </div>
        <div className="listing-header-actions">
          <Button
            variant="secondary"
            disabled={!selectedListings.length || workflowMutation.isPending}
            onClick={() => workflowMutation.mutate({ action: "approve", listings: selectedListings })}
          >
            <CheckCircle2 size={16} />
            Approve Selected
          </Button>
          <Button
            variant="danger"
            disabled={!selectedListings.length || workflowMutation.isPending}
            onClick={() => setPendingRejectListings(selectedListings)}
          >
            <XCircle size={16} />
            Reject Selected
          </Button>
        </div>
      </div>
      {workflowError ? <p className="form-alert">{workflowError.message}</p> : null}
      {reviewQuery.isLoading ? (
        <section className="content-section">
          <EmptyState title="Loading review queue" description="Fetching pending review listings." />
        </section>
      ) : null}
      {normalizedError ? (
        <section className="content-section">
          <EmptyState
            title="Review queue could not be loaded"
            description={normalizedError.message}
            action={<Button onClick={() => reviewQuery.refetch()}>Retry</Button>}
          />
        </section>
      ) : null}
      {!reviewQuery.isLoading && !normalizedError ? (
        <>
          <section className="listing-table-card">
            <Table>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={Boolean(listings.length) && selectedIds.length === listings.length}
                      onChange={(event) => toggleAll(event.target.checked)}
                    />
                  </th>
                  <th>ID / Status / Property</th>
                  <th>Proposed Listing Content</th>
                  <th>Financials</th>
                  <th className="table-actions-column">Actions</th>
                </tr>
              </thead>
              {listings.length ? (
                <tbody>
                  {listings.map((listing) => {
                    const variance = priceVariance(listing.property?.price, listing.askingPrice);

                    return (
                      <tr key={listing.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(listing.id)}
                            onChange={(event) => toggleSelection(listing.id, event.target.checked)}
                          />
                        </td>
                        <td>
                          <div className="listing-review-identity">
                            <ListingReviewThumbnail listing={listing} />
                            <div className="listing-review-property">
                              <span>{listing.code}</span>
                              <StatusBadge tone="warning">{listing.status}</StatusBadge>
                              <strong>{listing.property?.name ?? "-"}</strong>
                              <small>{listing.property?.code ?? listing.propertyId ?? "-"}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="listing-title-cell">
                            <strong>{listing.title}</strong>
                            <span>{listing.description || "-"}</span>
                          </div>
                        </td>
                        <td>
                          <div className="listing-financials">
                            <span>Master {listing.property?.price ? formatCurrency(listing.property.price, listing.property.currency ?? listing.currency) : "-"}</span>
                            <strong>Proposed {listing.askingPrice ? formatCurrency(listing.askingPrice, listing.currency) : "-"}</strong>
                            {variance ? (
                              <small className={variance > 0 ? "variance-up" : "variance-down"}>
                                {variance > 0 ? "+" : ""}
                                {formatCurrency(variance, listing.currency)}
                              </small>
                            ) : null}
                          </div>
                        </td>
                        <td>
                          <div className="listing-table-actions">
                            <button
                              className="listing-action-link listing-action-approve"
                              type="button"
                              disabled={workflowMutation.isPending}
                              onClick={() => workflowMutation.mutate({ action: "approve", listings: [listing] })}
                            >
                              <CheckCircle2 size={14} />
                              Approve
                            </button>
                            <button
                              className="listing-action-link listing-action-reject"
                              type="button"
                              disabled={workflowMutation.isPending}
                              onClick={() => setPendingRejectListings([listing])}
                            >
                              <XCircle size={14} />
                              Reject
                            </button>
                            <Button asChild variant="ghost" size="sm">
                              <Link to={`/listings/${listing.id}/edit`}>
                                <Edit size={15} />
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              ) : (
                <TableEmpty message="No pending review listings" />
              )}
            </Table>
          </section>
          <Pagination
            page={reviewQuery.data?.page ?? page}
            totalPages={reviewQuery.data?.totalPages ?? 0}
            onPageChange={setPage}
          />
        </>
      ) : null}
      <Dialog
        open={Boolean(pendingRejectListings.length)}
        onClose={() => setPendingRejectListings([])}
        title="Reject listing"
      >
        <div className="dialog-body">
          <p>{pendingRejectListings.length} selected listing(s)</p>
          <label className="field">
            <span>Reject reason</span>
            <textarea
              className="input textarea"
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="Explain what needs to be changed"
            />
          </label>
        </div>
        <footer className="dialog-actions">
          <Button variant="secondary" onClick={() => setPendingRejectListings([])}>Cancel</Button>
          <Button
            variant="danger"
            disabled={!pendingRejectListings.length || !rejectReason.trim() || workflowMutation.isPending}
            onClick={() =>
              workflowMutation.mutate({
                action: "reject",
                listings: pendingRejectListings,
                reason: rejectReason.trim()
              })
            }
          >
            Reject
          </Button>
        </footer>
      </Dialog>
    </section>
  );
}
