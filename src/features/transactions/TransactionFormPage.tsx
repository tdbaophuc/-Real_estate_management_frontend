import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, CircleDollarSign, FileCheck2, FileText, Link as LinkIcon, Save, X } from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Input } from "../../shared/ui/Input";
import { Select } from "../../shared/ui/Select";
import { formatCurrency } from "../../shared/lib/format";
import { searchAdminUsers } from "../admin/adminUserApi";
import { searchContracts } from "../contracts/contractApi";
import { searchCustomers } from "../customers/customerApi";
import { searchProperties } from "../properties/propertyApi";
import {
  createTransaction,
  getTransaction,
  updateTransactionStatus,
  type TransactionStatus,
  type TransactionType
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

const transactionTypeOptions: Array<{ label: string; value: TransactionType }> = [
  { label: "Sale", value: "SALE" },
  { label: "Lease", value: "LEASE" }
];

type SearchSuggestion = {
  id: number | string;
  meta: string;
  title: string;
};

function toNumber(value: string) {
  return value.trim() ? Number(value) : undefined;
}

function EntitySearchPicker({
  items,
  label,
  loading,
  onQueryChange,
  onSelect,
  placeholder,
  query
}: {
  items: SearchSuggestion[];
  label: string;
  loading: boolean;
  onQueryChange: (value: string) => void;
  onSelect: (item: SearchSuggestion) => void;
  placeholder: string;
  query: string;
}) {
  const [open, setOpen] = useState(false);
  const showSuggestions = open && (loading || items.length > 0 || Boolean(query.trim()));

  return (
    <div
      className="field transaction-search-picker"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <span>{label}</span>
      <input
        className="input"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
      />
      {showSuggestions ? (
        <div className="transaction-search-suggestions">
          {loading ? <p>Searching...</p> : null}
          {!loading && items.length ? items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelect(item);
                setOpen(false);
              }}
            >
              <strong>{item.title}</strong>
              <small>{item.meta}</small>
            </button>
          )) : null}
          {!loading && query.trim() && items.length === 0 ? <p>No suggestions found</p> : null}
        </div>
      ) : null}
    </div>
  );
}

