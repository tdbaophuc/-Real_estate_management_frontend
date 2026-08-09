import { useMemo, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { CalendarDays, Download, FileDown, Search } from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { formatCurrency } from "../../shared/lib/format";
import { Button } from "../../shared/ui/Button";
import { DatePicker } from "../../shared/ui/DatePicker";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Input } from "../../shared/ui/Input";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { Table } from "../../shared/ui/Table";
import {
  getCommissionReport,
  getLeadReport,
  getRevenueReport,
  getTransactionReport,
  type CommissionReportData,
  type DateRangeParams,
  type LeadReportData,
  type RevenueReportData,
  type TransactionReportData
} from "./reportApi";

type LedgerRow = {
  amount?: number;
  count?: number;
  currency?: string;
  id: string;
  metric: string;
  name: string;
  status: "REVIEW" | "STANDARD" | "TOP TIER";
};

const ledgerPageSize = 8;
const chartColors = ["#0061a4", "#1ea446", "#d92d20", "#7a3db8", "#f59e0b", "#0f766e"];

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getDefaultRange(): DateRangeParams {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 29);

  return {
    endDate: toDateInputValue(end),
    startDate: toDateInputValue(start)
  };
}

function sumRevenue(revenue?: RevenueReportData) {
  return revenue?.revenueSummary.reduce((sum, item) => sum + item.completedTransactionValue, 0) ?? 0;
}

function sumPaidCommissions(revenue?: RevenueReportData, commissions?: CommissionReportData) {
  const fromRevenue = revenue?.revenueSummary.reduce((sum, item) => sum + item.paidCommissions, 0) ?? 0;

  if (fromRevenue > 0) {
    return fromRevenue;
  }

  return commissions?.commissionAmounts.reduce((sum, item) => sum + item.amount, 0) ?? 0;
}

function leadConversionRate(leads?: LeadReportData) {
  if (!leads?.totalLeads) {
    return "--";
  }

  const converted = leads.leadsByStatus
    .filter((item) => /CONVERT|WON|CLOSED|CUSTOMER/i.test(item.status))
    .reduce((sum, item) => sum + item.count, 0);

  if (!converted) {
    return "--";
  }

  return `${((converted / leads.totalLeads) * 100).toFixed(1)}%`;
}

function firstCurrency(revenue?: RevenueReportData, commissions?: CommissionReportData, transactions?: TransactionReportData) {
  return revenue?.revenueSummary[0]?.currency
    ?? commissions?.commissionAmounts[0]?.currency
    ?? transactions?.completedTransactionValues[0]?.currency
    ?? "VND";
}

function reportError(...errors: unknown[]) {
  const error = errors.find(Boolean);
  return error ? normalizeUnknownError(error) : null;
}

function statusTone(status: LedgerRow["status"]) {
  if (status === "TOP TIER") {
    return "success";
  }

  if (status === "REVIEW") {
    return "warning";
  }

  return "info";
}

function makeLedgerRows(
  revenue?: RevenueReportData,
  leads?: LeadReportData,
  transactions?: TransactionReportData,
  commissions?: CommissionReportData
): LedgerRow[] {
  const rows: LedgerRow[] = [];

  revenue?.revenueSummary.forEach((item, index) => {
    rows.push({
      amount: item.completedTransactionValue,
      count: item.completedTransactions,
      currency: item.currency,
      id: `revenue-${item.currency}-${index}`,
      metric: `${item.completedTransactions} completed transactions`,
      name: `Revenue Summary / ${item.currency}`,
      status: item.completedTransactionValue > 0 ? "TOP TIER" : "REVIEW"
    });
  });

  transactions?.transactionsByStatus.forEach((item, index) => {
    rows.push({
      count: item.count,
      id: `transaction-${item.status}-${index}`,
      metric: `${item.count} transactions`,
      name: `Transactions / ${item.status}`,
      status: item.status === "COMPLETED" ? "TOP TIER" : item.status === "CANCELLED" ? "REVIEW" : "STANDARD"
    });
  });

  leads?.leadsByStatus.forEach((item, index) => {
    rows.push({
      count: item.count,
      id: `lead-${item.status}-${index}`,
      metric: `${item.count} leads`,
      name: `Leads / ${item.status}`,
      status: /CONVERT|WON|CLOSED|CUSTOMER/i.test(item.status) ? "TOP TIER" : "STANDARD"
    });
  });

  commissions?.commissionAmounts.forEach((item, index) => {
    rows.push({
      amount: item.amount,
      count: item.count,
      currency: item.currency,
      id: `commission-${item.currency}-${index}`,
      metric: `${item.count} commission records`,
      name: `Commissions / ${item.currency}`,
      status: item.amount > 0 ? "STANDARD" : "REVIEW"
    });
  });

  commissions?.commissionsByStatus.forEach((item, index) => {
    rows.push({
      count: item.count,
      id: `commission-status-${item.status}-${index}`,
      metric: `${item.count} records`,
      name: `Commission Status / ${item.status}`,
      status: item.status === "PAID" ? "TOP TIER" : item.status === "PENDING" ? "REVIEW" : "STANDARD"
    });
  });

  return rows;
}

