import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, CloudUpload, Download, Eye, FileText, FileUp, Send, Signature, XCircle } from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { downloadFile } from "../../shared/api/fileApi";
import { useAuth } from "../../shared/auth/useAuth";
import { Button } from "../../shared/ui/Button";
import { Dialog } from "../../shared/ui/Dialog";
import { EmptyState } from "../../shared/ui/EmptyState";
import type { RoleCode } from "../../shared/types/auth";
import {
  getContract,
  runContractWorkflowAction,
  uploadContractDocument,
  type ContractWorkflowAction
} from "./contractApi";

const actionLabels: Record<ContractWorkflowAction, string> = {
  approve: "Approve Contract",
  cancel: "Cancel",
  "mark-signed": "Mark as Signed",
  "submit-review": "Submit for Legal Review"
};

const workflowDisplayActions: ContractWorkflowAction[] = ["submit-review", "approve", "mark-signed"];

function statusTone(status: string) {
  if (status === "SIGNED" || status === "ACTIVE") {
    return "success";
  }

  if (status === "CANCELLED" || status === "TERMINATED" || status === "EXPIRED") {
    return "danger";
  }

  if (status === "PENDING_REVIEW" || status === "PENDING_SIGNATURE") {
    return "warning";
  }

  return "neutral";
}

function hasAnyRole(roles: RoleCode[], allowedRoles: RoleCode[]) {
  return roles.some((role) => allowedRoles.includes(role));
}

function getAvailableActions(status: string, roles: RoleCode[]) {
  const canAgentAct = hasAnyRole(roles, ["ADMIN", "MANAGER", "AGENT"]);
  const canApprove = hasAnyRole(roles, ["ADMIN", "MANAGER"]);
  const actions: ContractWorkflowAction[] = [];

  if (canAgentAct && status === "DRAFT") {
    actions.push("submit-review");
  }

  if (canApprove && status === "PENDING_REVIEW") {
    actions.push("approve");
  }

  if (canAgentAct && ["PENDING_SIGNATURE", "SIGNED"].includes(status)) {
    actions.push("mark-signed");
  }

  if (canAgentAct && !["CANCELLED", "TERMINATED", "EXPIRED"].includes(status)) {
    actions.push("cancel");
  }

  return actions;
}

function actionIcon(action: ContractWorkflowAction) {
  if (action === "submit-review") {
    return <Send size={16} />;
  }

  if (action === "approve") {
    return <CheckCircle2 size={16} />;
  }

  if (action === "mark-signed") {
    return <Signature size={16} />;
  }

  return <XCircle size={16} />;
}

function formatOptionalDate(value: string) {
  if (!value) {
    return "Updating";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }).format(date);
}

function formatUsdValue(value: number | null) {
  if (value == null) {
    return "Updating";
  }

  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency"
  }).format(value);
}

function documentTypeLabel(type: string) {
  return type ? type.split("_").join(" ") : "ATTACHMENT";
}

