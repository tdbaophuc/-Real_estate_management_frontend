import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Banknote, FileText, ReceiptText } from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Input } from "../../shared/ui/Input";
import { Select } from "../../shared/ui/Select";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { formatCurrency } from "../../shared/lib/format";
import {
  addDeposit,
  addInvoice,
  addPayment,
  addPaymentSchedule,
  addReceipt,
  createIdempotencyKey,
  getTransaction,
  updateTransactionStatus,
  type TransactionStatus
} from "./transactionApi";

const statusOptions: Array<{ label: string; value: TransactionStatus }> = [
  { label: "Pending", value: "PENDING" },
  { label: "Deposited", value: "DEPOSITED" },
  { label: "Contract signed", value: "CONTRACT_SIGNED" },
  { label: "Payment in progress", value: "PAYMENT_IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Refunded", value: "REFUNDED" }
];

function statusTone(status: string) {
  if (status === "COMPLETED") {
    return "success";
  }

  if (status === "CANCELLED" || status === "REFUNDED") {
    return "danger";
  }

  if (status === "PENDING" || status === "DEPOSITED") {
    return "warning";
  }

  return "info";
}

function toNumber(value: string) {
  return value.trim() ? Number(value) : undefined;
}

export function TransactionDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [nextStatus, setNextStatus] = useState<TransactionStatus>("PENDING");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositDate, setDepositDate] = useState("");
  const [depositNotes, setDepositNotes] = useState("");
  const [scheduleAmount, setScheduleAmount] = useState("");
  const [scheduleDueDate, setScheduleDueDate] = useState("");
  const [scheduleNotes, setScheduleNotes] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("OFFLINE");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceNotes, setInvoiceNotes] = useState("");
  const [receiptPaymentId, setReceiptPaymentId] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [receiptNotes, setReceiptNotes] = useState("");
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
  const statusMutation = useMutation({
    mutationFn: () => updateTransactionStatus(id ?? "", nextStatus),
    onSuccess: invalidateTransactionData
  });
  const depositMutation = useMutation({
    mutationFn: () =>
      addDeposit(id ?? "", {
        amount: Number(depositAmount),
        currency: transactionQuery.data?.currency ?? "VND",
        date: depositDate || undefined,
        idempotencyKey: createIdempotencyKey("deposit"),
        notes: depositNotes || undefined
      }),
    onSuccess: () => {
      setDepositAmount("");
      setDepositDate("");
      setDepositNotes("");
      return invalidateTransactionData();
    }
  });
  const scheduleMutation = useMutation({
    mutationFn: () =>
      addPaymentSchedule(id ?? "", {
        amount: Number(scheduleAmount),
        currency: transactionQuery.data?.currency ?? "VND",
        dueDate: scheduleDueDate,
        notes: scheduleNotes || undefined
      }),
    onSuccess: () => {
      setScheduleAmount("");
      setScheduleDueDate("");
      setScheduleNotes("");
      return invalidateTransactionData();
    }
  });
  const paymentMutation = useMutation({
    mutationFn: () =>
      addPayment(id ?? "", {
        amount: Number(paymentAmount),
        currency: transactionQuery.data?.currency ?? "VND",
        date: paymentDate || undefined,
        idempotencyKey: createIdempotencyKey("payment"),
        method: paymentMethod,
        notes: paymentNotes || undefined,
        referenceNumber: paymentReference || undefined
      }),
    onSuccess: () => {
      setPaymentAmount("");
      setPaymentDate("");
      setPaymentReference("");
      setPaymentNotes("");
      return invalidateTransactionData();
    }
  });
  const invoiceMutation = useMutation({
    mutationFn: () => addInvoice(id ?? "", { invoiceNumber: invoiceNumber || undefined, notes: invoiceNotes || undefined }),
    onSuccess: () => {
      setInvoiceNumber("");
      setInvoiceNotes("");
      return invalidateTransactionData();
    }
  });
  const receiptMutation = useMutation({
    mutationFn: () => addReceipt(id ?? "", receiptPaymentId, { notes: receiptNotes || undefined, receiptNumber: receiptNumber || undefined }),
    onSuccess: () => {
      setReceiptPaymentId("");
      setReceiptNumber("");
      setReceiptNotes("");
      return invalidateTransactionData();
    }
  });
  const transaction = transactionQuery.data;
  const normalizedError = transactionQuery.error ? normalizeUnknownError(transactionQuery.error) : null;
  const actionError =
    statusMutation.error ??
    depositMutation.error ??
    scheduleMutation.error ??
    paymentMutation.error ??
    invoiceMutation.error ??
    receiptMutation.error;
  const normalizedActionError = actionError ? normalizeUnknownError(actionError) : null;

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
      <section className="content-section">
        <EmptyState title="Transaction could not be loaded" description={normalizedError.message} action={<Button onClick={() => transactionQuery.refetch()}>Retry</Button>} />
      </section>
    );
  }

  if (!transaction) {
    return null;
  }

  function submitStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    statusMutation.mutate();
  }

  return (
    <section>
      <Button asChild variant="ghost" size="sm">
        <Link to="/transactions">
          <ArrowLeft size={16} />
          Back to transactions
        </Link>
      </Button>
      <div className="detail-header">
        <div>
          <div className="detail-badges">
            <StatusBadge tone={statusTone(transaction.status)}>{transaction.status}</StatusBadge>
          </div>
          <h1>{transaction.title}</h1>
          <p className="muted">{transaction.code}</p>
        </div>
      </div>
      {normalizedActionError ? <p className="form-alert">{normalizedActionError.message}</p> : null}
      <div className="transaction-detail-grid">
        <section className="content-section transaction-profile-card">
          <p className="eyebrow">Metadata</p>
          <div><span>Total</span><strong>{transaction.totalAmount ? formatCurrency(transaction.totalAmount, transaction.currency) : "Updating"}</strong></div>
          <div><span>Contract</span><strong>{transaction.contractId ?? "Not linked"}</strong></div>
          <div><span>Customer</span><strong>{transaction.customerId ?? "Not linked"}</strong></div>
          <div><span>Property</span><strong>{transaction.propertyId ?? "Not linked"}</strong></div>
        </section>
        <section className="content-section">
          <div className="section-header">
            <div>
              <p className="eyebrow">Status</p>
              <h2>Update status</h2>
            </div>
          </div>
          <form className="transaction-inline-form" onSubmit={submitStatus}>
            <Select label="Status" options={statusOptions} value={nextStatus} onChange={(event) => setNextStatus(event.target.value as TransactionStatus)} />
            <Button type="submit" disabled={nextStatus === transaction.status || statusMutation.isPending}>Update status</Button>
          </form>
        </section>
      </div>
      <div className="transaction-detail-grid">
        <section className="content-section">
          <div className="section-header"><div><p className="eyebrow">Deposit</p><h2>Add deposit</h2></div><Banknote size={20} /></div>
          <form className="transaction-inline-form" onSubmit={(event) => {
            event.preventDefault();
            depositMutation.mutate();
          }}>
            <Input label="Amount" value={depositAmount} onChange={(event) => setDepositAmount(event.target.value)} />
            <Input label="Date" type="date" value={depositDate} onChange={(event) => setDepositDate(event.target.value)} />
            <Input label="Notes" value={depositNotes} onChange={(event) => setDepositNotes(event.target.value)} />
            <Button type="submit" disabled={!toNumber(depositAmount) || depositMutation.isPending}>Add deposit</Button>
          </form>
          <RecordStack records={transaction.deposits} currency={transaction.currency} emptyText="No deposits recorded." />
        </section>
        <section className="content-section">
          <div className="section-header"><div><p className="eyebrow">Schedule</p><h2>Payment schedules</h2></div></div>
          <form className="transaction-inline-form" onSubmit={(event) => {
            event.preventDefault();
            scheduleMutation.mutate();
          }}>
            <Input label="Amount" value={scheduleAmount} onChange={(event) => setScheduleAmount(event.target.value)} />
            <Input label="Due date" type="date" value={scheduleDueDate} onChange={(event) => setScheduleDueDate(event.target.value)} />
            <Input label="Notes" value={scheduleNotes} onChange={(event) => setScheduleNotes(event.target.value)} />
            <Button type="submit" disabled={!toNumber(scheduleAmount) || !scheduleDueDate || scheduleMutation.isPending}>Add schedule</Button>
          </form>
          <RecordStack records={transaction.paymentSchedules} currency={transaction.currency} emptyText="No payment schedules." />
        </section>
      </div>
      <section className="content-section">
        <div className="section-header"><div><p className="eyebrow">Payments</p><h2>Offline or external payment records</h2></div></div>
        <form className="transaction-payment-form" onSubmit={(event) => {
          event.preventDefault();
          paymentMutation.mutate();
        }}>
          <Input label="Amount" value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} />
          <Input label="Date" type="date" value={paymentDate} onChange={(event) => setPaymentDate(event.target.value)} />
          <Input label="Method" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value.toUpperCase())} />
          <Input label="Reference" value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} />
          <Input label="Notes" value={paymentNotes} onChange={(event) => setPaymentNotes(event.target.value)} />
          <Button type="submit" disabled={!toNumber(paymentAmount) || paymentMutation.isPending}>Add payment</Button>
        </form>
        <div className="customer-list-stack">
          {transaction.payments.length ? transaction.payments.map((payment) => (
            <article key={payment.id}>
              <strong>{payment.amount ? formatCurrency(payment.amount, payment.currency) : "Amount updating"}</strong>
              <small>{payment.method} / {payment.referenceNumber || "No reference"}</small>
              <small>{payment.date || "Date updating"}</small>
            </article>
          )) : <p className="muted">No payments recorded.</p>}
        </div>
      </section>
      <div className="transaction-detail-grid">
        <section className="content-section">
          <div className="section-header"><div><p className="eyebrow">Invoices</p><h2>Invoice metadata</h2></div><FileText size={20} /></div>
          <form className="transaction-inline-form" onSubmit={(event) => {
            event.preventDefault();
            invoiceMutation.mutate();
          }}>
            <Input label="Invoice number" value={invoiceNumber} onChange={(event) => setInvoiceNumber(event.target.value)} />
            <Input label="Notes" value={invoiceNotes} onChange={(event) => setInvoiceNotes(event.target.value)} />
            <Button type="submit" disabled={invoiceMutation.isPending}>Create invoice</Button>
          </form>
          <div className="customer-list-stack">
            {transaction.invoices.length ? transaction.invoices.map((invoice) => (
              <article key={invoice.id}>
                <strong>{invoice.invoiceNumber}</strong>
                <small>{invoice.issuedAt || "Issue date updating"}</small>
                {invoice.notes ? <small>{invoice.notes}</small> : null}
              </article>
            )) : <p className="muted">No invoices created.</p>}
          </div>
        </section>
        <section className="content-section">
          <div className="section-header"><div><p className="eyebrow">Receipts</p><h2>Receipt metadata</h2></div><ReceiptText size={20} /></div>
          <form className="transaction-inline-form" onSubmit={(event) => {
            event.preventDefault();
            receiptMutation.mutate();
          }}>
            <Input label="Payment id" value={receiptPaymentId} onChange={(event) => setReceiptPaymentId(event.target.value)} />
            <Input label="Receipt number" value={receiptNumber} onChange={(event) => setReceiptNumber(event.target.value)} />
            <Input label="Notes" value={receiptNotes} onChange={(event) => setReceiptNotes(event.target.value)} />
            <Button type="submit" disabled={!receiptPaymentId.trim() || receiptMutation.isPending}>Create receipt</Button>
          </form>
          <div className="customer-list-stack">
            {transaction.receipts.length ? transaction.receipts.map((receipt) => (
              <article key={receipt.id}>
                <strong>{receipt.receiptNumber}</strong>
                <small>{receipt.issuedAt || "Issue date updating"}</small>
                {receipt.notes ? <small>{receipt.notes}</small> : null}
              </article>
            )) : <p className="muted">No receipts created.</p>}
          </div>
        </section>
      </div>
    </section>
  );
}

function RecordStack({
  currency,
  emptyText,
  records
}: {
  currency: string;
  emptyText: string;
  records: Array<{ amount: number | null; currency?: string; date?: string; dueDate?: string; id: number | string; notes?: string; status?: string }>;
}) {
  return (
    <div className="customer-list-stack">
      {records.length ? records.map((record) => (
        <article key={record.id}>
          <strong>{record.amount ? formatCurrency(record.amount, record.currency ?? currency) : "Amount updating"}</strong>
          <small>{record.dueDate || record.date || "Date updating"}{record.status ? ` / ${record.status}` : ""}</small>
          {record.notes ? <small>{record.notes}</small> : null}
        </article>
      )) : <p className="muted">{emptyText}</p>}
    </div>
  );
}
