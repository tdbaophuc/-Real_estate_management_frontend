import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Input } from "../../shared/ui/Input";
import { Pagination } from "../../shared/ui/Pagination";
import { Select } from "../../shared/ui/Select";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { Table } from "../../shared/ui/Table";
import { formatCurrency } from "../../shared/lib/format";
import { createTransaction, searchTransactions } from "./transactionApi";

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

export function TransactionsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [committedFilters, setCommittedFilters] = useState({ keyword: "", status: "" });
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [contractId, setContractId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [currency, setCurrency] = useState("VND");
  const apiParams = useMemo(
    () => ({ ...committedFilters, page, size: pageSize }),
    [committedFilters, page]
  );
  const transactionsQuery = useQuery({
    queryFn: () => searchTransactions(apiParams),
    queryKey: ["transactions", apiParams],
    retry: 1
  });
  const createMutation = useMutation({
    mutationFn: () =>
      createTransaction({
        code: code.trim(),
        contractId: toNumber(contractId),
        currency,
        customerId: toNumber(customerId),
        propertyId: toNumber(propertyId),
        title: title.trim(),
        totalAmount: toNumber(totalAmount)
      }),
    onSuccess: (transaction) => {
      queryClient.setQueryData(["transaction", transaction.id], transaction);
      void queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setCode("");
      setTitle("");
      setContractId("");
      setCustomerId("");
      setPropertyId("");
      setTotalAmount("");
      setCurrency("VND");
    }
  });
  const normalizedError = transactionsQuery.error ? normalizeUnknownError(transactionsQuery.error) : null;

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCommittedFilters({ keyword, status });
    setPage(0);
  }

  function resetSearch() {
    setKeyword("");
    setStatus("");
    setCommittedFilters({ keyword: "", status: "" });
    setPage(0);
  }

  function submitCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (code.trim() && title.trim()) {
      createMutation.mutate();
    }
  }

  return (
    <section>
      <div className="section-header">
        <div>
          <p className="eyebrow">Transactions</p>
          <h2>Transaction records</h2>
        </div>
      </div>
      <section className="content-section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Create</p>
            <h2>New transaction</h2>
          </div>
        </div>
        <form className="transaction-create-form" onSubmit={submitCreate}>
          <Input label="Code" value={code} onChange={(event) => setCode(event.target.value)} />
          <Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
          <Input label="Contract id" value={contractId} onChange={(event) => setContractId(event.target.value)} />
          <Input label="Customer id" value={customerId} onChange={(event) => setCustomerId(event.target.value)} />
          <Input label="Property id" value={propertyId} onChange={(event) => setPropertyId(event.target.value)} />
          <Input label="Total amount" value={totalAmount} onChange={(event) => setTotalAmount(event.target.value)} />
          <Input label="Currency" value={currency} onChange={(event) => setCurrency(event.target.value.toUpperCase())} />
          <Button type="submit" disabled={!code.trim() || !title.trim() || createMutation.isPending}>
            <Plus size={16} />
            Create transaction
          </Button>
        </form>
        {createMutation.error ? <p className="form-alert">{normalizeUnknownError(createMutation.error).message}</p> : null}
      </section>
      <form className="filter-bar transaction-filter-bar" onSubmit={submitSearch}>
        <Input label="Keyword" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Code, title, contract" />
        <Select label="Status" options={statusOptions} value={status} onChange={(event) => setStatus(event.target.value)} />
        <div className="filter-actions">
          <Button type="submit" disabled={transactionsQuery.isFetching}>
            <Search size={16} />
            Search
          </Button>
          <Button type="button" variant="secondary" onClick={resetSearch}>
            Reset
          </Button>
        </div>
      </form>
      {normalizedError ? (
        <div className="content-section">
          <EmptyState title="Transactions could not be loaded" description={normalizedError.message} action={<Button onClick={() => transactionsQuery.refetch()}>Retry</Button>} />
        </div>
      ) : null}
      {transactionsQuery.data?.content.length === 0 ? (
        <div className="content-section">
          <EmptyState title="No transactions found" description="Create a transaction or adjust filters." />
        </div>
      ) : null}
      {transactionsQuery.data && transactionsQuery.data.content.length > 0 ? (
        <>
          <Table>
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Contract</th>
                <th>Customer</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {transactionsQuery.data.content.map((transaction) => (
                <tr key={transaction.id}>
                  <td>
                    <strong>{transaction.title}</strong>
                    <small>{transaction.code}</small>
                  </td>
                  <td><StatusBadge tone={statusTone(transaction.status)}>{transaction.status}</StatusBadge></td>
                  <td>{transaction.totalAmount ? formatCurrency(transaction.totalAmount, transaction.currency) : "Amount updating"}</td>
                  <td>{transaction.contractId ?? "Not linked"}</td>
                  <td>{transaction.customerId ?? "Not linked"}</td>
                  <td>
                    <Button asChild variant="secondary" size="sm">
                      <Link to={`/transactions/${transaction.id}`}>Open</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination page={transactionsQuery.data.page} totalPages={transactionsQuery.data.totalPages} onPageChange={setPage} />
        </>
      ) : null}
    </section>
  );
}
