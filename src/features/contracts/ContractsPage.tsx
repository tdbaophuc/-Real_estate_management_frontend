import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FilePlus2, Search } from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Input } from "../../shared/ui/Input";
import { Pagination } from "../../shared/ui/Pagination";
import { Select } from "../../shared/ui/Select";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { Table } from "../../shared/ui/Table";
import { formatCurrency } from "../../shared/lib/format";
import { ContractForm, toContractRequest, type ContractFormValues } from "./ContractForm";
import { createContract, searchContracts } from "./contractApi";

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

export function ContractsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [committedFilters, setCommittedFilters] = useState({ keyword: "", status: "", type: "" });
  const apiParams = useMemo(
    () => ({ ...committedFilters, page, size: pageSize }),
    [committedFilters, page]
  );
  const contractsQuery = useQuery({
    queryFn: () => searchContracts(apiParams),
    queryKey: ["contracts", apiParams],
    retry: 1
  });
  const createMutation = useMutation({
    mutationFn: (values: ContractFormValues) => createContract(toContractRequest(values)),
    onSuccess: (contract) => {
      queryClient.setQueryData(["contract", contract.id], contract);
      void queryClient.invalidateQueries({ queryKey: ["contracts"] });
    }
  });
  const normalizedError = contractsQuery.error ? normalizeUnknownError(contractsQuery.error) : null;

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCommittedFilters({ keyword, status, type });
    setPage(0);
  }

  function resetSearch() {
    setKeyword("");
    setStatus("");
    setType("");
    setCommittedFilters({ keyword: "", status: "", type: "" });
    setPage(0);
  }

  return (
    <section>
      <div className="section-header">
        <div>
          <p className="eyebrow">Contracts</p>
          <h2>Contract management</h2>
        </div>
      </div>
      <section className="content-section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Create</p>
            <h2>New contract</h2>
          </div>
          <FilePlus2 size={20} />
        </div>
        <ContractForm
          submitLabel="Create contract"
          onSubmit={(values) => createMutation.mutateAsync(values).then(() => undefined)}
        />
      </section>
      <form className="filter-bar contract-filter-bar" onSubmit={submitSearch}>
        <Input label="Keyword" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Code, title, party" />
        <Select label="Status" options={statusOptions} value={status} onChange={(event) => setStatus(event.target.value)} />
        <Select label="Type" options={typeOptions} value={type} onChange={(event) => setType(event.target.value)} />
        <div className="filter-actions">
          <Button type="submit" disabled={contractsQuery.isFetching}>
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
          <EmptyState title="Contracts could not be loaded" description={normalizedError.message} action={<Button onClick={() => contractsQuery.refetch()}>Retry</Button>} />
        </div>
      ) : null}
      {contractsQuery.data?.content.length === 0 ? (
        <div className="content-section">
          <EmptyState title="No contracts found" description="Create a contract or adjust filters." />
        </div>
      ) : null}
      {contractsQuery.data && contractsQuery.data.content.length > 0 ? (
        <>
          <Table>
            <thead>
              <tr>
                <th>Contract</th>
                <th>Status</th>
                <th>Type</th>
                <th>Value</th>
                <th>Customer</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {contractsQuery.data.content.map((contract) => (
                <tr key={contract.id}>
                  <td>
                    <strong>{contract.title}</strong>
                    <small>{contract.code}</small>
                  </td>
                  <td><StatusBadge tone={statusTone(contract.status)}>{contract.status}</StatusBadge></td>
                  <td>{contract.contractType}</td>
                  <td>{contract.totalValue ? formatCurrency(contract.totalValue, contract.currency) : "Value updating"}</td>
                  <td>{contract.customerId ?? "Not linked"}</td>
                  <td>
                    <Button asChild variant="secondary" size="sm">
                      <Link to={`/contracts/${contract.id}`}>Open</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination page={contractsQuery.data.page} totalPages={contractsQuery.data.totalPages} onPageChange={setPage} />
        </>
      ) : null}
    </section>
  );
}