function makeTrendData(revenue?: RevenueReportData, commissions?: CommissionReportData) {
  const revenueTotal = sumRevenue(revenue);
  const commissionTotal = commissions?.commissionAmounts.reduce((sum, item) => sum + item.amount, 0) ?? 0;

  return [
    {
      commissions: commissionTotal,
      label: revenue?.from || commissions?.from || "From",
      revenue: revenueTotal
    },
    {
      commissions: commissionTotal,
      label: revenue?.to || commissions?.to || "To",
      revenue: revenueTotal
    }
  ];
}

function makeDistributionData(transactions?: TransactionReportData) {
  if (transactions?.completedTransactionValues.length) {
    return transactions.completedTransactionValues.map((item) => ({
      name: item.currency,
      value: item.amount
    }));
  }

  return (transactions?.transactionsByStatus ?? []).map((item) => ({
    name: item.status,
    value: item.count
  }));
}

function exportRowsAsCsv(rows: LedgerRow[]) {
  const csvRows = [
    ["name", "metric", "count", "amount", "currency", "status"],
    ...rows.map((row) => [row.name, row.metric, row.count ?? "", row.amount ?? "", row.currency ?? "", row.status])
  ];
  const csv = csvRows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, "\"\"")}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = "agent-performance-ledger.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function exportPdf() {
  window.print();
}

function KpiCard({ label, trend, value }: { label: string; trend?: "down" | "up"; value: string }) {
  return (
    <article className="report-kpi-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {trend ? <small className={trend === "up" ? "trend-up" : "trend-down"}>{trend === "up" ? "↗" : "↘"} API range</small> : null}
    </article>
  );
}

