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
import {
  PERIOD_FILTERS,
  PERIOD_LABELS,
} from "../../utils/analytics";
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
  const {
    data: transactions,
    loading,
    initialized,
    hasMore,
    loadMore,
  } = useEncryptedData("transaction", { pageSize: 60 });
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [loadingMore, setLoadingMore] = useState(false);

  const {
    filteredTransactions,
    trendData,
    categoryBreakdown,
    analyticsLoading,
  } = useAnalyticsWorker(transactions, selectedPeriod);

  const isInitialLoading = !initialized && loading;

  const metrics = useMemo(() => {
    const income = filteredTransactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const expenses = filteredTransactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const net = income - expenses;
    const avgExpense = expenses > 0
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
        .slice(0, 6),
    [filteredTransactions]
  );

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await loadMore();
    setLoadingMore(false);
  };

  if (isInitialLoading) {
    return (
      <div className="reports">
        <div className="reports-container">
          <div className="skeleton-row">
            <div className="skeleton-block title" />
            <div className="skeleton-block subtitle" />
          </div>
          <div className="skeleton-grid">
            <div className="skeleton-card" />
            <div className="skeleton-card" />
            <div className="skeleton-card" />
            <div className="skeleton-card" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reports">
      <div className="reports-header">
        <div>
          <h1>Reports</h1>
          <p>{PERIOD_LABELS[selectedPeriod]} analytics snapshot</p>
          {analyticsLoading && <span className="updating-tag">Updating analytics...</span>}
        </div>

        <button
          className="export-btn"
          onClick={() => {
            const blob = new Blob([JSON.stringify(filteredTransactions, null, 2)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `report-${selectedPeriod}.json`;
            link.click();
          }}
          type="button"
        >
          <Download size={18} /> Export Report
        </button>
      </div>

      <div className="reports-container">
        <div className="filters">
          <div>
            <label>
              <Calendar size={14} /> Time Period
            </label>

            <div className="period-buttons">
              {PERIOD_FILTERS.map((period) => (
                <button
                  key={period.value}
                  className={selectedPeriod === period.value ? "active" : ""}
                  onClick={() => setSelectedPeriod(period.value)}
                  type="button"
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="summary">
          <div className="stat gradient">
            <TrendingUp />
            <h3>{formatCurrency(metrics.income)}</h3>
            <span>Total Income</span>
          </div>

          <div className="stat expense">
            <TrendingDown />
            <h3>{formatCurrency(metrics.expenses)}</h3>
            <span>Total Expenses</span>
          </div>

          <div className="stat income">
            <IndianRupee />
            <h3>{formatCurrency(metrics.net)}</h3>
            <span>Net Savings</span>
          </div>

          <div className="stat daily">
            <BarChart3 />
            <h3>{formatCurrency(metrics.avgExpense)}</h3>
            <span>Average Expense</span>
          </div>
        </div>

        <div className="card wide">
          <h3>Income vs Expenses</h3>
          <p className="chart-tag">{PERIOD_LABELS[selectedPeriod]} trend</p>
          {hasTrendData ? (
            <div className="bar-chart">
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
            <p className="empty">No chart data in this period</p>
          )}
        </div>

        <div className="card">
          <h3>Category Breakdown</h3>
          <p className="chart-tag">Expense categories</p>
          {categoryBreakdown.length > 0 ? (
            <div className="pie-chart">
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
            <p className="empty">No expenses in this period</p>
          )}
        </div>

        <div className="card">
          <h3>Recent Expenses</h3>
          <p className="chart-tag">Showing loaded history only</p>
          <table>
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
                  <td colSpan="4" className="empty">No expense transactions found</td>
                </tr>
              )}
            </tbody>
          </table>
          {hasMore && (
            <button className="secondary-btn load-more-btn" type="button" onClick={handleLoadMore}>
              {loadingMore ? "Loading more..." : "Load More Transactions"}
            </button>
          )}
        </div>

        <div className="insights">
          <div className="info blue">
            <h4>Filter-aware Analytics</h4>
            <p>All totals and charts update instantly when you switch period tags.</p>
          </div>

          <div className="info green">
            <h4>Security</h4>
            <p>Your server stores encrypted data blobs only.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
