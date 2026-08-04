import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Download, Edit3, FileText, Plus, Save, Search, SlidersHorizontal, UserRound } from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { formatCurrency, formatDate } from "../../shared/lib/format";
import { Button } from "../../shared/ui/Button";
import { Dialog } from "../../shared/ui/Dialog";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Input } from "../../shared/ui/Input";
import { Pagination } from "../../shared/ui/Pagination";
import { Select } from "../../shared/ui/Select";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { Table } from "../../shared/ui/Table";
import {
  createCommissionRule,
  getMyCommissions,
  markCommissionPaid,
  searchCommissionRules,
  searchCommissions,
  updateCommissionRule,
  type CommissionMarkPaidRequest,
  type CommissionRecord,
  type CommissionRuleRecord,
  type CommissionRuleRequest,
  type CommissionSearchParams
} from "./commissionApi";

type CommissionsPageProps = {
  view: "manage" | "my" | "rule-form" | "rules";
};

type CommissionFilters = {
  beneficiaryUserId: string;
  status: string;
  transactionId: string;
};

type RuleDraft = {
  active: boolean;
  calculationType: "FIXED" | "PERCENTAGE";
  code: string;
  currency: string;
  description: string;
  effectiveFrom: string;
  effectiveTo: string;
  fixedAmount: string;
  maxTransactionValue: string;
  minTransactionValue: string;
  name: string;
  priority: string;
  rate: string;
  transactionType: "LEASE" | "SALE";
};

