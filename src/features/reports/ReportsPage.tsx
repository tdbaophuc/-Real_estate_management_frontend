import { useMemo, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { BarChart3, CalendarDays, RefreshCcw, Search } from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { formatCurrency, formatDate } from "../../shared/lib/format";
import { Button } from "../../shared/ui/Button";
import { DatePicker } from "../../shared/ui/DatePicker";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Table } from "../../shared/ui/Table";
import { getReport, type DateRangeParams, type ReportData, type ReportKind, type ReportMetric } from "./reportApi";

type ReportConfig = {
  kind: ReportKind;
  primaryLabel: string;
  title: string;
};

const reports: ReportConfig[] = [
  { kind: "revenue", primaryLabel: "Revenue", title: "Revenue" },
  { kind: "leads", primaryLabel: "Leads", title: "Leads" },
  { kind: "transactions", primaryLabel: "Transactions", title: "Transactions" },
  { kind: "commissions", primaryLabel: "Commissions", title: "Commissions" }
];

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

function formatMetric(metric: ReportMetric) {
  if (typeof metric.value === "number") {
    if (metric.currency) {
      return formatCurrency(metric.value, metric.currency);
    }

    return metric.value.toLocaleString("vi-VN");
  }

  return metric.value;
}

function formatCellAmount(amount?: number, currency = "VND") {
  if (amount === undefined) {
    return "Updating";
  }

  return formatCurrency(amount, currency);
}

