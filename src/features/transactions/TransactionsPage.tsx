import { useMemo, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { MoreVertical, Plus, Search } from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Input } from "../../shared/ui/Input";
import { Pagination } from "../../shared/ui/Pagination";
import { Select } from "../../shared/ui/Select";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { Table } from "../../shared/ui/Table";
import { formatCurrency } from "../../shared/lib/format";
import { useText } from "../../shared/i18n/useText";
import { searchTransactions } from "./transactionApi";

const pageSize = 10;

const statusOptions = [
  { label: "Any status", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Deposited", value: "DEPOSITED" },
  { label: "Contract signed", value: "CONTRACT_SIGNED" },
  { label: "Payment in progress", value: "PAYMENT_IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Refunded", value: "REFUNDED" }
];

const typeOptions = [
  { label: "Any type", value: "" },
  { label: "Sale", value: "SALE" },
  { label: "Lease", value: "LEASE" }
];

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

function displayEnumLabel(value: string) {
  return value.split("_").join(" ");
}

export function TransactionsPage() {
  const tx = useText();
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [agentId, setAgentId] = useState("");
  const [committedFilters, setCommittedFilters] = useState({
    agentId: "",
    customerId: "",
    keyword: "",
    propertyId: "",
    status: "",
    transactionType: ""
  });
  const apiParams = useMemo(
    () => ({ ...committedFilters, page, size: pageSize }),
    [committedFilters, page]
  );
  const transactionsQuery = useQuery({
    queryFn: () => searchTransactions(apiParams),
    queryKey: ["transactions", apiParams],
    retry: 1
  });
  const normalizedError = transactionsQuery.error ? normalizeUnknownError(transactionsQuery.error) : null;
  const transactions = transactionsQuery.data?.content ?? [];
  const totalVolume = transactions.reduce((sum, transaction) => sum + (transaction.totalAmount ?? 0), 0);
  const pendingPayments = transactions.filter((transaction) =>
    ["PENDING", "DEPOSITED", "PAYMENT_IN_PROGRESS"].includes(transaction.status)
  ).length;

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCommittedFilters({ agentId, customerId, keyword, propertyId, status, transactionType });
    setPage(0);
  }

  function resetSearch() {
    setKeyword("");
    setStatus("");
    setTransactionType("");
    setCustomerId("");
    setPropertyId("");
    setAgentId("");
    setCommittedFilters({ agentId: "", customerId: "", keyword: "", propertyId: "", status: "", transactionType: "" });
    setPage(0);
  }

  return (
    <section className="transaction-list-page">
      <header className="transaction-list-header">
        <div>
          <h1>Transactions</h1>
          <p>Review payment status, linked contracts, volume, and closing progress.</p>
        </div>
        <Button asChild className="transaction-create-button">
          <Link to="/transactions/create">
            <Plus size={17} />
            Create Transaction
          </Link>
        </Button>
      </header>

      <section className="transaction-kpi-grid">
        <article><span>Total Volume (YTD)</span><strong>{formatCurrency(totalVolume, "USD")}</strong></article>
        <article><span>Pending Payments</span><strong>{pendingPayments}</strong></article>
        <article><span>Avg Days to Close</span><strong>--</strong></article>
      </section>

      <form className="transaction-filter-card" onSubmit={submitSearch}>
        <Input label={tx("Keyword")} value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder={tx("Code, title, contract")} />
        <Select label={tx("Status")} options={statusOptions.map((option) => ({ ...option, label: tx(option.label) }))} value={status} onChange={(event) => setStatus(event.target.value)} />
        <Select label={tx("Type")} options={typeOptions} value={transactionType} onChange={(event) => setTransactionType(event.target.value)} />
        <Input label={tx("Customer ID")} placeholder={tx("Customer ID")} value={customerId} onChange={(event) => setCustomerId(event.target.value)} />
        <Input label={tx("Property ID")} placeholder={tx("Property ID")} value={propertyId} onChange={(event) => setPropertyId(event.target.value)} />
        <Input label={tx("Agent ID")} placeholder={tx("Agent ID")} value={agentId} onChange={(event) => setAgentId(event.target.value)} />
        <div className="filter-actions">
          <Button type="submit" disabled={transactionsQuery.isFetching}>
            <Search size={16} />
            {tx("Search")}
          </Button>
          <Button type="button" variant="secondary" onClick={resetSearch}>
            Clear Filters
          </Button>
        </div>
      </form>

      {normalizedError ? (
        <div className="transaction-table-shell">
          <EmptyState title={tx("Transactions could not be loaded")} description={normalizedError.message} action={<Button onClick={() => transactionsQuery.refetch()}>{tx("Retry")}</Button>} />
        </div>
      ) : null}
      {transactionsQuery.data?.content.length === 0 ? (
        <div className="transaction-table-shell">
          <EmptyState title={tx("No transactions found")} description={tx("Create a transaction or adjust filters.")} />
        </div>
      ) : null}
      {transactionsQuery.data && transactionsQuery.data.content.length > 0 ? (
        <div className="transaction-table-shell">
          <Table>
            <thead>
              <tr>
                <th>ID/Code</th>
                <th>{tx("Status")}</th>
                <th>{tx("Amount")}</th>
                <th>Contract</th>
                <th>Customer</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>
                    <Link className="transaction-code-link" to={`/transactions/${transaction.id}`}>{transaction.code}</Link>
                    <small>{transaction.title}</small>
                  </td>
                  <td><StatusBadge tone={statusTone(transaction.status)}>{displayEnumLabel(transaction.status)}</StatusBadge></td>
                  <td><strong className="transaction-amount-cell">{transaction.totalAmount != null ? formatCurrency(transaction.totalAmount, transaction.currency) : tx("Amount updating")}</strong></td>
                  <td>{transaction.contractCode || (transaction.contractId ? `Contract #${transaction.contractId}` : tx("Not linked"))}</td>
                  <td>{transaction.customerName || (transaction.customerId ? `Customer #${transaction.customerId}` : tx("Not linked"))}</td>
                  <td>
                    <Button asChild variant="ghost" size="icon" title={tx("Open transaction")}>
                      <Link to={`/transactions/${transaction.id}`} aria-label={tx("Open transaction")}>
                        <MoreVertical size={17} />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination page={transactionsQuery.data.page} totalPages={transactionsQuery.data.totalPages} onPageChange={setPage} />
        </div>
      ) : null}
    </section>
  );
}
