import { useMemo, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { MoreVertical, Plus, Search, SlidersHorizontal } from "lucide-react";
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
import { searchContracts } from "./contractApi";

const pageSize = 10;

const statusOptions = [
  { label: "Any status", value: "" },
  { label: "Draft", value: "DRAFT" },
  { label: "Pending review", value: "PENDING_REVIEW" },
  { label: "Pending signature", value: "PENDING_SIGNATURE" },
  { label: "Signed", value: "SIGNED" },
  { label: "Active", value: "ACTIVE" },
  { label: "Cancelled", value: "CANCELLED" }
];

const typeOptions = [
  { label: "Any type", value: "" },
  { label: "Sale", value: "SALE" },
  { label: "Lease", value: "LEASE" }
];

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

function displayEnumLabel(value: string) {
  return value.split("_").join(" ");
}

export function ContractsPage() {
  const tx = useText();
  const [page, setPage] = useState(0);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [agentId, setAgentId] = useState("");
  const [committedFilters, setCommittedFilters] = useState({
    agentId: "",
    customerId: "",
    keyword: "",
    propertyId: "",
    status: "",
    type: ""
  });
  const apiParams = useMemo(
    () => ({ ...committedFilters, page, size: pageSize }),
    [committedFilters, page]
  );
  const contractsQuery = useQuery({
    queryFn: () => searchContracts(apiParams),
    queryKey: ["contracts", apiParams],
    retry: 1
  });
  const normalizedError = contractsQuery.error ? normalizeUnknownError(contractsQuery.error) : null;
  const contracts = contractsQuery.data?.content ?? [];
  const signedCount = contracts.filter((contract) => contract.status === "SIGNED" || contract.status === "ACTIVE").length;
  const pipelineValue = contracts.reduce((total, contract) => total + (contract.totalValue ?? 0), 0);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCommittedFilters({ agentId, customerId, keyword, propertyId, status, type });
    setPage(0);
  }

  function resetSearch() {
    setStatus("");
    setType("");
    setKeyword("");
    setPropertyId("");
    setCustomerId("");
    setAgentId("");
    setCommittedFilters({ agentId: "", customerId: "", keyword: "", propertyId: "", status: "", type: "" });
    setPage(0);
  }

  return (
    <section className="contract-list-page">
      <header className="contract-list-header">
        <div>
          <h1>Contracts</h1>
          <p>Track legal status, counterparties, values, and pending execution work.</p>
        </div>
        <Button asChild className="contract-create-button">
          <Link to="/contracts/new">
            <Plus size={17} />
            CREATE NEW CONTRACT
          </Link>
        </Button>
      </header>

      <form className="contract-filter-card" onSubmit={submitSearch}>
        <Select label={tx("Status")} options={statusOptions.map((option) => ({ ...option, label: tx(option.label) }))} value={status} onChange={(event) => setStatus(event.target.value)} />
        <Select label={tx("Type")} options={typeOptions.map((option) => ({ ...option, label: tx(option.label) }))} value={type} onChange={(event) => setType(event.target.value)} />
        <Input label={tx("Property")} value={propertyId} onChange={(event) => setPropertyId(event.target.value)} placeholder={tx("Property ID")} />
        <Input label={tx("Customer")} value={customerId} onChange={(event) => setCustomerId(event.target.value)} placeholder={tx("Customer ID")} />
        <Input label={tx("Agent")} value={agentId} onChange={(event) => setAgentId(event.target.value)} placeholder={tx("Agent ID")} />
        <div className="filter-actions">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className={advancedOpen ? "contract-advanced-toggle-active" : undefined}
            title={tx("Advanced filters")}
            aria-expanded={advancedOpen}
            onClick={() => setAdvancedOpen((open) => !open)}
          >
            <SlidersHorizontal size={16} />
          </Button>
          <Button type="submit" disabled={contractsQuery.isFetching}>
            <Search size={16} />
            {tx("Search")}
          </Button>
          <Button type="button" variant="secondary" onClick={resetSearch}>
            {tx("Reset")}
          </Button>
        </div>
        {advancedOpen ? (
          <div className="contract-advanced-filters">
            <Input
              label={tx("Keyword")}
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder={tx("Code, title, party")}
            />
          </div>
        ) : null}
      </form>
      {normalizedError ? (
        <div className="contract-table-shell">
          <EmptyState title={tx("Contracts could not be loaded")} description={normalizedError.message} action={<Button onClick={() => contractsQuery.refetch()}>{tx("Retry")}</Button>} />
        </div>
      ) : null}
      {contractsQuery.data?.content.length === 0 ? (
        <div className="contract-table-shell">
          <EmptyState title={tx("No contracts found")} description={tx("Create a contract or adjust filters.")} />
        </div>
      ) : null}
      {contractsQuery.data && contractsQuery.data.content.length > 0 ? (
        <>
          <div className="contract-table-shell">
          <Table>
            <thead>
              <tr>
                <th>Code</th>
                <th>{tx("Status")}</th>
                <th>{tx("Type")}</th>
                <th>{tx("Value")}</th>
                <th>Customer</th>
                <th>Property</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {contractsQuery.data.content.map((contract) => (
                <tr key={contract.id}>
                  <td>
                    <Link className="contract-code-link" to={`/contracts/${contract.id}`}>{contract.code}</Link>
                    <small>{contract.title}</small>
                  </td>
                  <td><StatusBadge tone={statusTone(contract.status)}>{displayEnumLabel(contract.status)}</StatusBadge></td>
                  <td>{displayEnumLabel(contract.contractType)}</td>
                  <td>
                    <strong className="contract-value-cell">
                      {contract.totalValue != null ? formatCurrency(contract.totalValue, contract.currency || "USD") : tx("Value updating")}
                    </strong>
                  </td>
                  <td>{contract.parties[0]?.fullName || (contract.customerId ? `Customer #${contract.customerId}` : tx("Not linked"))}</td>
                  <td>{contract.propertyAddress || (contract.propertyId ? `Property #${contract.propertyId}` : tx("Not linked"))}</td>
                  <td>
                    <Button asChild variant="ghost" size="icon" title={tx("Open contract actions")}>
                      <Link to={`/contracts/${contract.id}`} aria-label={tx("Open contract actions")}>
                        <MoreVertical size={17} />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
            <Pagination page={contractsQuery.data.page} totalPages={contractsQuery.data.totalPages} onPageChange={setPage} />
          </div>
          <section className="contract-kpi-grid">
            <article><span>Total Pipeline Value</span><strong>{formatCurrency(pipelineValue, "USD")}</strong></article>
            <article><span>Total Matching Contracts</span><strong>{contractsQuery.data.totalElements}</strong></article>
            <article><span>Signed / Active</span><strong>{signedCount}</strong></article>
            <article><span>Contracts In View</span><strong>{contracts.length}</strong></article>
          </section>
        </>
      ) : null}
    </section>
  );
}
