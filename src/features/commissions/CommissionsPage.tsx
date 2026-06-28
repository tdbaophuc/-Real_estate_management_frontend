import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Save, Search } from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { useAuth } from "../../shared/auth/useAuth";
import { formatCurrency, formatDate } from "../../shared/lib/format";
import { Button } from "../../shared/ui/Button";
import { ConfirmDialog } from "../../shared/ui/ConfirmDialog";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Input } from "../../shared/ui/Input";
import { Pagination } from "../../shared/ui/Pagination";
import { Select } from "../../shared/ui/Select";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { Table } from "../../shared/ui/Table";
import {
  getMyCommissions,
  markCommissionPaid,
  createCommissionRule,
  searchCommissionRules,
  searchCommissions,
  updateCommissionRule,
  type CommissionRecord,
  type CommissionRuleRecord,
  type CommissionSearchParams
} from "./commissionApi";

const pageSize = 10;

const statusOptions = [
  { label: "Any status", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Paid", value: "PAID" },
  { label: "Cancelled", value: "CANCELLED" }
];

type CommissionFilters = {
  agentId: string;
  status: string;
  transactionId: string;
};

type RuleDraft = {
  active: boolean;
  calculationType: string;
  currency: string;
  description: string;
  effectiveFrom: string;
  effectiveTo: string;
  name: string;
  rate: string;
};

const emptyRuleDraft: RuleDraft = {
  active: true,
  calculationType: "PERCENTAGE",
  currency: "VND",
  description: "",
  effectiveFrom: "",
  effectiveTo: "",
  name: "",
  rate: ""
};

const calculationTypeOptions = [
  { label: "Percentage", value: "PERCENTAGE" },
  { label: "Fixed", value: "FIXED" }
];

function statusTone(status: string) {
  if (status === "PAID") {
    return "success";
  }

  if (status === "APPROVED" || status === "PENDING") {
    return "warning";
  }

  if (status === "CANCELLED") {
    return "danger";
  }

  return "neutral";
}

function formatMaybeDate(value: string) {
  if (!value) {
    return "Not paid";
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : formatDate(parsed);
}

function toApiParams(filters: CommissionFilters, page: number): CommissionSearchParams {
  return {
    agentId: filters.agentId,
    page,
    size: pageSize,
    status: filters.status,
    transactionId: filters.transactionId
  };
}

export function CommissionsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const canManageCommissions = Boolean(user?.roles.some((role) => role === "ADMIN" || role === "MANAGER"));
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<CommissionFilters>({ agentId: "", status: "", transactionId: "" });
  const [committedFilters, setCommittedFilters] = useState<CommissionFilters>({
    agentId: "",
    status: "",
    transactionId: ""
  });
  const [pendingPaidCommission, setPendingPaidCommission] = useState<CommissionRecord | null>(null);
  const [editingRule, setEditingRule] = useState<CommissionRuleRecord | null>(null);
  const [ruleDraft, setRuleDraft] = useState<RuleDraft>(emptyRuleDraft);
  const apiParams = useMemo(() => toApiParams(committedFilters, page), [committedFilters, page]);
  const commissionsQuery = useQuery({
    queryFn: () =>
      canManageCommissions
        ? searchCommissions(apiParams)
        : getMyCommissions({ page, size: pageSize, status: committedFilters.status }),
    queryKey: ["commissions", canManageCommissions ? "all" : "my", apiParams],
    retry: 1
  });
  const markPaidMutation = useMutation({
    mutationFn: (commission: CommissionRecord) => markCommissionPaid(commission.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["commissions"] });
      setPendingPaidCommission(null);
    }
  });
  const rulesQuery = useQuery({
    enabled: canManageCommissions,
    queryFn: () => searchCommissionRules({ page: 0, size: 100 }),
    queryKey: ["commission-rules"],
    retry: 1
  });
  const saveRuleMutation = useMutation({
    mutationFn: () => {
      const request = {
        active: ruleDraft.active,
        calculationType: ruleDraft.calculationType,
        currency: ruleDraft.currency || undefined,
        description: ruleDraft.description || undefined,
        effectiveFrom: ruleDraft.effectiveFrom || undefined,
        effectiveTo: ruleDraft.effectiveTo || undefined,
        name: ruleDraft.name.trim(),
        rate: ruleDraft.rate ? Number(ruleDraft.rate) : undefined
      };

      return editingRule
        ? updateCommissionRule(editingRule.id, request)
        : createCommissionRule(request);
    },
    onSuccess: () => {
      setEditingRule(null);
      setRuleDraft(emptyRuleDraft);
      return queryClient.invalidateQueries({ queryKey: ["commission-rules"] });
    }
  });
  const normalizedError = commissionsQuery.error ? normalizeUnknownError(commissionsQuery.error) : null;
  const rulesError = rulesQuery.error ?? saveRuleMutation.error;
  const normalizedRulesError = rulesError ? normalizeUnknownError(rulesError) : null;

  function updateFilter(field: keyof CommissionFilters, value: string) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCommittedFilters(filters);
    setPage(0);
  }

  function resetSearch() {
    const nextFilters = { agentId: "", status: "", transactionId: "" };
    setFilters(nextFilters);
    setCommittedFilters(nextFilters);
    setPage(0);
  }

  function confirmMarkPaid() {
    if (pendingPaidCommission) {
      markPaidMutation.mutate(pendingPaidCommission);
    }
  }

  function startEditRule(rule: CommissionRuleRecord) {
    setEditingRule(rule);
    setRuleDraft({
      active: rule.active,
      calculationType: rule.calculationType,
      currency: rule.currency,
      description: rule.description,
      effectiveFrom: rule.effectiveFrom,
      effectiveTo: rule.effectiveTo,
      name: rule.name,
      rate: rule.rate === null ? "" : String(rule.rate)
    });
  }

  function updateRuleDraft(field: keyof RuleDraft, value: string | boolean) {
    setRuleDraft((current) => ({
      ...current,
      [field]: value
    }));
  }

  return (
    <section>
      <div className="section-header">
        <div>
          <p className="eyebrow">Commissions</p>
          <h2>{canManageCommissions ? "Commission management" : "My commissions"}</h2>
        </div>
      </div>
      <form className="filter-bar commission-filter-bar" onSubmit={submitSearch}>
        {canManageCommissions ? (
          <>
            <Input
              label="Agent id"
              placeholder="Filter by agent"
              value={filters.agentId}
              onChange={(event) => updateFilter("agentId", event.target.value)}
            />
            <Input
              label="Transaction id"
              placeholder="Filter by transaction"
              value={filters.transactionId}
              onChange={(event) => updateFilter("transactionId", event.target.value)}
            />
          </>
        ) : null}
        <Select
          label="Status"
          options={statusOptions}
          value={filters.status}
          onChange={(event) => updateFilter("status", event.target.value)}
        />
        <div className="filter-actions">
          <Button type="submit" disabled={commissionsQuery.isFetching}>
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
          <EmptyState
            title="Commissions could not be loaded"
            description={normalizedError.message}
            action={<Button onClick={() => commissionsQuery.refetch()}>Retry</Button>}
          />
        </div>
      ) : null}
      {commissionsQuery.isLoading ? (
        <div className="detail-skeleton">
          <div />
          <div />
        </div>
      ) : null}
      {commissionsQuery.data?.content.length === 0 ? (
        <div className="content-section">
          <EmptyState
            title="No commissions found"
            description="Adjust filters or check again after transactions are completed."
            action={<Button onClick={resetSearch}>Clear filters</Button>}
          />
        </div>
      ) : null}
      {commissionsQuery.data && commissionsQuery.data.content.length > 0 ? (
        <>
          <Table>
            <thead>
              <tr>
                <th>Agent</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Transaction</th>
                <th>Paid at</th>
                {canManageCommissions ? <th /> : null}
              </tr>
            </thead>
            <tbody>
              {commissionsQuery.data.content.map((commission) => (
                <tr key={commission.id}>
                  <td>
                    <strong>{commission.agentName}</strong>
                    <small>{commission.agentEmail || commission.agentId || "Agent updating"}</small>
                  </td>
                  <td>
                    <StatusBadge tone={statusTone(commission.status)}>{commission.status.replace(/_/g, " ")}</StatusBadge>
                  </td>
                  <td>
                    <strong>
                      {commission.amount === null
                        ? "Amount updating"
                        : formatCurrency(commission.amount, commission.currency)}
                    </strong>
                    <small>
                      {commission.calculationType}
                      {commission.commissionRate !== null ? ` ${commission.commissionRate}%` : ""}
                    </small>
                  </td>
                  <td>
                    <strong>{commission.transactionCode || "Transaction updating"}</strong>
                    <small>{commission.transactionId ?? "Not linked"}</small>
                  </td>
                  <td>{formatMaybeDate(commission.paidAt)}</td>
                  {canManageCommissions ? (
                    <td>
                      <Button
                        disabled={commission.status === "PAID"}
                        onClick={() => setPendingPaidCommission(commission)}
                        size="sm"
                        variant="secondary"
                      >
                        <CheckCircle2 size={16} />
                        Mark paid
                      </Button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination
            page={commissionsQuery.data.page}
            totalPages={commissionsQuery.data.totalPages}
            onPageChange={setPage}
          />
        </>
      ) : null}
      {markPaidMutation.error ? <p className="form-alert">{normalizeUnknownError(markPaidMutation.error).message}</p> : null}
      <ConfirmDialog
        open={Boolean(pendingPaidCommission)}
        title="Mark commission paid"
        description={`Mark commission ${pendingPaidCommission?.id ?? ""} as paid? This updates payout status for the selected record.`}
        onCancel={() => setPendingPaidCommission(null)}
        onConfirm={confirmMarkPaid}
      />
      {canManageCommissions ? (
        <section className="content-section commission-rules-section">
          <div className="section-header">
            <div>
              <p className="eyebrow">Rules</p>
              <h2>Commission rules</h2>
            </div>
          </div>
          <form
            className="commission-rule-form"
            onSubmit={(event) => {
              event.preventDefault();
              saveRuleMutation.mutate();
            }}
          >
            <Input label="Name" value={ruleDraft.name} onChange={(event) => updateRuleDraft("name", event.target.value)} required />
            <Select label="Calculation" options={calculationTypeOptions} value={ruleDraft.calculationType} onChange={(event) => updateRuleDraft("calculationType", event.target.value)} />
            <Input label="Rate" type="number" min={0} step="0.01" value={ruleDraft.rate} onChange={(event) => updateRuleDraft("rate", event.target.value)} />
            <Input label="Currency" value={ruleDraft.currency} onChange={(event) => updateRuleDraft("currency", event.target.value.toUpperCase())} />
            <Input label="Effective from" type="date" value={ruleDraft.effectiveFrom} onChange={(event) => updateRuleDraft("effectiveFrom", event.target.value)} />
            <Input label="Effective to" type="date" value={ruleDraft.effectiveTo} onChange={(event) => updateRuleDraft("effectiveTo", event.target.value)} />
            <Input label="Description" value={ruleDraft.description} onChange={(event) => updateRuleDraft("description", event.target.value)} />
            <label className="toggle-field">
              <input type="checkbox" checked={ruleDraft.active} onChange={(event) => updateRuleDraft("active", event.target.checked)} />
              <span>Active</span>
            </label>
            <div className="filter-actions">
              <Button type="submit" disabled={!ruleDraft.name.trim() || saveRuleMutation.isPending}>
                <Save size={16} />
                {editingRule ? "Update rule" : "Create rule"}
              </Button>
              {editingRule ? (
                <Button type="button" variant="secondary" onClick={() => { setEditingRule(null); setRuleDraft(emptyRuleDraft); }}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
          {normalizedRulesError ? <p className="form-alert">{normalizedRulesError.message}</p> : null}
          <div className="customer-list-stack">
            {rulesQuery.data?.content.length ? rulesQuery.data.content.map((rule) => (
              <article key={rule.id}>
                <strong>{rule.name}</strong>
                <small>{rule.calculationType} / {rule.rate ?? "rate updating"} / {rule.currency}</small>
                <small>{rule.active ? "Active" : "Inactive"}{rule.effectiveFrom ? ` / from ${rule.effectiveFrom}` : ""}{rule.effectiveTo ? ` / to ${rule.effectiveTo}` : ""}</small>
                {rule.description ? <small>{rule.description}</small> : null}
                <Button size="sm" variant="secondary" onClick={() => startEditRule(rule)}>
                  Edit rule
                </Button>
              </article>
            )) : <p className="muted">No commission rules returned.</p>}
          </div>
        </section>
      ) : null}
    </section>
  );
}