const pageSize = 10;
const statusOptions = [
  { label: "Any status", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Paid", value: "PAID" },
  { label: "Cancelled", value: "CANCELLED" }
];
const tabStatuses = ["", "PENDING", "APPROVED", "PAID"] as const;
const emptyFilters: CommissionFilters = { beneficiaryUserId: "", status: "", transactionId: "" };
const emptyRuleDraft: RuleDraft = {
  active: true,
  calculationType: "PERCENTAGE",
  code: "",
  currency: "VND",
  description: "",
  effectiveFrom: "",
  effectiveTo: "",
  fixedAmount: "",
  maxTransactionValue: "",
  minTransactionValue: "",
  name: "",
  priority: "1",
  rate: "",
  transactionType: "SALE"
};

function statusTone(status: string) {
  if (status === "PAID" || status === "APPROVED") {
    return "success";
  }

  if (status === "PENDING") {
    return "warning";
  }

  if (status === "CANCELLED") {
    return "danger";
  }

  return "neutral";
}

function formatMaybeDate(value: string, fallback = "Not paid") {
  if (!value) {
    return fallback;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : formatDate(parsed);
}

function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "BC";
}

function amountSum(records: CommissionRecord[], predicate: (record: CommissionRecord) => boolean) {
  return records.filter(predicate).reduce((sum, record) => sum + (record.amount ?? 0), 0);
}

function isCurrentYear(value: string) {
  const date = value ? new Date(value) : null;
  return Boolean(date && !Number.isNaN(date.getTime()) && date.getFullYear() === new Date().getFullYear());
}

function isCurrentMonth(value: string) {
  const date = value ? new Date(value) : null;
  const now = new Date();
  return Boolean(date && !Number.isNaN(date.getTime()) && date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth());
}

function averageProcessingDays(records: CommissionRecord[]) {
  const durations = records
    .filter((record) => record.createdAt && record.paidAt)
    .map((record) => {
      const start = new Date(record.createdAt).getTime();
      const end = new Date(record.paidAt).getTime();
      return Number.isNaN(start) || Number.isNaN(end) ? null : Math.max(Math.round((end - start) / 86_400_000), 0);
    })
    .filter((value): value is number => value !== null);

  if (!durations.length) {
    return "--";
  }

  return `${Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length)}d`;
}

function buildParams(filters: CommissionFilters, page: number): CommissionSearchParams {
  return {
    beneficiaryUserId: filters.beneficiaryUserId || undefined,
    direction: "DESC",
    page,
    size: pageSize,
    sortBy: "createdAt",
    status: filters.status || undefined,
    transactionId: filters.transactionId || undefined
  };
}

function metric(label: string, value: string, detail?: string) {
  return (
    <article className="commission-kpi-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <small>{detail}</small> : null}
    </article>
  );
}

function exportCsv(records: CommissionRecord[]) {
  const rows = [
    ["id", "transactionCode", "beneficiaryName", "amount", "currency", "status", "paidAt"],
    ...records.map((record) => [
      record.id,
      record.transactionCode,
      record.beneficiaryName,
      record.amount ?? "",
      record.currency,
      record.status,
      record.paidAt
    ])
  ];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, "\"\"")}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = "commissions.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function CommissionTable({
  canMarkPaid = false,
  records,
  onMarkPaid
}: {
  canMarkPaid?: boolean;
  onMarkPaid?: (record: CommissionRecord) => void;
  records: CommissionRecord[];
}) {
  return (
    <Table>
      <thead>
        <tr>
          <th>TRANSACTION / PROPERTY</th>
          <th>BENEFICIARY</th>
          <th>AMOUNT</th>
          <th>STATUS</th>
          <th>PAID AT</th>
          {canMarkPaid ? <th>ACTIONS</th> : null}
        </tr>
      </thead>
      <tbody>
        {records.map((commission) => (
          <tr key={commission.id}>
            <td>
              <Link className="commission-transaction-link" to={commission.transactionId ? `/transactions/${commission.transactionId}` : "#"}>
                {commission.transactionCode || `Transaction #${commission.transactionId ?? commission.id}`}
              </Link>
              <small>{commission.transactionType || "Transaction type updating"}</small>
            </td>
            <td>
              <div className="commission-beneficiary">
                <span>{initials(commission.beneficiaryName)}</span>
                <div>
                  <strong>{commission.beneficiaryName}</strong>
                  <small>{commission.beneficiaryUserId ? `User #${commission.beneficiaryUserId}` : "User updating"}</small>
                </div>
              </div>
            </td>
            <td>
              <strong>{commission.amount == null ? "Amount updating" : formatCurrency(commission.amount, commission.currency)}</strong>
              <small>{commission.calculationType}{commission.rate != null ? ` / ${commission.rate}%` : ""}</small>
            </td>
            <td><StatusBadge tone={statusTone(commission.status)}>{commission.status.replace(/_/g, " ")}</StatusBadge></td>
            <td>{formatMaybeDate(commission.paidAt)}</td>
            {canMarkPaid ? (
              <td>
                {commission.status === "PENDING" || commission.status === "APPROVED" ? (
                  <Button className="commission-mark-paid-btn" size="sm" variant="ghost" onClick={() => onMarkPaid?.(commission)}>
                    <CheckCircle2 size={15} />
                    Mark Paid
                  </Button>
                ) : null}
              </td>
            ) : null}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function MyCommissionsView() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const params = useMemo(() => buildParams({ ...emptyFilters, status, transactionId }, page), [page, status, transactionId]);
  const commissionsQuery = useQuery({
    queryFn: () => getMyCommissions(params),
    queryKey: ["commissions", "my", params],
    retry: 1
  });
  const records = commissionsQuery.data?.content ?? [];
  const normalizedError = commissionsQuery.error ? normalizeUnknownError(commissionsQuery.error) : null;
  const currency = records[0]?.currency ?? "VND";

  return (
    <section className="commission-page">
      <header className="commission-page-header">
        <div>
          <p className="eyebrow">Commissions</p>
          <h1>My Commissions</h1>
        </div>
      </header>
      <div className="commission-kpi-row">
        {metric("TOTAL EARNED YTD", formatCurrency(amountSum(records, (record) => record.status === "PAID" && isCurrentYear(record.paidAt)), currency), "Paid records returned by API")}
        {metric("PENDING PAYMENT", formatCurrency(amountSum(records, (record) => record.status === "PENDING" || record.status === "APPROVED"), currency), "Pending or approved")}
        {metric("PAID THIS MONTH", formatCurrency(amountSum(records, (record) => record.status === "PAID" && isCurrentMonth(record.paidAt)), currency))}
      </div>
      <section className="commission-panel">
        <div className="commission-list-toolbar">
          <div className="commission-tabs" role="tablist" aria-label="Commission status">
            {tabStatuses.map((tab) => (
              <button className={status === tab ? "is-active" : ""} key={tab || "ALL"} type="button" onClick={() => { setStatus(tab); setPage(0); }}>
                {tab ? tab[0] + tab.slice(1).toLowerCase() : "All"}
              </button>
            ))}
          </div>
          <div className="commission-toolbar-actions">
            <Input
              aria-label="Filter by transaction ID"
              placeholder="Filter by transaction ID"
              value={transactionId}
              onChange={(event) => setTransactionId(event.target.value)}
            />
            <Button variant="secondary" onClick={() => exportCsv(records)} disabled={!records.length}>
              <Download size={15} />
              Export
            </Button>
          </div>
        </div>
        {normalizedError ? <EmptyState title="Commissions could not be loaded" description={normalizedError.message} action={<Button onClick={() => commissionsQuery.refetch()}>Retry</Button>} /> : null}
        {commissionsQuery.isLoading ? <div className="notification-skeleton commission-table-skeleton" /> : null}
        {!commissionsQuery.isLoading && !normalizedError && !records.length ? <EmptyState title="No commissions found" description="No commission records were returned for the selected status." /> : null}
        {records.length ? <CommissionTable records={records} /> : null}
        {commissionsQuery.data ? <Pagination page={commissionsQuery.data.page} totalPages={commissionsQuery.data.totalPages} onPageChange={setPage} /> : null}
      </section>
    </section>
  );
}

function CommissionManagementView() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<CommissionFilters>(emptyFilters);
  const [committedFilters, setCommittedFilters] = useState<CommissionFilters>(emptyFilters);
  const [selectedCommission, setSelectedCommission] = useState<CommissionRecord | null>(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [paidAt, setPaidAt] = useState("");
  const [notes, setNotes] = useState("");
  const params = useMemo(() => buildParams(committedFilters, page), [committedFilters, page]);
  const commissionsQuery = useQuery({
    queryFn: () => searchCommissions(params),
    queryKey: ["commissions", "manage", params],
    retry: 1
  });
  const markPaidMutation = useMutation({
    mutationFn: () => {
      const request: CommissionMarkPaidRequest = {
        notes: notes || undefined,
        paidAt: paidAt ? new Date(`${paidAt}T00:00:00`).toISOString() : undefined,
        paymentReference: paymentReference || undefined
      };

      return markCommissionPaid(selectedCommission?.id ?? "", request);
    },
    onSuccess: () => {
      setSelectedCommission(null);
      setPaymentReference("");
      setPaidAt("");
      setNotes("");
      return queryClient.invalidateQueries({ queryKey: ["commissions"] });
    }
  });
  const records = commissionsQuery.data?.content ?? [];
  const normalizedError = commissionsQuery.error ? normalizeUnknownError(commissionsQuery.error) : null;
  const normalizedActionError = markPaidMutation.error ? normalizeUnknownError(markPaidMutation.error) : null;
  const currency = records[0]?.currency ?? "VND";

  function submitFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCommittedFilters(filters);
    setPage(0);
  }

  return (
    <section className="commission-page">
      <header className="commission-page-header">
        <div>
          <p className="eyebrow">Commissions</p>
          <h1>Commission Management</h1>
        </div>
      </header>
      <div className="commission-kpi-row">
        {metric("TOTAL PENDING COMMISSIONS", formatCurrency(amountSum(records, (record) => record.status === "PENDING" || record.status === "APPROVED"), currency))}
        {metric("YTD PAID OUT", formatCurrency(amountSum(records, (record) => record.status === "PAID" && isCurrentYear(record.paidAt)), currency))}
        {metric("PROCESSING TIME (AVG)", averageProcessingDays(records), "Based on paid records returned")}
      </div>
      <section className="commission-panel">
        <form className="commission-filter-bar" onSubmit={submitFilters}>
          <Input label="Beneficiary User" placeholder="Beneficiary user ID" value={filters.beneficiaryUserId} onChange={(event) => setFilters((current) => ({ ...current, beneficiaryUserId: event.target.value }))} />
          <Select label="Status" options={statusOptions} value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} />
          <Input label="Transaction ID" placeholder="e.g. 1024" value={filters.transactionId} onChange={(event) => setFilters((current) => ({ ...current, transactionId: event.target.value }))} />
          <Button type="submit" variant="secondary" disabled={commissionsQuery.isFetching}>
            <SlidersHorizontal size={15} />
            Apply Filters
          </Button>
        </form>
        {normalizedError ? <EmptyState title="Commissions could not be loaded" description={normalizedError.message} action={<Button onClick={() => commissionsQuery.refetch()}>Retry</Button>} /> : null}
        {commissionsQuery.isLoading ? <div className="notification-skeleton commission-table-skeleton" /> : null}
        {!commissionsQuery.isLoading && !normalizedError && !records.length ? <EmptyState title="No commissions found" description="No commission records matched the current filters." /> : null}
        {records.length ? <CommissionTable canMarkPaid records={records} onMarkPaid={setSelectedCommission} /> : null}
        {commissionsQuery.data ? <Pagination page={commissionsQuery.data.page} totalPages={commissionsQuery.data.totalPages} onPageChange={setPage} /> : null}
      </section>
      <Dialog open={Boolean(selectedCommission)} onClose={() => setSelectedCommission(null)} title="Mark Paid">
        <form
          className="dialog-body commission-paid-form"
          onSubmit={(event) => {
            event.preventDefault();
            markPaidMutation.mutate();
          }}
        >
          {normalizedActionError ? <p className="form-alert">{normalizedActionError.message}</p> : null}
          <Input
            label="Payment document / receipt reference"
            placeholder="Receipt, bank transfer, or payment document code"
            value={paymentReference}
            onChange={(event) => setPaymentReference(event.target.value)}
            required
          />
          <p className="muted">
            This stores the reference text sent as paymentReference to the API; it does not upload or open a payment file.
          </p>
          <Input label="Paid Date" type="date" value={paidAt} onChange={(event) => setPaidAt(event.target.value)} required />
          <label className="field">
            <span>Notes</span>
            <textarea className="input" value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} />
          </label>
          <footer className="dialog-actions">
            <Button type="button" variant="secondary" onClick={() => setSelectedCommission(null)}>Cancel</Button>
            <Button type="submit" disabled={markPaidMutation.isPending || !paymentReference.trim() || !paidAt}>
              <CheckCircle2 size={16} />
              Mark Paid
            </Button>
          </footer>
        </form>
      </Dialog>
    </section>
  );
}

function CommissionRulesView() {
  const rulesQuery = useQuery({
    queryFn: () => searchCommissionRules({ direction: "ASC", page: 0, size: 100, sortBy: "priority" }),
    queryKey: ["commission-rules", "list"],
    retry: 1
  });
  const rules = rulesQuery.data?.content ?? [];
  const normalizedError = rulesQuery.error ? normalizeUnknownError(rulesQuery.error) : null;
  const today = new Date();
  const activeRules = rules.filter((rule) => rule.active).length;
  const pendingEffective = rules.filter((rule) => rule.effectiveFrom && new Date(rule.effectiveFrom) > today).length;
  const highestPriority = rules.reduce<number | null>((lowest, rule) => {
    if (rule.priority == null) {
      return lowest;
    }

    return lowest == null ? rule.priority : Math.min(lowest, rule.priority);
  }, null);

  return (
    <section className="commission-page">
      <header className="commission-page-header">
        <div>
          <p className="eyebrow">Policies</p>
          <h1>Commission Rules</h1>
        </div>
        <Button asChild>
          <Link to="/commissions/rules/new"><Plus size={16} />Create New Rule</Link>
        </Button>
      </header>
      <div className="commission-kpi-row">
        {metric("ACTIVE RULES", String(activeRules))}
        {metric("PENDING EFFECTIVE", String(pendingEffective))}
        {metric("HIGHEST PRIORITY", highestPriority == null ? "--" : String(highestPriority))}
      </div>
      <section className="commission-panel">
        {normalizedError ? <EmptyState title="Commission rules could not be loaded" description={normalizedError.message} action={<Button onClick={() => rulesQuery.refetch()}>Retry</Button>} /> : null}
        {rulesQuery.isLoading ? <div className="notification-skeleton commission-table-skeleton" /> : null}
        {!rulesQuery.isLoading && !normalizedError && !rules.length ? <EmptyState title="No commission rules" description="Create a commission rule to start calculating payouts." /> : null}
        {rules.length ? (
          <Table>
            <thead>
              <tr>
                <th>Rule Name</th>
                <th>Type</th>
                <th>Rate / Amount</th>
                <th>Transaction Type</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id}>
                  <td><strong>{rule.name}</strong><small>{rule.code || "Code updating"}</small></td>
                  <td>{rule.calculationType}</td>
                  <td>
                    {rule.calculationType === "FIXED"
                      ? rule.fixedAmount == null ? "Fixed amount updating" : formatCurrency(rule.fixedAmount, rule.currency)
                      : rule.rate == null ? "Rate updating" : `${rule.rate}%`}
                  </td>
                  <td>{rule.transactionType}</td>
                  <td>{rule.priority ?? "--"}</td>
                  <td><StatusBadge tone={rule.active ? "success" : "neutral"}>{rule.active ? "Active" : "Inactive"}</StatusBadge></td>
                  <td>
                    <Button asChild size="sm" variant="ghost">
                      <Link to={`/commissions/rules/${rule.id}/edit`}><Edit3 size={15} />Edit</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : null}
      </section>
    </section>
  );
}

function numberOrUndefined(value: string) {
  return value.trim() ? Number(value) : undefined;
}

function draftFromRule(rule: CommissionRuleRecord): RuleDraft {
  return {
    active: rule.active,
    calculationType: rule.calculationType === "FIXED" ? "FIXED" : "PERCENTAGE",
    code: rule.code,
    currency: rule.currency,
    description: rule.description,
    effectiveFrom: rule.effectiveFrom,
    effectiveTo: rule.effectiveTo,
    fixedAmount: rule.fixedAmount == null ? "" : String(rule.fixedAmount),
    maxTransactionValue: rule.maxTransactionValue == null ? "" : String(rule.maxTransactionValue),
    minTransactionValue: rule.minTransactionValue == null ? "" : String(rule.minTransactionValue),
    name: rule.name,
    priority: rule.priority == null ? "" : String(rule.priority),
    rate: rule.rate == null ? "" : String(rule.rate),
    transactionType: rule.transactionType === "LEASE" ? "LEASE" : "SALE"
  };
}

function CommissionRuleFormView() {
  const { ruleId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(ruleId);
  const [draft, setDraft] = useState<RuleDraft>(emptyRuleDraft);
  const rulesQuery = useQuery({
    enabled: isEditing,
    queryFn: () => searchCommissionRules({ page: 0, size: 100 }),
    queryKey: ["commission-rules", "edit", ruleId],
    retry: 1
  });
  const editingRule = rulesQuery.data?.content.find((rule) => String(rule.id) === String(ruleId));
  const saveMutation = useMutation({
    mutationFn: () => {
      const request: CommissionRuleRequest = {
        active: draft.active,
        calculationType: draft.calculationType,
        code: draft.code.trim(),
        currency: draft.currency.trim() || undefined,
        description: draft.description || undefined,
        effectiveFrom: draft.effectiveFrom || undefined,
        effectiveTo: draft.effectiveTo || undefined,
        fixedAmount: draft.calculationType === "FIXED" ? numberOrUndefined(draft.fixedAmount) : undefined,
        maxTransactionValue: numberOrUndefined(draft.maxTransactionValue),
        minTransactionValue: numberOrUndefined(draft.minTransactionValue),
        name: draft.name.trim(),
        priority: numberOrUndefined(draft.priority),
        rate: draft.calculationType === "PERCENTAGE" ? numberOrUndefined(draft.rate) : undefined,
        transactionType: draft.transactionType
      };

      return isEditing ? updateCommissionRule(ruleId ?? "", request) : createCommissionRule(request);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["commission-rules"] });
      navigate("/commissions/rules");
    }
  });
  const normalizedError = rulesQuery.error || saveMutation.error ? normalizeUnknownError(rulesQuery.error ?? saveMutation.error) : null;

  useEffect(() => {
    if (editingRule) {
      setDraft(draftFromRule(editingRule));
    }
  }, [editingRule]);

  function updateDraft(field: keyof RuleDraft, value: string | boolean) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="commission-page commission-rule-workspace">
      <header className="commission-page-header">
        <div>
          <Link className="commission-back-link" to="/commissions/rules"><ArrowLeft size={16} />Commission Rules</Link>
          <h1>{isEditing ? "Update Commission Rule" : "Create Commission Rule"}</h1>
        </div>
      </header>
      {isEditing && rulesQuery.isLoading ? <div className="notification-skeleton commission-table-skeleton" /> : null}
      {isEditing && !rulesQuery.isLoading && !editingRule ? <EmptyState title="Rule could not be found" description="The rules API did not return a matching commission rule." /> : null}
      {normalizedError ? <p className="form-alert">{normalizedError.message}</p> : null}
      {!isEditing || editingRule ? (
        <form
          className="commission-rule-focused-form"
          onSubmit={(event) => {
            event.preventDefault();
            saveMutation.mutate();
          }}
        >
          <section className="commission-rule-card">
            <h2><FileText size={18} />Basic Info</h2>
            <div className="commission-rule-grid">
              <Input label="Rule Code" value={draft.code} onChange={(event) => updateDraft("code", event.target.value)} required />
              <Input label="Rule Name" value={draft.name} onChange={(event) => updateDraft("name", event.target.value)} required />
              <Select label="Transaction Type" options={[{ label: "Sale", value: "SALE" }, { label: "Lease", value: "LEASE" }]} value={draft.transactionType} onChange={(event) => updateDraft("transactionType", event.target.value)} />
              <label className="commission-switch">
                <input type="checkbox" checked={draft.active} onChange={(event) => updateDraft("active", event.target.checked)} />
                <span>Active Status</span>
              </label>
            </div>
          </section>
          <section className="commission-rule-card">
            <h2><SlidersHorizontal size={18} />Formula & Conditions</h2>
            <div className="commission-rule-grid">
              <Select label="Calculation Type" options={[{ label: "Percentage", value: "PERCENTAGE" }, { label: "Fixed", value: "FIXED" }]} value={draft.calculationType} onChange={(event) => updateDraft("calculationType", event.target.value)} />
              {draft.calculationType === "PERCENTAGE" ? (
                <Input label="Rate (%)" type="number" min={0} step="0.01" value={draft.rate} onChange={(event) => updateDraft("rate", event.target.value)} />
              ) : (
                <>
                  <Input label="Fixed Amount" type="number" min={0} step="0.01" value={draft.fixedAmount} onChange={(event) => updateDraft("fixedAmount", event.target.value)} />
                  <Input label="Currency" value={draft.currency} onChange={(event) => updateDraft("currency", event.target.value.toUpperCase())} />
                </>
              )}
              <Input label="Execution Priority" type="number" min={0} value={draft.priority} onChange={(event) => updateDraft("priority", event.target.value)} />
              <Input label="Min Transaction Value" type="number" min={0} value={draft.minTransactionValue} onChange={(event) => updateDraft("minTransactionValue", event.target.value)} />
              <Input label="Max Transaction Value" type="number" min={0} value={draft.maxTransactionValue} onChange={(event) => updateDraft("maxTransactionValue", event.target.value)} />
            </div>
          </section>
          <section className="commission-rule-card">
            <h2><UserRound size={18} />Validity & Details</h2>
            <div className="commission-rule-grid">
              <Input label="Effective From" type="date" value={draft.effectiveFrom} onChange={(event) => updateDraft("effectiveFrom", event.target.value)} />
              <Input label="Effective To" type="date" value={draft.effectiveTo} onChange={(event) => updateDraft("effectiveTo", event.target.value)} />
              <label className="field commission-description-field">
                <span>Description</span>
                <textarea className="input" value={draft.description} onChange={(event) => updateDraft("description", event.target.value)} rows={6} />
              </label>
            </div>
          </section>
          <footer className="commission-rule-footer">
            <Button asChild variant="secondary"><Link to="/commissions/rules">Cancel</Link></Button>
            <Button type="submit" disabled={saveMutation.isPending || !draft.code.trim() || !draft.name.trim()}>
              <Save size={16} />
              Save Policy
            </Button>
          </footer>
        </form>
      ) : null}
    </section>
  );
}

export function CommissionsPage({ view }: CommissionsPageProps) {
  if (view === "manage") {
    return <CommissionManagementView />;
  }

  if (view === "rules") {
    return <CommissionRulesView />;
  }

  if (view === "rule-form") {
    return <CommissionRuleFormView />;
  }

  return <MyCommissionsView />;
}
