import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, FileUp, Send, Signature, XCircle } from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { useAuth } from "../../shared/auth/useAuth";
import { Button } from "../../shared/ui/Button";
import { Dialog } from "../../shared/ui/Dialog";
import { EmptyState } from "../../shared/ui/EmptyState";
import { FileUploader } from "../../shared/ui/FileUploader";
import { Input } from "../../shared/ui/Input";
import { Select } from "../../shared/ui/Select";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { formatCurrency } from "../../shared/lib/format";
import type { RoleCode } from "../../shared/types/auth";
import { ContractForm, toContractRequest, type ContractFormValues } from "./ContractForm";
import {
  getContract,
  runContractWorkflowAction,
  updateContract,
  uploadContractDocument,
  type ContractDocumentType,
  type ContractWorkflowAction
} from "./contractApi";

const documentTypeOptions = [
  { label: "Draft", value: "DRAFT" },
  { label: "Final", value: "FINAL" },
  { label: "Signed", value: "SIGNED" },
  { label: "Attachment", value: "ATTACHMENT" }
];

const actionLabels: Record<ContractWorkflowAction, string> = {
  approve: "Approve",
  cancel: "Cancel",
  "mark-signed": "Mark signed",
  "submit-review": "Submit review"
};

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

export function ContractDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<ContractDocumentType>("SIGNED");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [primaryDocument, setPrimaryDocument] = useState(true);
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
  const updateMutation = useMutation({
    mutationFn: (values: ContractFormValues) => updateContract(id ?? "", toContractRequest(values)),
    onSuccess: (contract) => {
      queryClient.setQueryData(["contract", id], contract);
      return invalidateContractData();
    }
  });
  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!selectedFile) {
        throw new Error("Choose a document to upload.");
      }

      return uploadContractDocument(id ?? "", {
        description: description || undefined,
        displayName: displayName || selectedFile.name,
        documentType,
        file: selectedFile,
        primaryDocument
      });
    },
    onSuccess: () => {
      setSelectedFile(null);
      setDisplayName("");
      setDescription("");
      setPrimaryDocument(true);
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
  const contract = contractQuery.data;
  const normalizedError = contractQuery.error ? normalizeUnknownError(contractQuery.error) : null;
  const actionError = updateMutation.error ?? uploadMutation.error ?? workflowMutation.error;
  const normalizedActionError = actionError ? normalizeUnknownError(actionError) : null;
  const availableActions = contract ? getAvailableActions(contract.status, user?.roles ?? []) : [];

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
      <section className="content-section">
        <EmptyState title="Contract could not be loaded" description={normalizedError.message} action={<Button onClick={() => contractQuery.refetch()}>Retry</Button>} />
      </section>
    );
  }

  if (!contract) {
    return null;
  }

  return (
    <section>
      <Button asChild variant="ghost" size="sm">
        <Link to="/contracts">
          <ArrowLeft size={16} />
          Back to contracts
        </Link>
      </Button>
      <div className="detail-header">
        <div>
          <div className="detail-badges">
            <StatusBadge tone={statusTone(contract.status)}>{contract.status}</StatusBadge>
            <StatusBadge tone="info">{contract.contractType}</StatusBadge>
          </div>
          <h1>{contract.title}</h1>
          <p className="muted">{contract.code}</p>
        </div>
      </div>
      {normalizedActionError ? <p className="form-alert">{normalizedActionError.message}</p> : null}
      <div className="contract-detail-grid">
        <section className="content-section contract-profile-card">
          <p className="eyebrow">Metadata</p>
          <div><span>Value</span><strong>{contract.totalValue ? formatCurrency(contract.totalValue, contract.currency) : "Updating"}</strong></div>
          <div><span>Customer</span><strong>{contract.customerId ?? "Not linked"}</strong></div>
          <div><span>Property</span><strong>{contract.propertyId ?? "Not linked"}</strong></div>
          <div><span>Listing</span><strong>{contract.listingId ?? "Not linked"}</strong></div>
          <div><span>Transaction</span><strong>{contract.transactionId ?? "Not linked"}</strong></div>
          <div><span>Effective date</span><strong>{contract.effectiveDate || "Updating"}</strong></div>
        </section>
        <section className="content-section">
          <div className="section-header">
            <div>
              <p className="eyebrow">Workflow</p>
              <h2>Contract actions</h2>
            </div>
          </div>
          <div className="contract-action-grid">
            {availableActions.length ? availableActions.map((action) => (
              <Button
                key={action}
                variant={action === "cancel" ? "danger" : "secondary"}
                disabled={workflowMutation.isPending}
                onClick={() => setPendingAction(action)}
              >
                {actionIcon(action)}
                {actionLabels[action]}
              </Button>
            )) : <p className="muted">No contract action is available for your role and this status.</p>}
          </div>
        </section>
      </div>
      <section className="content-section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Update</p>
            <h2>Edit contract</h2>
          </div>
        </div>
        <ContractForm
          contract={contract}
          submitLabel="Save contract"
          onSubmit={(values) => updateMutation.mutateAsync(values).then(() => undefined)}
        />
      </section>
      <div className="contract-detail-grid">
        <section className="content-section">
          <div className="section-header">
            <div>
              <p className="eyebrow">Documents</p>
              <h2>Contract documents</h2>
            </div>
            <FileUp size={20} />
          </div>
          <form className="contract-upload-form" onSubmit={(event) => {
            event.preventDefault();
            uploadMutation.mutate();
          }}>
            <FileUploader onFilesSelected={(files) => setSelectedFile(files[0] ?? null)} />
            <Select label="Document type" options={documentTypeOptions} value={documentType} onChange={(event) => setDocumentType(event.target.value as ContractDocumentType)} />
            <Input label="Display name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
            <Input label="Description" value={description} onChange={(event) => setDescription(event.target.value)} />
            <label className="toggle-field">
              <input type="checkbox" checked={primaryDocument} onChange={(event) => setPrimaryDocument(event.target.checked)} />
              <span>Primary</span>
            </label>
            <Button type="submit" disabled={!selectedFile || uploadMutation.isPending}>Upload document</Button>
          </form>
          {selectedFile ? <p className="muted">Selected: {selectedFile.name}</p> : null}
          <div className="customer-list-stack">
            {contract.documents.length ? contract.documents.map((document) => (
              <article key={document.id}>
                <strong>{document.displayName}</strong>
                <small>{document.documentType}{document.primaryDocument ? " / primary" : ""}</small>
                {document.description ? <small>{document.description}</small> : null}
                {document.url ? <a href={document.url} target="_blank" rel="noreferrer">Open document</a> : null}
              </article>
            )) : <p className="muted">No documents uploaded.</p>}
          </div>
        </section>
        <section className="content-section">
          <div className="section-header">
            <div>
              <p className="eyebrow">Parties</p>
              <h2>Contract parties</h2>
            </div>
          </div>
          <div className="customer-list-stack">
            {contract.parties.length ? contract.parties.map((party) => (
              <article key={party.id}>
                <strong>{party.fullName}</strong>
                <small>{party.role}</small>
                <small>{[party.email, party.phone].filter(Boolean).join(" / ") || "Contact updating"}</small>
              </article>
            )) : <p className="muted">No party metadata returned.</p>}
          </div>
        </section>
      </div>
      <section className="content-section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Timeline</p>
            <h2>Status timeline</h2>
          </div>
        </div>
        <div className="timeline-list">
          {contract.timeline.length ? contract.timeline.map((item) => (
            <article key={item.id}>
              <span>{item.type}</span>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
              {item.timestamp ? <small>{item.timestamp}</small> : null}
            </article>
          )) : <p className="muted">No timeline returned.</p>}
        </div>
      </section>
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