export function ReportsPage() {
  const queryClient = useQueryClient();
  const defaultRange = useMemo(getDefaultRange, []);
  const [draftRange, setDraftRange] = useState(defaultRange);
  const [range, setRange] = useState(defaultRange);
  const [agentFilter, setAgentFilter] = useState("");
  const [ledgerPage, setLedgerPage] = useState(0);
  const revenueQuery = useQuery({
    queryFn: () => getRevenueReport(range),
    queryKey: ["reports", "revenue", range],
    retry: 1
  });
  const leadsQuery = useQuery({
    queryFn: () => getLeadReport(range),
    queryKey: ["reports", "leads", range],
    retry: 1
  });
  const transactionsQuery = useQuery({
    queryFn: () => getTransactionReport(range),
    queryKey: ["reports", "transactions", range],
    retry: 1
  });
  const commissionsQuery = useQuery({
    queryFn: () => getCommissionReport(range),
    queryKey: ["reports", "commissions", range],
    retry: 1
  });
  const isLoading = revenueQuery.isLoading || leadsQuery.isLoading || transactionsQuery.isLoading || commissionsQuery.isLoading;
  const error = reportError(revenueQuery.error, leadsQuery.error, transactionsQuery.error, commissionsQuery.error);
  const revenue = revenueQuery.data;
  const leads = leadsQuery.data;
  const transactions = transactionsQuery.data;
  const commissions = commissionsQuery.data;
  const currency = firstCurrency(revenue, commissions, transactions);
  const ledgerRows = useMemo(() => makeLedgerRows(revenue, leads, transactions, commissions), [commissions, leads, revenue, transactions]);
  const filteredLedgerRows = ledgerRows.filter((row) => row.name.toLowerCase().includes(agentFilter.toLowerCase()));
  const totalLedgerPages = Math.max(Math.ceil(filteredLedgerRows.length / ledgerPageSize), 1);
  const pageRows = filteredLedgerRows.slice(ledgerPage * ledgerPageSize, (ledgerPage + 1) * ledgerPageSize);
  const trendData = makeTrendData(revenue, commissions);
  const distributionData = makeDistributionData(transactions);

  function submitRange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextRange = {
      endDate: draftRange.endDate,
      startDate: draftRange.startDate
    };

    setRange(nextRange);
    setLedgerPage(0);
    void queryClient.invalidateQueries({ queryKey: ["reports"] });
  }

  return (
    <section className="reports-page reports-dashboard-page">
      <header className="reports-dashboard-header">
        <div>
          <p className="eyebrow">Reports</p>
          <h1>Reports & Revenue</h1>
          <p>Consolidated revenue, commission, transaction, and lead performance for the selected reporting window.</p>
        </div>
        <form className="reports-header-actions" onSubmit={submitRange}>
          <div className="reports-date-range">
            <CalendarDays size={16} />
            <DatePicker
              aria-label="From"
              max={draftRange.endDate}
              value={draftRange.startDate}
              onChange={(event) => setDraftRange((current) => ({ ...current, startDate: event.target.value }))}
            />
            <span>to</span>
            <DatePicker
              aria-label="To"
              min={draftRange.startDate}
              value={draftRange.endDate}
              onChange={(event) => setDraftRange((current) => ({ ...current, endDate: event.target.value }))}
            />
          </div>
          <Button type="submit" variant="secondary">Apply</Button>
          <Button type="button" variant="secondary" onClick={exportPdf}>
            <FileDown size={16} />
            Export PDF
          </Button>
          <Button type="button" variant="secondary" onClick={() => exportRowsAsCsv(filteredLedgerRows)} disabled={!filteredLedgerRows.length}>
            <Download size={16} />
            Export CSV
          </Button>
        </form>
      </header>

      {error ? (
        <section className="report-dashboard-card">
          <EmptyState title="Reports could not be loaded" description={error.message} action={<Button onClick={() => queryClient.invalidateQueries({ queryKey: ["reports"] })}>Retry</Button>} />
        </section>
      ) : null}

      <div className="report-kpi-grid">
        <KpiCard label="Total Revenue" value={formatCurrency(sumRevenue(revenue), currency)} trend={sumRevenue(revenue) > 0 ? "up" : undefined} />
        <KpiCard label="Commissions Disbursed" value={formatCurrency(sumPaidCommissions(revenue, commissions), currency)} trend={sumPaidCommissions(revenue, commissions) > 0 ? "up" : undefined} />
        <KpiCard label="Total Transactions" value={(transactions?.totalTransactions ?? 0).toLocaleString("vi-VN")} />
        <KpiCard label="Lead Conversion Rate" value={leadConversionRate(leads)} />
      </div>

      <div className="reports-analytics-grid">
        <section className="report-dashboard-card">
          <div className="report-card-heading">
            <h2>Revenue & Commission Trends</h2>
            <span>{range.startDate} to {range.endDate}</span>
          </div>
          <div className="reports-line-chart">
            {isLoading ? (
              <div className="report-chart-loading" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ bottom: 10, left: 0, right: 20, top: 10 }}>
                  <XAxis dataKey="label" tick={{ fill: "#44474e", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#44474e", fontSize: 12 }} width={76} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value), currency)} />
                  <Area dataKey="revenue" fill="#c6ddf0" name="Revenue" stroke="#0061a4" strokeWidth={3} type="monotone" />
                  <Area dataKey="commissions" fill="#e7f2ff" name="Commissions" stroke="#4b8fc8" strokeWidth={3} type="monotone" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
        <section className="report-dashboard-card">
          <div className="report-card-heading">
            <h2>Asset Class Dist.</h2>
            <span>Returned report data</span>
          </div>
          <div className="reports-pie-chart">
            {isLoading ? (
              <div className="report-chart-loading" />
            ) : distributionData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distributionData} dataKey="value" innerRadius={48} outerRadius={82} paddingAngle={2}>
                    {distributionData.map((entry, index) => (
                      <Cell fill={chartColors[index % chartColors.length]} key={entry.name} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => Number(value).toLocaleString("vi-VN")} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="report-api-note">The reports API does not return asset-class distribution for this range.</div>
            )}
          </div>
          <div className="report-pie-legend">
            {distributionData.slice(0, 5).map((item, index) => (
              <span key={item.name}><i style={{ background: chartColors[index % chartColors.length] }} />{item.name}</span>
            ))}
          </div>
        </section>
      </div>

      <section className="report-dashboard-card report-ledger-card">
        <div className="report-card-heading">
          <div>
            <h2>Agent Performance Ledger</h2>
            <p>Rows are composed from the four report API responses for the active date range.</p>
          </div>
          <div className="report-ledger-search">
            <Search size={16} />
            <Input
              aria-label="Filter agents"
              placeholder="Filter agents..."
              value={agentFilter}
              onChange={(event) => {
                setAgentFilter(event.target.value);
                setLedgerPage(0);
              }}
            />
          </div>
        </div>
        {isLoading ? <div className="report-chart-loading report-ledger-loading" /> : null}
        {!isLoading ? (
          <>
            <Table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Metric</th>
                  <th>Count</th>
                  <th>Revenue / Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length ? pageRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td>{row.metric}</td>
                    <td>{row.count ?? "--"}</td>
                    <td><strong>{row.amount == null ? "--" : formatCurrency(row.amount, row.currency ?? currency)}</strong></td>
                    <td><StatusBadge tone={statusTone(row.status)}>{row.status}</StatusBadge></td>
                  </tr>
                )) : (
                  <tr><td className="table-empty" colSpan={5}>No ledger rows returned for this range.</td></tr>
                )}
              </tbody>
            </Table>
            <div className="report-ledger-pagination">
              {Array.from({ length: totalLedgerPages }).map((_, index) => (
                <button className={ledgerPage === index ? "is-active" : ""} key={index} type="button" onClick={() => setLedgerPage(index)}>
                  {index + 1}
                </button>
              ))}
            </div>
          </>
        ) : null}
      </section>
    </section>
  );
}
