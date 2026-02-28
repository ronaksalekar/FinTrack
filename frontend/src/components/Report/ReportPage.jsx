import { useMemo, useState } from "react";
import { Download, Calendar, TrendingUp, TrendingDown, IndianRupee, BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useEncryptedData } from "../../hooks/useEncryptedData";
import { formatCurrency } from "../../utils/currency";
import { PERIOD_FILTERS, PERIOD_LABELS } from "../../utils/analytics";
import { useAnalyticsWorker } from "../../hooks/useAnalyticsWorker";
import "./ReportPage.css";

const RADIAN = Math.PI / 180;

const renderPiePercentLabel = ({ cx, cy, midAngle, outerRadius, percent, payload }) => {
  const safePercent = payload?.percentage ?? Math.round((percent || 0) * 100);
  if (!safePercent) return null;

  const labelRadius = outerRadius + 18;
  const x = cx + labelRadius * Math.cos(-midAngle * RADIAN);
  const y = cy + labelRadius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="var(--text-primary)"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize="12"
      fontWeight="700"
      stroke="var(--surface-primary)"
      strokeWidth="3"
      paintOrder="stroke"
    >
      {`${safePercent}%`}
    </text>
  );
};

export default function ReportsPage() {
  const { data: transactions, loading, initialized, hasMore, loadMore } = useEncryptedData("transaction", {
    pageSize: 60,
  });
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [loadingMore, setLoadingMore] = useState(false);

  const { filteredTransactions, trendData, categoryBreakdown, analyticsLoading } =
    useAnalyticsWorker(transactions, selectedPeriod);

  const isInitialLoading = !initialized && loading;

  const metrics = useMemo(() => {
    const income = filteredTransactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const expenses = filteredTransactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const net = income - expenses;
    const avgExpense =
      expenses > 0
        ? expenses / Math.max(filteredTransactions.filter((item) => item.type === "expense").length, 1)
        : 0;

    return { income, expenses, net, avgExpense };
  }, [filteredTransactions]);

  const hasTrendData = trendData.some((item) => item.income > 0 || item.expense > 0);

  const recentExpenses = useMemo(
    () =>
      filteredTransactions
        .filter((item) => item.type === "expense")
        .sort((a, b) => new Date(b.date || b._timestamp) - new Date(a.date || a._timestamp))
        .slice(0, 8),
    [filteredTransactions]
  );

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await loadMore();
    setLoadingMore(false);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(filteredTransactions, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `report-${selectedPeriod}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isInitialLoading) {
    return (
      <div className="report-page">
        <div className="report-shell">
          <div className="report-skeleton-row">
            <div className="report-skeleton-block title" />
            <div className="report-skeleton-block subtitle" />
          </div>
          <div className="report-skeleton-grid">
            <div className="report-skeleton-card" />
            <div className="report-skeleton-card" />
            <div className="report-skeleton-card" />
            <div className="report-skeleton-card" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="report-page">
      <div className="report-shell">
        <header className="report-head">
          <div>
            <p className="report-kicker">Analytics</p>
            <h1>Reports</h1>
            <p className="report-subtitle">{PERIOD_LABELS[selectedPeriod]} analytics snapshot</p>
            {analyticsLoading && <span className="report-updating">Updating analytics...</span>}
          </div>

          <button className="report-export-btn" onClick={handleExport} type="button">
            <Download size={18} /> Export Report
          </button>
        </header>

        <section className="report-filters">
          <label>
            <Calendar size={14} /> Time period
          </label>
          <div className="report-period-buttons">
            {PERIOD_FILTERS.map((period) => (
              <button
                key={period.value}
                className={selectedPeriod === period.value ? "report-period-btn active" : "report-period-btn"}
                onClick={() => setSelectedPeriod(period.value)}
                type="button"
              >
                {period.label}
              </button>
            ))}
          </div>
        </section>

        <section className="report-summary">
          <article className="report-stat is-income">
            <div className="report-stat-icon">
              <TrendingUp size={18} />
            </div>
            <p className="report-stat-label">Total Income</p>
            <p className="report-stat-value">{formatCurrency(metrics.income)}</p>
          </article>

          <article className="report-stat is-expense">
            <div className="report-stat-icon">
              <TrendingDown size={18} />
            </div>
            <p className="report-stat-label">Total Expenses</p>
            <p className="report-stat-value">{formatCurrency(metrics.expenses)}</p>
          </article>

          <article className="report-stat is-net">
            <div className="report-stat-icon">
              <IndianRupee size={18} />
            </div>
            <p className="report-stat-label">Net Savings</p>
            <p className="report-stat-value">{formatCurrency(metrics.net)}</p>
          </article>

          <article className="report-stat is-average">
            <div className="report-stat-icon">
              <BarChart3 size={18} />
            </div>
            <p className="report-stat-label">Average Expense</p>
            <p className="report-stat-value">{formatCurrency(metrics.avgExpense)}</p>
          </article>
        </section>

        <section className="report-grid">
          <article className="report-panel report-panel-wide">
            <div className="report-panel-head">
              <h2>Income vs Expenses</h2>
              <p>{PERIOD_LABELS[selectedPeriod]} trend</p>
            </div>

            {hasTrendData ? (
              <div className="report-bar-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="label" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
                    <YAxis
                      tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                      tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                    />
                    <Tooltip formatter={(value) => formatCurrency(Number(value || 0))} />
                    <Legend />
                    <Bar
                      dataKey="income"
                      name="Income"
                      fill="#16a34a"
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={false}
                    />
                    <Bar
                      dataKey="expense"
                      name="Expense"
                      fill="#ef4444"
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="report-empty">No chart data in this period</p>
            )}
          </article>

          <article className="report-panel">
            <div className="report-panel-head">
              <h2>Category Breakdown</h2>
              <p>Expense categories</p>
            </div>

            {categoryBreakdown.length > 0 ? (
              <div className="report-pie-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={84}
                      isAnimationActive={false}
                      label={renderPiePercentLabel}
                      labelLine={{ stroke: "var(--border-color)", strokeWidth: 1.2 }}
                    >
                      {categoryBreakdown.map((item) => (
                        <Cell key={item.name} fill={item.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value || 0))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="report-empty">No expenses in this period</p>
            )}
          </article>

          <article className="report-panel">
            <div className="report-panel-head">
              <h2>Recent Expenses</h2>
              <p>Showing loaded history only</p>
            </div>

            <div className="report-table-wrap">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th className="right">Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {recentExpenses.length > 0 ? (
                    recentExpenses.map((item) => (
                      <tr key={item._id}>
                        <td>{item.description || "-"}</td>
                        <td>{item.category || "Other"}</td>
                        <td>{new Date(item.date || item._timestamp).toLocaleDateString()}</td>
                        <td className="right red">{formatCurrency(Number(item.amount || 0))}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="report-empty-cell">
                        No expense transactions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {hasMore && (
              <button className="report-load-more" type="button" onClick={handleLoadMore}>
                {loadingMore ? "Loading more..." : "Load More Transactions"}
              </button>
            )}
          </article>
        </section>

        <section className="report-insights">
          <article className="report-info is-blue">
            <h3>Filter-aware Analytics</h3>
            <p>All totals and charts update instantly when you switch period tags.</p>
          </article>

          <article className="report-info is-green">
            <h3>Security</h3>
            <p>Your server stores encrypted data blobs only.</p>
          </article>
        </section>
      </div>
    </div>
  );
}
