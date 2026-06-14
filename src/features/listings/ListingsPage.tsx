import { useMemo } from "react";
import { Link } from "react-router-dom";
import { FilePlus2 } from "lucide-react";
import { Button } from "../../shared/ui/Button";
import { EmptyState } from "../../shared/ui/EmptyState";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { statusLabels } from "../../shared/constants/enumLabels";
import { formatCurrency } from "../../shared/lib/format";
import { getStoredListings } from "./listingWorkflowState";

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

export function ListingsPage() {
  const listings = useMemo(() => getStoredListings(), []);

  return (
    <section>
      <div className="section-header">
        <div>
          <p className="eyebrow">Listings</p>
          <h2>Listing workflow</h2>
        </div>
        <Button asChild>
          <Link to="/listings/new">
            <FilePlus2 size={16} />
            New listing
          </Link>
        </Button>
      </div>
      <section className="content-section">
        <p className="muted">
          Internal listing list/detail endpoints are not available yet. This workspace keeps
          listings returned by create/update so the current workflow can continue without calling
          unsupported APIs.
        </p>
      </section>
      <div className="listing-workflow-list">
        {listings.length ? (
          listings.map((listing) => (
            <article className="listing-workflow-card" key={listing.id}>
              <div>
                <div className="detail-badges">
                  <StatusBadge tone={statusTone(listing.status)}>{labelStatus(listing.status)}</StatusBadge>
                  <StatusBadge tone="info">{listing.visibility}</StatusBadge>
                </div>
                <h3>{listing.title}</h3>
                <p className="muted">
                  {listing.code} / Property #{listing.propertyId ?? "n/a"} / {listing.slug || "slug pending"}
                </p>
              </div>
              <strong>
                {listing.askingPrice ? formatCurrency(listing.askingPrice, listing.currency) : "Price updating"}
              </strong>
              <Button asChild variant="secondary" size="sm">
                <Link to={`/listings/${listing.id}/edit`}>Edit</Link>
              </Button>
            </article>
          ))
        ) : (
          <div className="content-section">
            <EmptyState
              title="No local listing workflow"
              description="Create a listing from a property to keep the returned draft available here."
              action={
                <Button asChild>
                  <Link to="/listings/new">Create listing</Link>
                </Button>
              }
            />
          </div>
        )}
      </div>
    </section>
  );
}
