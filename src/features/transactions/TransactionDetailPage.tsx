import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Banknote, Clock3, Download, FileText, ReceiptText, Upload } from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { downloadFile, uploadFile, type FileAccessLevel, type FileResource } from "../../shared/api/fileApi";
import { Button } from "../../shared/ui/Button";
import { Dialog } from "../../shared/ui/Dialog";
import { EmptyState } from "../../shared/ui/EmptyState";
import { FileUploader } from "../../shared/ui/FileUploader";
import { Input } from "../../shared/ui/Input";
import { Select } from "../../shared/ui/Select";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { formatCurrency } from "../../shared/lib/format";
import {
  addDeposit,
  addInvoice,
  addPaymentSchedule,
  createIdempotencyKey,
  getTransaction,
  updateTransactionStatus
} from "./transactionApi";

type ModalKind = "deposit" | "document" | "invoice" | "schedule" | null;

function statusTone(status: string) {
  if (status === "COMPLETED") {
    return "success";
  }

  if (status === "CANCELLED" || status === "REFUNDED") {
    return "danger";
  }

  if (status === "PENDING" || status === "DEPOSITED" || status === "PAYMENT_IN_PROGRESS") {
    return "warning";
  }

  return "info";
}

function toNumber(value: string) {
  return value.trim() ? Number(value) : undefined;
}

function displayEnumLabel(value: string) {
  return value.split("_").join(" ");
}

function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "TX";
}