function formatCellDate(value?: string) {
  if (!value) {
    return "Updating";
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : formatDate(parsed);
}

function ReportChart({ data, primaryLabel, type }: { data: ReportData; primaryLabel: string; type: ReportKind }) {
  const hasChartData = data.series.some((point) => point.primary > 0 || (point.secondary ?? 0) > 0);

  if (!hasChartData) {
    return (
      <div className="report-chart-empty">
        <EmptyState
          title="No chart data"
          description="This report has no chartable values for the selected date range."
        />
      </div>
    );
  }

  const chartData = data.series.map((point) => ({
    ...point,
    secondary: point.secondary ?? 0
  }));

  return (
    <div className="report-chart">
      <ResponsiveContainer width="100%" height="100%">
        {type === "revenue" || type === "commissions" ? (
          <LineChart data={chartData} margin={{ bottom: 8, left: 0, right: 8, top: 8 }}>
            <CartesianGrid stroke="#d9e1dd" strokeDasharray="3 3" />
            <XAxis dataKey="label" minTickGap={16} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} width={72} />
            <Tooltip formatter={(value) => Number(value).toLocaleString("vi-VN")} />
            <Line dataKey="primary" name={primaryLabel} stroke="#0f6f5c" strokeWidth={3} type="monotone" />
            <Line dataKey="secondary" name="Secondary" stroke="#155eef" strokeWidth={2} type="monotone" />
          </LineChart>
        ) : (
          <BarChart data={chartData} margin={{ bottom: 8, left: 0, right: 8, top: 8 }}>
            <CartesianGrid stroke="#d9e1dd" strokeDasharray="3 3" />
            <XAxis dataKey="label" minTickGap={16} tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={56} />
            <Tooltip formatter={(value) => Number(value).toLocaleString("vi-VN")} />
            <Bar dataKey="primary" fill="#0f6f5c" name={primaryLabel} radius={[6, 6, 0, 0]} />
            <Bar dataKey="secondary" fill="#155eef" name="Secondary" radius={[6, 6, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

function ReportPanel({ config, range }: { config: ReportConfig; range: DateRangeParams }) {
  const reportQuery = useQuery({
    queryFn: () => getReport(config.kind, range),
    queryKey: ["reports", config.kind, range],
    retry: 1
  });
  const error = reportQuery.error ? normalizeUnknownError(reportQuery.error) : null;
  const metrics = reportQuery.data?.metrics ?? [];

  return (
    <section className="content-section report-panel">
      <div className="section-header">
        <div>
          <p className="eyebrow">{config.title}</p>
          <h2>{config.title} report</h2>
        </div>
        <Button
          aria-label={`Refresh ${config.title} report`}
          disabled={reportQuery.isFetching}
          onClick={() => reportQuery.refetch()}
          size="icon"
          variant="secondary"
        >
          <RefreshCcw size={17} />
        </Button>
      </div>
      {error ? (
        <EmptyState
          title={`${config.title} report could not be loaded`}
          description={error.message}
          action={<Button onClick={() => reportQuery.refetch()}>Retry</Button>}
        />
      ) : null}
      {reportQuery.isLoading ? (
        <div className="report-skeleton-grid">
          <div />
          <div />
          <div />
        </div>
      ) : null}
      {reportQuery.data && !error ? (
        <>
          <div className="report-summary-grid">
            {metrics.length ? (
              metrics.map((metric, index) => (
                <article className="report-summary-card" key={`${metric.label}-${index}`}>
                  <span>{metric.label}</span>
                  <strong>{formatMetric(metric)}</strong>
                </article>
              ))
            ) : (
              <article className="report-summary-card">
                <span>Summary</span>
                <strong>0</strong>
              </article>
            )}
          </div>
          <ReportChart data={reportQuery.data} primaryLabel={config.primaryLabel} type={config.kind} />
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Metric</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {reportQuery.data.rows.length ? (
                reportQuery.data.rows.map((row) => (
                  <tr key={`${config.kind}-${row.id}`}>
                    <td>
                      <strong>{row.name}</strong>
                      <small>{row.id}</small>
                    </td>
                    <td>{row.status || "Updating"}</td>
                    <td>{formatCellAmount(row.amount, row.currency)}</td>
                    <td>{row.metric || "Updating"}</td>
                    <td>{formatCellDate(row.date)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="table-empty" colSpan={5}>
                    No table rows for this date range.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </>
      ) : null}
    </section>
  );
}

export function ReportsPage() {
  const queryClient = useQueryClient();
  const defaultRange = useMemo(getDefaultRange, []);
  const [draftRange, setDraftRange] = useState(defaultRange);
  const [range, setRange] = useState(defaultRange);

  function submitRange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextRange = {
      endDate: draftRange.endDate,
      startDate: draftRange.startDate
    };

    setRange(nextRange);
    void queryClient.invalidateQueries({ queryKey: ["reports"] });
  }

  function resetRange() {
    const nextRange = getDefaultRange();
    setDraftRange(nextRange);
    setRange(nextRange);
    void queryClient.invalidateQueries({ queryKey: ["reports"] });
  }

  return (
    <section className="reports-page">
      <div className="section-header">
        <div>
          <p className="eyebrow">Reports</p>
          <h2>Performance reports</h2>
          <p className="muted">
            <CalendarDays size={16} />
            {range.startDate} to {range.endDate}
          </p>
        </div>
      </div>
      <form className="filter-bar report-filter-bar" onSubmit={submitRange}>
        <DatePicker
          label="Start date"
          max={draftRange.endDate}
          value={draftRange.startDate}
          onChange={(event) => setDraftRange((current) => ({ ...current, startDate: event.target.value }))}
        />
        <DatePicker
          label="End date"
          min={draftRange.startDate}
          value={draftRange.endDate}
          onChange={(event) => setDraftRange((current) => ({ ...current, endDate: event.target.value }))}
        />
        <div className="filter-actions">
          <Button type="submit">
            <Search size={16} />
            Apply range
          </Button>
          <Button type="button" onClick={resetRange} variant="secondary">
            Reset
          </Button>
        </div>
      </form>
      <div className="reports-grid">
        {reports.map((report) => (
          <ReportPanel config={report} key={report.kind} range={range} />
        ))}
      </div>
      <div className="reports-footnote">
        <BarChart3 size={16} />
        <span>Charts and tables refresh when the committed date range changes.</span>
      </div>
    </section>
  );
}
