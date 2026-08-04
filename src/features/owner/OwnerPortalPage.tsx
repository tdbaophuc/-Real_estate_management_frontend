import { useMemo, type ReactNode } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Building2, FileText, Home, ReceiptText, ScrollText } from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { EmptyState } from "../../shared/ui/EmptyState";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { formatCurrency } from "../../shared/lib/format";
import { searchContracts } from "../contracts/contractApi";
import { searchListings } from "../listings/listingApi";
import { getPropertyLegalDocuments, searchProperties } from "../properties/propertyApi";
import { searchTransactions } from "../transactions/transactionApi";

type OwnerPortalView = "contracts" | "dashboard" | "documents" | "listings" | "properties" | "transactions";

const statusTone = (status: string) => {
  if (["ACTIVE", "AVAILABLE", "PUBLISHED", "SIGNED", "COMPLETED"].includes(status)) {
    return "success";
  }

  if (["PENDING", "PENDING_REVIEW", "DRAFT", "PAYMENT_IN_PROGRESS"].includes(status)) {
    return "warning";
  }

  if (["CANCELLED", "REJECTED", "EXPIRED", "TERMINATED"].includes(status)) {
    return "danger";
  }

  return "neutral";
};

function OwnerPanel({
  children,
  title
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="owner-panel">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

export function OwnerPortalPage({ view = "dashboard" }: { view?: OwnerPortalView }) {
  const propertiesQuery = useQuery({
    queryFn: () => searchProperties({ page: 0, size: 8, sortBy: "updatedAt", direction: "DESC" }),
    queryKey: ["owner", "properties"],
    retry: 1
  });
  const listingsQuery = useQuery({
    queryFn: () => searchListings({ page: 0, size: 8, sortBy: "updatedAt", sortDirection: "DESC" }),
    queryKey: ["owner", "listings"],
    retry: 1
  });
  const contractsQuery = useQuery({
    queryFn: () => searchContracts({ page: 0, size: 8 }),
    queryKey: ["owner", "contracts"],
    retry: 1
  });
  const transactionsQuery = useQuery({
    queryFn: () => searchTransactions({ page: 0, size: 8 }),
    queryKey: ["owner", "transactions"],
    retry: 1
  });
  const propertyDocumentsQueries = useQueries({
    queries: (propertiesQuery.data?.content ?? []).slice(0, 6).map((property) => ({
      enabled: view === "documents" || view === "dashboard",
      queryFn: () => getPropertyLegalDocuments(property.id),
      queryKey: ["owner", "property-documents", property.id],
      retry: 1
    }))
  });
  const documents = useMemo(
    () =>
      propertyDocumentsQueries.flatMap((query, index) =>
        (query.data ?? []).map((document) => ({
          ...document,
          property: propertiesQuery.data?.content[index]
        }))
      ),
    [propertyDocumentsQueries, propertiesQuery.data?.content]
  );
  const queryError =
    propertiesQuery.error ??
    listingsQuery.error ??
    contractsQuery.error ??
    transactionsQuery.error ??
    propertyDocumentsQueries.find((query) => query.error)?.error;
  const normalizedError = queryError ? normalizeUnknownError(queryError) : null;

  return (
    <section className="owner-portal-page">
      <div className="owner-portal-header">
        <div>
          <p className="eyebrow">Owner portal</p>
          <h2>
            {view === "dashboard" ? "Portfolio overview" : null}
            {view === "properties" ? "My properties" : null}
            {view === "listings" ? "My listings" : null}
            {view === "documents" ? "Documents" : null}
            {view === "contracts" ? "Contracts" : null}
            {view === "transactions" ? "Transactions" : null}
          </h2>
          <p className="muted">Data is loaded from scoped backend endpoints for the signed-in owner.</p>
        </div>
      </div>

      {normalizedError ? (
        <EmptyState
          title="Owner portal data could not be loaded"
          description={normalizedError.message}
          action={<Button onClick={() => window.location.reload()}>Retry</Button>}
        />
      ) : null}

      {view === "dashboard" ? (
        <>
          <div className="owner-kpi-grid">
            <article>
              <Home size={18} />
              <span>Properties</span>
              <strong>{propertiesQuery.data?.totalElements ?? 0}</strong>
            </article>
            <article>
              <Building2 size={18} />
              <span>Listings</span>
              <strong>{listingsQuery.data?.totalElements ?? 0}</strong>
            </article>
            <article>
              <FileText size={18} />
              <span>Contracts</span>
              <strong>{contractsQuery.data?.totalElements ?? 0}</strong>
            </article>
            <article>
              <ReceiptText size={18} />
              <span>Transactions</span>
              <strong>{transactionsQuery.data?.totalElements ?? 0}</strong>
            </article>
          </div>
          <div className="owner-portal-grid">
            <OwnerPanel title="Recent properties">
              <OwnerPropertyList properties={propertiesQuery.data?.content ?? []} />
            </OwnerPanel>
            <OwnerPanel title="Recent documents">
              <OwnerDocumentList documents={documents.slice(0, 6)} />
            </OwnerPanel>
          </div>
        </>
      ) : null}

      {view === "properties" ? (
        <OwnerPanel title="Properties">
          <OwnerPropertyList properties={propertiesQuery.data?.content ?? []} />
        </OwnerPanel>
      ) : null}

      {view === "listings" ? (
        <OwnerPanel title="Listings">
          <div className="owner-record-list">
            {(listingsQuery.data?.content ?? []).map((listing) => (
              <article key={listing.id}>
                <Building2 size={18} />
                <div>
                  <strong>{listing.title}</strong>
                  <span>{listing.property?.address || listing.property?.name || listing.code}</span>
                </div>
                <StatusBadge tone={statusTone(listing.status)}>{listing.status}</StatusBadge>
              </article>
            ))}
          </div>
        </OwnerPanel>
      ) : null}

      {view === "documents" ? (
        <OwnerPanel title="Documents">
          <OwnerDocumentList documents={documents} />
        </OwnerPanel>
      ) : null}

      {view === "contracts" ? (
        <OwnerPanel title="Contracts">
          <div className="owner-record-list">
            {(contractsQuery.data?.content ?? []).map((contract) => (
              <article key={contract.id}>
                <FileText size={18} />
                <div>
                  <strong>{contract.title}</strong>
                  <span>{contract.propertyAddress || contract.code}</span>
                </div>
                <StatusBadge tone={statusTone(contract.status)}>{contract.status}</StatusBadge>
              </article>
            ))}
          </div>
        </OwnerPanel>
      ) : null}

      {view === "transactions" ? (
        <OwnerPanel title="Transactions">
          <div className="owner-record-list">
            {(transactionsQuery.data?.content ?? []).map((transaction) => (
              <article key={transaction.id}>
                <ReceiptText size={18} />
                <div>
                  <strong>{transaction.title}</strong>
                  <span>{transaction.propertyName || transaction.code}</span>
                </div>
                <b>{transaction.totalAmount ? formatCurrency(transaction.totalAmount, transaction.currency) : "-"}</b>
              </article>
            ))}
          </div>
        </OwnerPanel>
      ) : null}
    </section>
  );
}

function OwnerPropertyList({ properties }: { properties: NonNullable<Awaited<ReturnType<typeof searchProperties>>["content"]> }) {
  if (!properties.length) {
    return <p className="muted">No property records returned by API.</p>;
  }

  return (
    <div className="owner-record-list">
      {properties.map((property) => (
        <article key={property.id}>
          <Home size={18} />
          <div>
            <strong>{property.name}</strong>
            <span>{property.address.fullAddress || property.code}</span>
          </div>
          <StatusBadge tone={statusTone(property.status)}>{property.status}</StatusBadge>
        </article>
      ))}
    </div>
  );
}

function OwnerDocumentList({
  documents
}: {
  documents: Array<{
    documentNumber: string;
    documentType: string;
    fileName: string;
    id: number | string;
    publicUrl?: string;
    verificationStatus: string;
    property?: { code: string; name: string };
  }>;
}) {
  if (!documents.length) {
    return <p className="muted">No legal documents returned by API.</p>;
  }

  return (
    <div className="owner-record-list">
      {documents.map((document) => (
        <article key={`${document.property?.code ?? "property"}-${document.id}`}>
          <ScrollText size={18} />
          <div>
            <strong>{document.fileName || document.documentType}</strong>
            <span>{[document.property?.code, document.documentNumber].filter(Boolean).join(" / ") || document.documentType}</span>
          </div>
          {document.publicUrl ? <a href={document.publicUrl} target="_blank" rel="noreferrer">Open</a> : <StatusBadge tone={statusTone(document.verificationStatus)}>{document.verificationStatus}</StatusBadge>}
        </article>
      ))}
    </div>
  );
}