export function TransactionFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [contractId, setContractId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [agentId, setAgentId] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [currency, setCurrency] = useState("VND");
  const [status, setStatus] = useState<TransactionStatus>("PENDING");
  const [transactionType, setTransactionType] = useState<TransactionType>("SALE");
  const [transactionDate, setTransactionDate] = useState("");
  const [expectedCompletionDate, setExpectedCompletionDate] = useState("");
  const [notes, setNotes] = useState("");
  const [agentSearch, setAgentSearch] = useState("");
  const [contractSearch, setContractSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [propertySearch, setPropertySearch] = useState("");
  const transactionQuery = useQuery({
    enabled: isEditing,
    queryFn: () => getTransaction(id ?? ""),
    queryKey: ["transaction", id],
    retry: 1
  });
  const contractsQuery = useQuery({
    queryFn: () => searchContracts({ keyword: contractSearch, page: 0, size: 25 }),
    queryKey: ["transaction-form-contracts", contractSearch],
    retry: 1
  });
  const customersQuery = useQuery({
    queryFn: () => searchCustomers({ keyword: customerSearch, page: 0, size: 25, status: "ACTIVE" }),
    queryKey: ["transaction-form-customers", customerSearch],
    retry: 1
  });
  const propertiesQuery = useQuery({
    queryFn: () => searchProperties({ keyword: propertySearch, page: 0, size: 25 }),
    queryKey: ["transaction-form-properties", propertySearch],
    retry: 1
  });
  const agentsQuery = useQuery({
    queryFn: () => searchAdminUsers({ keyword: agentSearch, page: 0, role: "AGENT", size: 25, status: "ACTIVE" }),
    queryKey: ["transaction-form-agents", agentSearch],
    retry: 1
  });
  const saveMutation = useMutation({
    mutationFn: () =>
      isEditing
        ? updateTransactionStatus(id ?? "", status)
        : createTransaction({
            agentId: toNumber(agentId),
            agreedValue: toNumber(totalAmount),
            code: code.trim(),
            contractId: toNumber(contractId),
            currency: currency.trim().toUpperCase(),
            customerId: toNumber(customerId),
            expectedCompletionDate: expectedCompletionDate || undefined,
            notes: notes || undefined,
            propertyId: toNumber(propertyId),
            transactionDate: transactionDate || undefined,
            transactionType,
            title: title.trim(),
            totalAmount: toNumber(totalAmount)
          }),
    onSuccess: (transaction) => {
      queryClient.setQueryData(["transaction", transaction.id], transaction);
      void queryClient.invalidateQueries({ queryKey: ["transactions"] });
      navigate(`/transactions/${transaction.id}`);
    }
  });
  const transaction = transactionQuery.data;
  const normalizedError = transactionQuery.error ? normalizeUnknownError(transactionQuery.error) : null;
  const selectedContract = contractsQuery.data?.content.find((contract) => String(contract.id) === contractId);
  const selectedCustomer = customersQuery.data?.content.find((customer) => String(customer.id) === customerId);
  const selectedProperty = propertiesQuery.data?.content.find((property) => String(property.id) === propertyId);
  const selectedAgent = agentsQuery.data?.content.find((agent) => String(agent.id) === agentId);
  const completionItems = [
    { done: Boolean(code && title), label: "Particulars" },
    { done: Boolean(contractId || customerId || propertyId), label: "Linked entity" },
    { done: Boolean(totalAmount && currency), label: "Financials" },
    { done: Boolean(status), label: "Status" }
  ];
  const completionPercent = Math.round((completionItems.filter((item) => item.done).length / completionItems.length) * 100);
  const previewAmount = totalAmount && !Number.isNaN(Number(totalAmount))
    ? formatCurrency(Number(totalAmount), currency || "VND")
    : "Amount updating";

  useEffect(() => {
    if (!transaction) {
      return;
    }

    setCode(transaction.code);
    setTitle(transaction.title);
    setContractId(transaction.contractId != null ? String(transaction.contractId) : "");
    setCustomerId(transaction.customerId != null ? String(transaction.customerId) : "");
    setPropertyId(transaction.propertyId != null ? String(transaction.propertyId) : "");
    setAgentId(transaction.agentId != null ? String(transaction.agentId) : "");
    setTotalAmount(transaction.totalAmount != null ? String(transaction.totalAmount) : "");
    setCurrency(transaction.currency);
    setStatus(statusOptions.some((option) => option.value === transaction.status) ? transaction.status as TransactionStatus : "PENDING");
    setTransactionType(transaction.transactionType === "LEASE" ? "LEASE" : "SALE");
    setTransactionDate(transaction.transactionDate);
    setExpectedCompletionDate(transaction.expectedCompletionDate);
    setNotes(transaction.notes ?? "");
  }, [transaction]);

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isEditing || (code.trim() && title.trim())) {
      saveMutation.mutate();
    }
  }

  if (isEditing && transactionQuery.isLoading) {
    return (
      <section className="transaction-editor-page">
        <div className="detail-skeleton"><div /><div /></div>
      </section>
    );
  }

  if (normalizedError) {
    return (
      <section className="transaction-editor-page">
        <EmptyState title="Transaction could not be loaded" description={normalizedError.message} action={<Button onClick={() => transactionQuery.refetch()}>Retry</Button>} />
      </section>
    );
  }

  return (
    <section className="transaction-editor-page">
      <header className="transaction-page-header">
        <div className="transaction-page-title">
          <nav className="transaction-breadcrumb" aria-label="Transaction breadcrumb">
            <Link to="/transactions"><ArrowLeft size={16} />Transactions</Link>
            <span>/</span>
            <strong>{isEditing ? "Update Transaction" : "Create Transaction"}</strong>
          </nav>
          <div>
            <h1>{isEditing ? "Update Transaction" : "Create New Transaction"}</h1>
            <p>Arrange transaction particulars, entity linkage, amount, and status in one controlled workspace.</p>
          </div>
        </div>
        <div className="transaction-header-actions">
          <Button asChild variant="secondary"><Link to={isEditing ? `/transactions/${id}` : "/transactions"}><X size={16} />Cancel</Link></Button>
          <Button type="submit" form="transaction-editor-form" variant="secondary" disabled={saveMutation.isPending}><Save size={16} />Save Draft</Button>
          <Button type="submit" form="transaction-editor-form" disabled={saveMutation.isPending}><FileCheck2 size={16} />{isEditing ? "Update Transaction" : "Finalize Transaction"}</Button>
        </div>
      </header>

      <form id="transaction-editor-form" className="transaction-editor-form" onSubmit={submitForm}>
        <div className="transaction-editor-grid">
          <main className="transaction-editor-main">
            <section className="transaction-form-section">
              <h3><FileText size={16} />Transaction Particulars</h3>
              <div className="form-grid">
                <Input label="Code" value={code} onChange={(event) => setCode(event.target.value)} disabled={isEditing} />
                <Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} disabled={isEditing} />
                <Select label="Type" options={transactionTypeOptions} value={transactionType} onChange={(event) => setTransactionType(event.target.value as TransactionType)} disabled={isEditing} />
                <Select label="Status" options={statusOptions} value={status} onChange={(event) => setStatus(event.target.value as TransactionStatus)} />
              </div>
            </section>

            <section className="transaction-form-section">
              <h3><LinkIcon size={16} />Contract Linkage</h3>
              <div className="form-grid">
                <EntitySearchPicker
                  label="Contract"
                  query={contractSearch}
                  onQueryChange={(value) => {
                    setContractSearch(value);
                    setContractId("");
                  }}
                  placeholder="Search and choose contract"
                  loading={contractsQuery.isFetching}
                  items={(contractsQuery.data?.content ?? []).map((contract) => ({
                    id: contract.id,
                    title: contract.title,
                    meta: [contract.code, contract.status].filter(Boolean).join(" / ")
                  }))}
                  onSelect={(item) => {
                    setContractId(String(item.id));
                    setContractSearch(item.title);
                  }}
                />
                <EntitySearchPicker
                  label="Customer"
                  query={customerSearch}
                  onQueryChange={(value) => {
                    setCustomerSearch(value);
                    setCustomerId("");
                  }}
                  placeholder="Search and choose customer"
                  loading={customersQuery.isFetching}
                  items={(customersQuery.data?.content ?? []).map((customer) => ({
                    id: customer.id,
                    title: customer.fullName,
                    meta: [customer.code, customer.phone || customer.email].filter(Boolean).join(" / ")
                  }))}
                  onSelect={(item) => {
                    setCustomerId(String(item.id));
                    setCustomerSearch(item.title);
                  }}
                />
                <EntitySearchPicker
                  label="Property"
                  query={propertySearch}
                  onQueryChange={(value) => {
                    setPropertySearch(value);
                    setPropertyId("");
                  }}
                  placeholder="Search and choose property"
                  loading={propertiesQuery.isFetching}
                  items={(propertiesQuery.data?.content ?? []).map((property) => ({
                    id: property.id,
                    title: property.name,
                    meta: [property.code, property.address.fullAddress].filter(Boolean).join(" / ")
                  }))}
                  onSelect={(item) => {
                    setPropertyId(String(item.id));
                    setPropertySearch(item.title);
                  }}
                />
                <EntitySearchPicker
                  label="Agent"
                  query={agentSearch}
                  onQueryChange={(value) => {
                    setAgentSearch(value);
                    setAgentId("");
                  }}
                  placeholder="Search and choose agent"
                  loading={agentsQuery.isFetching}
                  items={(agentsQuery.data?.content ?? []).map((agent) => ({
                    id: agent.id,
                    title: agent.fullName,
                    meta: [agent.email, agent.phone].filter(Boolean).join(" / ")
                  }))}
                  onSelect={(item) => {
                    setAgentId(String(item.id));
                    setAgentSearch(item.title);
                  }}
                />
              </div>
            </section>

            <section className="transaction-form-section">
              <h3><CircleDollarSign size={16} />Financials & Timeline</h3>
              <div className="form-grid">
                <Input label="Total amount" value={totalAmount} onChange={(event) => setTotalAmount(event.target.value)} disabled={isEditing} />
                <Input label="Currency" value={currency} onChange={(event) => setCurrency(event.target.value.toUpperCase())} disabled={isEditing} />
                <Input label="Transaction date" type="date" value={transactionDate} onChange={(event) => setTransactionDate(event.target.value)} disabled={isEditing} />
                <Input label="Expected completion" type="date" value={expectedCompletionDate} onChange={(event) => setExpectedCompletionDate(event.target.value)} disabled={isEditing} />
              </div>
            </section>

            <section className="transaction-form-section">
              <h3><FileText size={16} />Internal Notes</h3>
              <label className="field">
                <span>Notes</span>
                <textarea className="input textarea transaction-notes-editor" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add internal payment handling notes." />
              </label>
            </section>
            {saveMutation.error ? <p className="form-alert">{normalizeUnknownError(saveMutation.error).message}</p> : null}
          </main>

          <aside className="transaction-editor-side">
            <section className="transaction-summary-card">
              <p className="transaction-section-title">Linked Entity Summary</p>
              <div className="transaction-linked-list">
                <article><span>Contract</span><strong>{selectedContract?.code || (contractId ? `Contract #${contractId}` : "Not linked")}</strong></article>
                <article><span>Customer</span><strong>{selectedCustomer?.fullName || (customerId ? `Customer #${customerId}` : "Not linked")}</strong></article>
                <article><span>Property</span><strong>{selectedProperty?.name || (propertyId ? `Property #${propertyId}` : "Not linked")}</strong></article>
                <article><span>Agent</span><strong>{selectedAgent?.fullName || (agentId ? `Agent #${agentId}` : "Not linked")}</strong></article>
                <article><span>Amount</span><strong>{previewAmount}</strong></article>
              </div>
            </section>
            <section className="transaction-summary-card">
              <div className="transaction-card-heading"><p className="transaction-section-title">Completion</p><strong>{completionPercent}% READY</strong></div>
              <div className="transaction-progress"><span style={{ width: `${completionPercent}%` }} /></div>
              <div className="transaction-completion-list">
                {completionItems.map((item) => (
                  <span key={item.label} className={item.done ? "is-complete" : undefined}><Check size={14} />{item.label}</span>
                ))}
              </div>
            </section>
          </aside>
        </div>
        <footer className="transaction-form-actionbar">
          <span>{isEditing ? "Status update uses the transaction status API." : "Draft details are kept until final submission."}</span>
          <div>
            <Button asChild variant="secondary"><Link to={isEditing ? `/transactions/${id}` : "/transactions"}>Cancel</Link></Button>
            <Button type="submit" disabled={saveMutation.isPending}>{isEditing ? "Update Transaction" : "Finalize Transaction"}</Button>
          </div>
        </footer>
      </form>
    </section>
  );
}