function formatFileSize(size?: number) {
  if (!size) {
    return "Size updating";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export function TransactionDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [activeModal, setActiveModal] = useState<ModalKind>(null);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [documentAccessLevel, setDocumentAccessLevel] = useState<FileAccessLevel>("PRIVATE");
  const [uploadedDocuments, setUploadedDocuments] = useState<FileResource[]>([]);
  const transactionQuery = useQuery({
    enabled: Boolean(id),
    queryFn: () => getTransaction(id ?? ""),
    queryKey: ["transaction", id],
    retry: 1
  });
  const invalidateTransactionData = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["transaction", id] }),
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
    ]);
  const markPaidMutation = useMutation({
    mutationFn: () => updateTransactionStatus(id ?? "", "COMPLETED"),
    onSuccess: invalidateTransactionData
  });
  const depositMutation = useMutation({
    mutationFn: () =>
      addDeposit(id ?? "", {
        amount: Number(amount),
        currency: transactionQuery.data?.currency ?? "VND",
        date: date || undefined,
        idempotencyKey: createIdempotencyKey("deposit"),
        notes: notes || undefined
      }),
    onSuccess: () => {
      closeModal();
      return invalidateTransactionData();
    }
  });
  const scheduleMutation = useMutation({
    mutationFn: () =>
      addPaymentSchedule(id ?? "", {
        amount: Number(amount),
        currency: transactionQuery.data?.currency ?? "VND",
        dueDate: date,
        notes: notes || undefined
      }),
    onSuccess: () => {
      closeModal();
      return invalidateTransactionData();
    }
  });
  const documentMutation = useMutation({
    mutationFn: () => Promise.all(selectedFiles.map((file) => uploadFile(file, documentAccessLevel))),
    onSuccess: (documents) => {
      setUploadedDocuments((current) => [...documents, ...current]);
      closeModal();
    }
  });
  const invoiceMutation = useMutation({
    mutationFn: () => addInvoice(id ?? "", { invoiceNumber: invoiceNumber || undefined, notes: notes || undefined }),
    onSuccess: () => {
      closeModal();
      return invalidateTransactionData();
    }
  });
  const transaction = transactionQuery.data;
  const recordedPaidAmount = useMemo(() => {
    if (!transaction) {
      return 0;
    }

    return [...transaction.deposits, ...transaction.payments].reduce((sum, record) => sum + (record.amount ?? 0), 0);
  }, [transaction]);
  const totalAmount = transaction?.totalAmount ?? 0;
  const paidAmount = transaction?.confirmedAmount ?? recordedPaidAmount;
  const remainingAmount = transaction?.remainingAmount ?? Math.max(totalAmount - paidAmount, 0);
  const normalizedError = transactionQuery.error ? normalizeUnknownError(transactionQuery.error) : null;
  const actionError =
    markPaidMutation.error ??
    depositMutation.error ??
    scheduleMutation.error ??
    documentMutation.error ??
    invoiceMutation.error;
  const normalizedActionError = actionError ? normalizeUnknownError(actionError) : null;

  function closeModal() {
    setActiveModal(null);
    setAmount("");
    setDate("");
    setNotes("");
    setInvoiceNumber("");
    setSelectedFiles([]);
    setDocumentAccessLevel("PRIVATE");
  }

  function submitModal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (activeModal === "deposit") {
      depositMutation.mutate();
    }

    if (activeModal === "schedule") {
      scheduleMutation.mutate();
    }

    if (activeModal === "document") {
      documentMutation.mutate();
    }

    if (activeModal === "invoice") {
      invoiceMutation.mutate();
    }
  }

  if (!id) {
    return (
      <section className="content-section">
        <EmptyState title="Transaction not found" description="The transaction URL is missing an id." />
      </section>
    );
  }

  if (transactionQuery.isLoading) {
    return (
      <section className="detail-skeleton">
        <div />
        <div />
      </section>
    );
  }

  if (normalizedError) {
    return (
      <section className="transaction-detail-page">
        <EmptyState title="Transaction could not be loaded" description={normalizedError.message} action={<Button onClick={() => transactionQuery.refetch()}>Retry</Button>} />
      </section>
    );
  }

  if (!transaction) {
    return null;
  }

  return (
    <section className="transaction-detail-page">
      <header className="transaction-page-header">
        <div className="transaction-page-title">
          <nav className="transaction-breadcrumb" aria-label="Transaction breadcrumb">
            <Link to="/transactions"><ArrowLeft size={16} />Transactions</Link>
            <span>/</span>
            <strong>{transaction.code}</strong>
          </nav>
          <div>
            <h1>Transaction #{transaction.code}</h1>
            <p>{transaction.title}</p>
          </div>
        </div>
        <div className="transaction-header-actions">
          <Button variant="secondary" onClick={() => setActiveModal("invoice")}>
            <FileText size={16} />
            Generate Invoice
          </Button>
          <Button disabled={markPaidMutation.isPending || transaction.status === "COMPLETED"} onClick={() => markPaidMutation.mutate()}>
            <Banknote size={16} />
            Mark as Paid
          </Button>
          <Button asChild variant="secondary">
            <Link to={`/transactions/${transaction.id}/edit`}>Update Transaction</Link>
          </Button>
        </div>
      </header>

      {normalizedActionError ? <p className="form-alert transaction-inline-alert">{normalizedActionError.message}</p> : null}

      <div className="transaction-dashboard-grid">
        <main className="transaction-dashboard-main">
          <section className="transaction-dashboard-card transaction-status-card">
            <div className="transaction-status-hero">
              <span><Clock3 size={30} /></span>
              <div>
                <p className="transaction-section-title">Current Status</p>
                <StatusBadge tone={statusTone(transaction.status)}>{displayEnumLabel(transaction.status)}</StatusBadge>
              </div>
            </div>
            <div className="transaction-money-grid">
              <article><span>Total Amount</span><strong>{formatCurrency(totalAmount, transaction.currency)}</strong></article>
              <article className="is-paid"><span>Amount Paid</span><strong>{formatCurrency(paidAmount, transaction.currency)}</strong></article>
              <article><span>Remaining Balance</span><strong>{formatCurrency(remainingAmount, transaction.currency)}</strong></article>
            </div>
          </section>

          <section className="transaction-dashboard-card">
            <p className="transaction-section-title">Counterparty Info</p>
            <div className="transaction-counterparty">
              <span>{initials(transaction.title)}</span>
              <div>
                <strong>{transaction.customerName || (transaction.customerId ? `Customer #${transaction.customerId}` : "Counterparty updating")}</strong>
                <small>Email is not returned by the transaction API yet.</small>
                <small>Bank details are not returned by the transaction API yet.</small>
              </div>
            </div>
          </section>
        </main>

        <aside className="transaction-dashboard-side">
          <section className="transaction-dashboard-card">
            <div className="transaction-card-heading">
              <p className="transaction-section-title">Payment Schedule</p>
              <Button variant="ghost" size="sm" onClick={() => setActiveModal("schedule")}>Edit Terms</Button>
            </div>
            <table className="transaction-schedule-table">
              <thead><tr><th>Installment</th><th>Due Date</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {transaction.paymentSchedules.length ? transaction.paymentSchedules.map((schedule, index) => (
                  <tr key={schedule.id}>
                    <td>#{index + 1}</td>
                    <td>{schedule.dueDate || schedule.date || "Date updating"}</td>
                    <td>{schedule.amount != null ? formatCurrency(schedule.amount, schedule.currency) : "Amount updating"}</td>
                    <td><StatusBadge tone={statusTone(schedule.status)}>{displayEnumLabel(schedule.status)}</StatusBadge></td>
                  </tr>
                )) : (
                  <tr><td colSpan={4}>No payment schedules.</td></tr>
                )}
              </tbody>
            </table>
          </section>

          <section className="transaction-dashboard-card">
            <div className="transaction-card-heading">
              <p className="transaction-section-title">Payment Records & Evidence</p>
              <Button variant="secondary" size="sm" onClick={() => setActiveModal("document")}><Upload size={15} />Upload Document</Button>
            </div>
            <div className="transaction-evidence-list">
              {uploadedDocuments.map((document) => (
                <article key={document.id}>
                  <span><FileText size={18} /></span>
                  <div>
                    <strong>{document.originalFileName || document.fileName}</strong>
                    <small>{formatFileSize(document.size)}{document.uploadedAt ? ` / ${document.uploadedAt}` : ""}</small>
                  </div>
                  <Button
                    aria-label={`Download ${document.originalFileName || document.fileName}`}
                    size="sm"
                    variant="ghost"
                    onClick={() => downloadFile(document.id, document.originalFileName || document.fileName)}
                  >
                    <Download size={16} />
                  </Button>
                </article>
              ))}
              {[...transaction.payments, ...transaction.deposits].map((record) => (
                <article key={record.id}>
                  <span><ReceiptText size={18} /></span>
                  <div>
                    <strong>{record.amount != null ? formatCurrency(record.amount, record.currency) : "Amount updating"}</strong>
                    <small>{record.date || "Date updating"}{record.notes ? ` / ${record.notes}` : ""}</small>
                  </div>
                </article>
              ))}
              {!uploadedDocuments.length && !transaction.payments.length && !transaction.deposits.length ? <p className="muted">No evidence documents uploaded.</p> : null}
            </div>
            <div className="transaction-missing-evidence">
              Awaiting receipt evidence for outstanding balance.
            </div>
          </section>
        </aside>
      </div>

      <Dialog open={Boolean(activeModal)} onClose={closeModal} title={activeModal === "invoice" ? "Generate Invoice" : activeModal === "schedule" ? "Edit Payment Terms" : activeModal === "deposit" ? "Add Deposit" : "Upload Document"}>
        <form className="dialog-body transaction-modal-form" onSubmit={submitModal}>
          {activeModal === "invoice" ? (
            <>
              <Input label="Invoice number" value={invoiceNumber} onChange={(event) => setInvoiceNumber(event.target.value)} />
              <Input label="Notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
            </>
          ) : activeModal === "document" ? (
            <>
              <FileUploader
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                multiple
                onFilesSelected={setSelectedFiles}
              />
              {selectedFiles.length ? (
                <div className="transaction-selected-documents">
                  {selectedFiles.map((file) => (
                    <span key={`${file.name}-${file.size}`}>{file.name} / {formatFileSize(file.size)}</span>
                  ))}
                </div>
              ) : null}
              <Select
                label="Access level"
                options={[
                  { label: "Private", value: "PRIVATE" },
                  { label: "Public", value: "PUBLIC" }
                ]}
                value={documentAccessLevel}
                onChange={(event) => setDocumentAccessLevel(event.target.value as FileAccessLevel)}
              />
              <p className="muted">
                Files are uploaded through the file API. The current transaction API does not return a transaction-specific document list yet.
              </p>
            </>
          ) : (
            <>
              <Input label="Amount" value={amount} onChange={(event) => setAmount(event.target.value)} />
              <Input label={activeModal === "schedule" ? "Due date" : "Date"} type="date" value={date} onChange={(event) => setDate(event.target.value)} />
              <Input label="Notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
            </>
          )}
          <footer className="dialog-actions">
            <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button
              type="submit"
              disabled={
                (activeModal !== "invoice" && activeModal !== "document" && !toNumber(amount)) ||
                (activeModal === "schedule" && !date) ||
                (activeModal === "document" && !selectedFiles.length) ||
                depositMutation.isPending ||
                scheduleMutation.isPending ||
                documentMutation.isPending ||
                invoiceMutation.isPending
              }
            >
              Confirm
            </Button>
          </footer>
        </form>
      </Dialog>
    </section>
  );
}
