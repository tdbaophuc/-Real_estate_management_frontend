import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Download, FilePlus2, MoreHorizontal, Send, UploadCloud, XCircle } from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { useAuth } from "../../shared/auth/useAuth";
import { Button } from "../../shared/ui/Button";
import { Dialog } from "../../shared/ui/Dialog";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Input } from "../../shared/ui/Input";
import { Pagination } from "../../shared/ui/Pagination";
import { Select } from "../../shared/ui/Select";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { Table, TableEmpty } from "../../shared/ui/Table";
import { statusLabels } from "../../shared/constants/enumLabels";
import { formatCurrency } from "../../shared/lib/format";
import { useText } from "../../shared/i18n/useText";
import type { RoleCode } from "../../shared/types/auth";
import {
  runListingWorkflowAction,
  searchListings,
  type ListingPurpose,
  type ListingRecord,
  type ListingSearchParams,
  type ListingWorkflowAction
} from "./listingApi";

const PAGE_SIZE = 12;

const statusOptions = [
  { label: "All statuses", value: "" },
  { label: "Draft", value: "DRAFT" },
  { label: "Pending review", value: "PENDING_REVIEW" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Unpublished", value: "UNPUBLISHED" },
  { label: "Expired", value: "EXPIRED" },
  { label: "Sold", value: "SOLD" },
  { label: "Rented", value: "RENTED" }
];

const purposeOptions = [
  { label: "All purposes", value: "" },
  { label: "Sale", value: "SALE" },
  { label: "Rent", value: "RENT" }
];

const workflowActionLabels: Record<ListingWorkflowAction, string> = {
  approve: "Approve",
  publish: "Publish",
  reject: "Reject",
  submit: "Submit for Review",
  unpublish: "Unpublish"
};

function labelStatus(status: string) {
  return statusLabels[status as keyof typeof statusLabels] ?? status;
}

function statusTone(status: string) {
  if (status === "PUBLISHED" || status === "APPROVED" || status === "SOLD" || status === "RENTED") {
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

function getQuickActions(status: string, roles: RoleCode[]) {
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

function getInitialFilters(searchParams: URLSearchParams) {
  return {
    propertyId: searchParams.get("propertyId") ?? "",
    purpose: searchParams.get("purpose") ?? "",
    status: searchParams.get("status") ?? ""
  };
}

function toApiParams(filters: ReturnType<typeof getInitialFilters>, page: number): ListingSearchParams {
  return {
    page,
    propertyId: filters.propertyId,
    purpose: filters.purpose as ListingPurpose | "",
    size: PAGE_SIZE,
    sortBy: "createdAt",
    sortDirection: "DESC",
    status: filters.status
  };
}

function escapeCsv(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function exportListingsCsv(listings: ListingRecord[]) {
  const headers = [
    "id",
    "code",
    "propertyId",
    "propertyCode",
    "title",
    "location",
    "status",
    "purpose",
    "askingPrice",
    "currency",
    "creator",
    "reviewer",
    "visibility",
    "slug",
    "viewCount",
    "favoriteCount",
    "submittedAt",
    "publishedAt",
    "rejectionReason"
  ];
  const rows = listings.map((listing) => [
    listing.id,
    listing.code,
    listing.propertyId,
    listing.property?.code,
    listing.title,
    listing.property?.address,
    listing.status,
    listing.purpose,
    listing.askingPrice,
    listing.currency,
    listing.creator?.fullName,
    listing.reviewer?.fullName,
    listing.visibility,
    listing.slug,
    listing.viewCount,
    listing.favoriteCount,
    listing.submittedAt,
    listing.publishedAt,
    listing.rejectionReason
  ]);
  const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "listings.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

function actionIcon(action: ListingWorkflowAction) {
  if (action === "submit") {
    return <Send size={14} />;
  }

  if (action === "approve" || action === "publish") {
    return action === "publish" ? <UploadCloud size={14} /> : <CheckCircle2 size={14} />;
  }

  if (action === "reject") {
    return <XCircle size={14} />;
  }

  return <MoreHorizontal size={14} />;
}

export function ListingsPage() {
  const tx = useText();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => getInitialFilters(searchParams));
  const [pendingRejectListing, setPendingRejectListing] = useState<ListingRecord | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const committedFilters = useMemo(() => getInitialFilters(searchParams), [searchParams]);
  const currentPage = Number(searchParams.get("page") ?? 0) || 0;
  const apiParams = useMemo(
    () => toApiParams(committedFilters, currentPage),
    [committedFilters, currentPage]
  );
  const listingsQuery = useQuery({
    queryFn: () => searchListings(apiParams),
    queryKey: ["listings", apiParams],
    retry: 1
  });
  const workflowMutation = useMutation({
    mutationFn: ({ action, listing, reason }: { action: ListingWorkflowAction; listing: ListingRecord; reason?: string }) =>
      runListingWorkflowAction({ action, current: listing, reason }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["listings"] });
      setPendingRejectListing(null);
      setRejectReason("");
    }
  });
  const normalizedError = listingsQuery.error ? normalizeUnknownError(listingsQuery.error) : null;
  const workflowError = workflowMutation.error ? normalizeUnknownError(workflowMutation.error) : null;
  const listings = listingsQuery.data?.content ?? [];

  function updateFilter(name: keyof typeof filters, value: string) {
    setFilters((current) => ({
      ...current,
      [name]: value
    }));
  }

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        nextParams.set(key, value);
      }
    });

    nextParams.set("page", "0");
    setSearchParams(nextParams);
  }

  function handlePageChange(page: number) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", String(page));
    setSearchParams(nextParams);
  }

  function runQuickAction(listing: ListingRecord, action: ListingWorkflowAction) {
    if (action === "reject") {
      setPendingRejectListing(listing);
      return;
    }

    workflowMutation.mutate({ action, listing });
  }

  return (
    <section className="listing-management-page">
      <div className="listing-page-header">
        <div>
          <p className="eyebrow">{tx("Listings")}</p>
          <h2>{tx("Internal Listing Management")}</h2>
        </div>
        <div className="listing-header-actions">
          <Button asChild variant="secondary">
            <Link to="/listings/review-queue">
              <CheckCircle2 size={16} />
              {tx("Review Queue")}
            </Link>
          </Button>
          <Button type="button" variant="secondary" onClick={() => exportListingsCsv(listings)} disabled={!listings.length}>
            <Download size={16} />
            {tx("Export")}
          </Button>
          <Button asChild className="listing-new-button">
            <Link to="/listings/new">
              <FilePlus2 size={16} />
              {tx("New Listing")}
            </Link>
          </Button>
        </div>
      </div>
      <form className="listing-management-filter" onSubmit={applyFilters}>
        <Select
          label={tx("Status")}
          value={filters.status}
          onChange={(event) => updateFilter("status", event.target.value)}
          options={statusOptions.map((option) => ({ ...option, label: tx(option.label) }))}
        />
        <Select
          label={tx("Purpose")}
          value={filters.purpose}
          onChange={(event) => updateFilter("purpose", event.target.value)}
          options={purposeOptions.map((option) => ({ ...option, label: tx(option.label) }))}
        />
        <Input
          label={tx("Property ID")}
          value={filters.propertyId}
          onChange={(event) => updateFilter("propertyId", event.target.value)}
          placeholder={tx("Enter property id")}
        />
        <div className="listing-filter-actions">
          <Button type="submit">{tx("Apply")}</Button>
        </div>
      </form>
      {workflowError ? <p className="form-alert">{workflowError.message}</p> : null}
      {listingsQuery.isLoading ? (
        <section className="content-section">
          <EmptyState title={tx("Loading listings")} description={tx("Fetching internal listing workflow records.")} />
        </section>
      ) : null}
      {normalizedError ? (
        <section className="content-section">
          <EmptyState
            title={tx("Listings could not be loaded")}
            description={normalizedError.message}
            action={<Button onClick={() => listingsQuery.refetch()}>{tx("Retry")}</Button>}
          />
        </section>
      ) : null}
      {!listingsQuery.isLoading && !normalizedError ? (
        <>
          <section className="listing-table-card">
            <Table>
              <thead>
                <tr>
                  <th>{tx("Property ID")}</th>
                  <th>{tx("Title & Location")}</th>
                  <th>{tx("Status")}</th>
                  <th>{tx("Purpose")}</th>
                  <th>{tx("Asking Price")}</th>
                  <th>{tx("Creator")}</th>
                  <th className="table-actions-column">{tx("Actions")}</th>
                </tr>
              </thead>
              {listings.length ? (
                <tbody>
                  {listings.map((listing) => {
                    const actions = getQuickActions(listing.status, user?.roles ?? []);

                    return (
                      <tr key={listing.id}>
                        <td>
                          <Link className="listing-property-link" to={`/listings/${listing.id}`}>
                            {listing.property?.code ?? listing.propertyId ?? listing.code}
                          </Link>
                        </td>
                        <td>
                          <div className="listing-title-cell">
                            <strong>{listing.title}</strong>
                            <span>{listing.property?.address || listing.slug || listing.property?.name || "-"}</span>
                          </div>
                        </td>
                        <td><StatusBadge tone={statusTone(listing.status)}>{labelStatus(listing.status)}</StatusBadge></td>
                        <td>{listing.purpose ?? "-"}</td>
                        <td>{listing.askingPrice ? formatCurrency(listing.askingPrice, listing.currency) : "-"}</td>
                        <td>{listing.creator?.fullName ?? "-"}</td>
                        <td>
                          <div className="listing-table-actions">
                            {actions.length ? (
                              actions.map((action) => (
                                <button
                                  className={`listing-action-link listing-action-${action}`}
                                  disabled={workflowMutation.isPending}
                                  key={action}
                                  type="button"
                                  onClick={() => runQuickAction(listing, action)}
                                >
                                  {actionIcon(action)}
                                  {tx(workflowActionLabels[action])}
                                </button>
                              ))
                            ) : (
                              <Button asChild variant="ghost" size="sm">
                                <Link to={`/listings/${listing.id}`}>
                                  <MoreHorizontal size={16} />
                                </Link>
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              ) : (
                <TableEmpty message="No listings found" />
              )}
            </Table>
          </section>
          <Pagination
            page={listingsQuery.data?.page ?? currentPage}
            totalPages={listingsQuery.data?.totalPages ?? 0}
            onPageChange={handlePageChange}
          />
        </>
      ) : null}
      <Dialog
        open={Boolean(pendingRejectListing)}
        onClose={() => setPendingRejectListing(null)}
        title="Reject listing"
      >
        <div className="dialog-body">
          <p>Listing {pendingRejectListing?.code ?? pendingRejectListing?.id}</p>
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
          <Button variant="secondary" onClick={() => setPendingRejectListing(null)}>Cancel</Button>
          <Button
            variant="danger"
            disabled={!pendingRejectListing || !rejectReason.trim() || workflowMutation.isPending}
            onClick={() => {
              if (pendingRejectListing) {
                workflowMutation.mutate({
                  action: "reject",
                  listing: pendingRejectListing,
                  reason: rejectReason.trim()
                });
              }
            }}
          >
            Reject
          </Button>
        </footer>
      </Dialog>
    </section>
  );
}