export function ContractDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pendingAction, setPendingAction] = useState<ContractWorkflowAction | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const contractQuery = useQuery({
    enabled: Boolean(id),
    queryFn: () => getContract(id ?? ""),
    queryKey: ["contract", id],
    retry: 1
  });
  const invalidateContractData = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["contract", id] }),
      queryClient.invalidateQueries({ queryKey: ["contracts"] })
    ]);
  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      if (!file) {
        throw new Error("Choose a document to upload.");
      }

      return uploadContractDocument(id ?? "", {
        displayName: file.name,
        documentType: "ATTACHMENT",
        file,
        primaryDocument: false
      });
    },
    onSuccess: () => {
      setSelectedFile(null);
      return invalidateContractData();
    }
  });
  const workflowMutation = useMutation({
    mutationFn: () => {
      if (!pendingAction) {
        throw new Error("No contract action selected.");
      }

      return runContractWorkflowAction(
        id ?? "",
        pendingAction,
        pendingAction === "cancel" ? cancelReason.trim() : undefined
      );
    },
    onSuccess: () => {
      setPendingAction(null);
      setCancelReason("");
      return invalidateContractData();
    }
  });
  const documentDownloadMutation = useMutation({
    mutationFn: (document: { displayName: string; fileId: number | string | null; url: string }) => {
      if (document.fileId) {
        return downloadFile(document.fileId, document.displayName);
      }

      if (document.url) {
        window.open(document.url, "_blank", "noopener,noreferrer");
        return Promise.resolve();
      }

      throw new Error("No downloadable file is linked to this document.");
    }
  });
  const contract = contractQuery.data;
  const normalizedError = contractQuery.error ? normalizeUnknownError(contractQuery.error) : null;
  const actionError =
    uploadMutation.error ??
    workflowMutation.error ??
    documentDownloadMutation.error;
  const normalizedActionError = actionError ? normalizeUnknownError(actionError) : null;
  const availableActions = contract ? getAvailableActions(contract.status, user?.roles ?? []) : [];
  const counterparty = contract?.parties[0]?.fullName ?? (contract?.customerId ? `Customer #${contract.customerId}` : "Not linked");
  const primaryDocumentRecord = contract?.documents.find((document) => document.primaryDocument) ?? contract?.documents[0];

  function uploadSelectedFile(file: File | undefined) {
    if (!file) {
      return;
    }

    setSelectedFile(file);
    uploadMutation.mutate(file);
  }

  if (!id) {
    return (
      <section className="content-section">
        <EmptyState title="Contract not found" description="The contract URL is missing an id." />
      </section>
    );
  }

  if (contractQuery.isLoading) {
    return (
      <section className="detail-skeleton">
        <div />
        <div />
      </section>
    );
  }

  if (normalizedError) {
    return (
      <section className="contract-detail-page">
        <div className="contract-detail-workspace">
          <main className="contract-main-column">
            <section className="content-section">
              <EmptyState title="Contract could not be loaded" description={normalizedError.message} action={<Button onClick={() => contractQuery.refetch()}>Retry</Button>} />
            </section>
          </main>
        </div>
      </section>
    );
  }

  if (!contract) {
    return null;
  }

  return (
    <section className="contract-detail-page">
      <header className="contract-page-header">
        <div className="contract-page-title">
          <nav className="contract-breadcrumb" aria-label="Contract breadcrumb">
            <Link to="/contracts">
              <ArrowLeft size={16} />
              Contracts
            </Link>
            <span>/</span>
            <strong>{contract.code}</strong>
          </nav>
          <div>
            <h1>{contract.title}</h1>
            {contract.propertyAddress ? <p>{contract.propertyAddress}</p> : null}
          </div>
        </div>
        <div className="contract-header-actions">
          <Button
            variant="secondary"
            disabled={!primaryDocumentRecord || documentDownloadMutation.isPending}
            onClick={() => primaryDocumentRecord ? documentDownloadMutation.mutate(primaryDocumentRecord) : undefined}
          >
            <Download size={16} />
            Export PDF
          </Button>
          <Button asChild>
            <Link to={`/contracts/${contract.id}/edit`}>
              <FileText size={16} />
              Edit Contract
            </Link>
          </Button>
        </div>
      </header>
      <div className="contract-detail-workspace">
        <main className="contract-main-column">
          {normalizedActionError ? <p className="form-alert contract-inline-alert">{normalizedActionError.message}</p> : null}
          <section className="contract-card-surface contract-particulars-card">
            <div className="contract-card-heading">
              <p className="contract-section-title">Contract Particulars</p>
              <span className={`contract-signature-badge contract-signature-badge-${statusTone(contract.status)}`}>
                {contract.status.split("_").join(" ")}
              </span>
            </div>
            <div className="contract-particulars-grid">
              <div className="contract-field-group">
                <span>Counterparty</span>
                <strong>{counterparty}</strong>
              </div>
              <div className="contract-field-group">
                <span>Total Value</span>
                <strong className="contract-total-value">{formatUsdValue(contract.totalValue)}</strong>
              </div>
              <div className="contract-field-group">
                <span>Effective Date</span>
                <strong>{formatOptionalDate(contract.effectiveDate)}</strong>
              </div>
              <div className="contract-field-group">
                <span>Expiration Date</span>
                <strong>{formatOptionalDate(contract.endDate)}</strong>
              </div>
            </div>
            <div className="contract-special-conditions">
              <span>Special Conditions</span>
              <p>{contract.specialConditions || "No special conditions returned for this contract."}</p>
            </div>
          </section>

          <section className="contract-card-surface">
            <div className="contract-card-heading">
              <p className="contract-section-title">Associated Documents</p>
              <FileUp size={20} />
            </div>
            <div className="contract-document-panel">
              <label
                className="contract-upload-zone"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  uploadSelectedFile(event.dataTransfer.files[0]);
                }}
              >
                <CloudUpload size={26} />
                <span>Drag & drop files here or click to browse (PDF, DOCX)</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(event) => uploadSelectedFile(event.target.files?.[0])}
                />
              </label>
            </div>
            {selectedFile ? <p className="contract-selected-file">{uploadMutation.isPending ? "Uploading" : "Selected"}: {selectedFile.name}</p> : null}
            <div className="contract-document-list">
              {contract.documents.length ? contract.documents.map((document) => (
                <article key={document.id} className={document.primaryDocument ? "is-primary" : undefined}>
                  <div className="contract-document-type">{documentTypeLabel(document.documentType)}</div>
                  <div className="contract-document-copy">
                    <strong>{document.displayName}</strong>
                    <small>{[document.sizeLabel, formatOptionalDate(document.uploadedAt), document.primaryDocument ? "Primary" : ""].filter(Boolean).join(" / ") || "Metadata updating"}</small>
                    {document.description ? <p>{document.description}</p> : null}
                  </div>
                  <div className="contract-document-actions">
                    <Button
                      size="icon"
                      variant="ghost"
                      title="View details"
                      disabled={!document.url && documentDownloadMutation.isPending}
                      onClick={() => document.url ? window.open(document.url, "_blank", "noopener,noreferrer") : documentDownloadMutation.mutate(document)}
                    >
                      <Eye size={16} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Download"
                      disabled={documentDownloadMutation.isPending}
                      onClick={() => documentDownloadMutation.mutate(document)}
                    >
                      <Download size={16} />
                    </Button>
                  </div>
                </article>
              )) : <p className="muted">No documents uploaded.</p>}
            </div>
          </section>

          <section className="contract-card-surface">
            <p className="contract-section-title">Contract Parties</p>
            <div className="contract-party-list">
              {contract.parties.length ? contract.parties.map((party) => (
                <article key={party.id}>
                  <strong>{party.fullName}</strong>
                  <small>{party.role}</small>
                  <small>{[party.email, party.phone].filter(Boolean).join(" / ") || "Contact updating"}</small>
                </article>
              )) : <p className="muted">No party metadata returned.</p>}
            </div>
          </section>
        </main>

        <aside className="contract-side-column">
          <section className="contract-card-surface contract-workflow-card">
            <p className="contract-section-title">Workflow Actions</p>
            <div className="contract-action-grid">
              {workflowDisplayActions.map((action) => (
                <Button
                  key={action}
                  className={action === "mark-signed" ? "contract-primary-workflow-action" : undefined}
                  variant={action === "mark-signed" ? "primary" : "secondary"}
                  disabled={workflowMutation.isPending || !availableActions.includes(action)}
                  onClick={() => setPendingAction(action)}
                  title={availableActions.includes(action) ? actionLabels[action] : "Unavailable for current status or role"}
                >
                  {actionIcon(action)}
                  {actionLabels[action]}
                </Button>
              ))}
            </div>
          </section>

          <section className="contract-card-surface contract-version-card">
            <p className="contract-section-title">Version History</p>
            <div className="contract-version-timeline">
              {contract.timeline.length ? contract.timeline.map((item) => (
                <article key={item.id}>
                  <span aria-hidden="true" />
                  <div>
                    <strong>{item.title}</strong>
                    {item.timestamp ? <time>{formatOptionalDate(item.timestamp)}</time> : null}
                    <p>{item.description}</p>
                  </div>
                </article>
              )) : (
                <article>
                  <span aria-hidden="true" />
                  <div>
                    <strong>No version history</strong>
                    <p>No timeline returned for this contract.</p>
                  </div>
                </article>
              )}
            </div>
          </section>

        </aside>
      </div>
      <Dialog open={Boolean(pendingAction)} onClose={() => setPendingAction(null)} title="Confirm contract action">
        <div className="dialog-body">
          <p>Confirm {pendingAction ? actionLabels[pendingAction].toLowerCase() : "this action"} for contract {contract.code}?</p>
          {pendingAction === "cancel" ? (
            <textarea className="input textarea" value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} placeholder="Cancellation reason" />
          ) : null}
        </div>
        <footer className="dialog-actions">
          <Button variant="secondary" onClick={() => setPendingAction(null)}>Cancel</Button>
          <Button
            variant={pendingAction === "cancel" ? "danger" : "primary"}
            disabled={workflowMutation.isPending || (pendingAction === "cancel" && !cancelReason.trim())}
            onClick={() => workflowMutation.mutate()}
          >
            Confirm
          </Button>
        </footer>
      </Dialog>
    </section>
  );
}
