import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileCheck2, Save, X } from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { EmptyState } from "../../shared/ui/EmptyState";
import { ContractForm, toContractRequest, type ContractFormValues } from "./ContractForm";
import { createContract, getContract, updateContract } from "./contractApi";

export function ContractFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const contractQuery = useQuery({
    enabled: isEditing,
    queryFn: () => getContract(id ?? ""),
    queryKey: ["contract", id],
    retry: 1
  });
  const saveMutation = useMutation({
    mutationFn: (values: ContractFormValues) =>
      isEditing
        ? updateContract(id ?? "", toContractRequest(values))
        : createContract(toContractRequest(values)),
    onSuccess: (contract) => {
      queryClient.setQueryData(["contract", contract.id], contract);
      void queryClient.invalidateQueries({ queryKey: ["contracts"] });
      navigate(`/contracts/${contract.id}`);
    }
  });
  const normalizedError = contractQuery.error ? normalizeUnknownError(contractQuery.error) : null;

  if (isEditing && contractQuery.isLoading) {
    return (
      <section className="contract-editor-page">
        <div className="detail-skeleton">
          <div />
          <div />
        </div>
      </section>
    );
  }

  if (normalizedError) {
    return (
      <section className="contract-editor-page">
        <EmptyState
          title="Contract could not be loaded"
          description={normalizedError.message}
          action={<Button onClick={() => contractQuery.refetch()}>Retry</Button>}
        />
      </section>
    );
  }

  return (
    <section className="contract-editor-page">
      <header className="contract-page-header">
        <div className="contract-page-title">
          <nav className="contract-breadcrumb" aria-label="Contract breadcrumb">
            <Link to="/contracts">
              <ArrowLeft size={16} />
              Contracts
            </Link>
            <span>/</span>
            <strong>{isEditing ? "Edit Contract" : "New Contract"}</strong>
          </nav>
          <div>
            <h1>{isEditing ? "Edit Contract" : "New Contract Creation"}</h1>
            <p>Prepare contract particulars, linked entities, financial terms, and approval readiness.</p>
          </div>
        </div>
        <div className="contract-header-actions">
          <Button asChild variant="secondary">
            <Link to={isEditing ? `/contracts/${id}` : "/contracts"}>
              <X size={16} />
              Cancel
            </Link>
          </Button>
          <Button
            type="submit"
            form="contract-editor-form"
            name="intent"
            value="draft"
            variant="secondary"
            disabled={saveMutation.isPending}
          >
            <Save size={16} />
            Save Draft
          </Button>
          <Button
            type="submit"
            form="contract-editor-form"
            name="intent"
            value="final"
            disabled={saveMutation.isPending}
          >
            <FileCheck2 size={16} />
            {isEditing ? "Update Contract" : "Create Contract"}
          </Button>
        </div>
      </header>
      <ContractForm
        contract={contractQuery.data}
        submitLabel={isEditing ? "Finalize & Update Contract" : "Finalize & Generate Contract"}
        onSubmit={(values) => saveMutation.mutateAsync(values).then(() => undefined)}
      />
    </section>
  );
}
