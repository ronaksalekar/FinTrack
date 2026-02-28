import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  CreditCard,
  Calendar,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useEncryptedData } from "../hooks/useEncryptedData";
import { formatCurrency } from "../utils/currency";
import { PERIOD_FILTERS, PERIOD_LABELS } from "../utils/analytics";
import { useAnalyticsWorker } from "../hooks/useAnalyticsWorker";
import "./Dashboard.css";

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

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const {
    data: transactions,
    loading: transactionsLoading,
    initialized: transactionsInitialized,
  } = useEncryptedData("transaction", { pageSize: 75, prefetchAll: true });
  const {
    data: budgets,
    loading: budgetsLoading,
    initialized: budgetsInitialized,
  } = useEncryptedData("budget", { pageSize: 50 });

  const { filteredTransactions, trendData, categoryBreakdown, analyticsLoading } =
    useAnalyticsWorker(transactions, selectedPeriod);

  const isInitialLoading =
    (!transactionsInitialized && transactionsLoading) || (!budgetsInitialized && budgetsLoading);

  const budgetsByCategory = useMemo(
    () =>
      filteredTransactions
        .filter((item) => item.type === "expense")
        .reduce((acc, item) => {
          const category = item.category || "Other";
          acc[category] = (acc[category] || 0) + Number(item.amount || 0);
          return acc;
        }, {}),
    [filteredTransactions]
  );

  const stats = useMemo(() => {
    const income = filteredTransactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const expenses = filteredTransactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    return {
      totalBalance: income - expenses,
      income,
      expenses,
      savings: income - expenses,
    };
  }, [filteredTransactions]);

  const hasTrendData = trendData.some((item) => item.income > 0 || item.expense > 0);

  const recentTransactions = useMemo(
    () =>
      [...filteredTransactions]
        .sort((a, b) => new Date(b.date || b._timestamp) - new Date(a.date || a._timestamp))
        .slice(0, 6)
        .map((item) => ({
          id: item._id,
          name: item.description || item.category || "Transaction",
          date: new Date(item.date || item._timestamp).toLocaleDateString(),
          amount: Number(item.amount || 0),
          type: item.type,
        })),
    [filteredTransactions]
  );

  const formattedBudgets = useMemo(
    () =>
      budgets
        .map((budget) => {
          const spent = Number(budgetsByCategory[budget.category] || 0);
          const total = Number(budget.limit || 0);
          const usage = total > 0 ? (spent / total) * 100 : 0;
          const roundedUsage = Math.round(usage);
          const remaining = total - spent;

          let statusLabel = "On Track";
          let statusClass = "is-good";
          let barClass = "is-good";

          if (usage > 100) {
            statusLabel = "Over Budget";
            statusClass = "is-danger";
            barClass = "is-danger";
          } else if (usage >= 80) {
            statusLabel = "Near Limit";
            statusClass = "is-warn";
            barClass = "is-warn";
          }

          return {
            category: budget.category,
            spent,
            total,
            remaining,
            usage: roundedUsage,
            progress: Math.min(Math.max(usage, 0), 100),
            statusLabel,
            statusClass,
            barClass,
          };
        })
        .sort((a, b) => b.usage - a.usage),
    [budgets, budgetsByCategory]
  );

  const overBudgetCount = formattedBudgets.filter((item) => item.remaining < 0).length;

  if (isInitialLoading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-shell">
          <div className="dashboard-skeleton-row">
            <div className="dashboard-skeleton-block title" />
            <div className="dashboard-skeleton-block subtitle" />
          </div>
          <div className="dashboard-skeleton-grid">
            <div className="dashboard-skeleton-card" />
            <div className="dashboard-skeleton-card" />
            <div className="dashboard-skeleton-card" />
            <div className="dashboard-skeleton-card" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <header className="dashboard-head">
          <p className="dashboard-kicker">Overview</p>
          <h1>Dashboard</h1>
          <p className="dashboard-subtitle">Showing {PERIOD_LABELS[selectedPeriod]} performance</p>
          {analyticsLoading && <span className="dashboard-updating">Updating analytics...</span>}
        </header>

        <div className="dashboard-period">
          {PERIOD_FILTERS.map((period) => (
            <button
              key={period.value}
              className={selectedPeriod === period.value ? "dashboard-period-btn active" : "dashboard-period-btn"}
              onClick={() => setSelectedPeriod(period.value)}
              type="button"
            >
              {period.label}
            </button>
          ))}
        </div>

        <section className="dashboard-stats">
          <article className="dashboard-stat is-balance">
            <div className="dashboard-stat-icon">
              <Wallet size={18} />
            </div>
            <p className="dashboard-stat-label">Total Balance</p>
            <p className="dashboard-stat-value">{formatCurrency(stats.totalBalance)}</p>
          </article>

          <article className="dashboard-stat is-income">
            <div className="dashboard-stat-icon">
              <TrendingUp size={18} />
            </div>
            <p className="dashboard-stat-label">Income</p>
            <p className="dashboard-stat-value">{formatCurrency(stats.income)}</p>
          </article>

          <article className="dashboard-stat is-expense">
            <div className="dashboard-stat-icon">
              <TrendingDown size={18} />
            </div>
            <p className="dashboard-stat-label">Expenses</p>
            <p className="dashboard-stat-value">{formatCurrency(stats.expenses)}</p>
          </article>

          <article className="dashboard-stat is-savings">
            <div className="dashboard-stat-icon">
              <IndianRupee size={18} />
            </div>
            <p className="dashboard-stat-label">Savings</p>
            <p className="dashboard-stat-value">{formatCurrency(stats.savings)}</p>
          </article>
        </section>

        <section className="dashboard-charts">
          <article className="dashboard-panel">
            <div className="dashboard-panel-head">
              <h2>Income vs Expense Trend</h2>
              <p>{PERIOD_LABELS[selectedPeriod]}</p>
            </div>

            {hasTrendData ? (
              <div className="dashboard-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="label" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
                    <YAxis
                      tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                      tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                    />
                    <Tooltip formatter={(value) => formatCurrency(Number(value || 0))} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="income"
                      name="Income"
                      stroke="#16a34a"
                      strokeWidth={2.5}
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="expense"
                      name="Expense"
                      stroke="#ef4444"
                      strokeWidth={2.5}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="dashboard-empty">No transactions in this period</p>
            )}
          </article>

          <article className="dashboard-panel">
            <div className="dashboard-panel-head">
              <h2>Expense Breakdown</h2>
              <p>By category</p>
            </div>

            {categoryBreakdown.length > 0 ? (
              <div className="dashboard-pie">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={82}
                      isAnimationActive={false}
                      label={renderPiePercentLabel}
                      labelLine={{ stroke: "var(--border-color)", strokeWidth: 1.2 }}
                    >
                      {categoryBreakdown.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value || 0))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="dashboard-empty">No expense data in this period</p>
            )}
          </article>
        </section>

        <section className="dashboard-lists">
          <article className="dashboard-panel">
            <div className="dashboard-panel-head">
              <h2>Recent Transactions</h2>
              <p>Latest entries from loaded history</p>
            </div>

            {recentTransactions.length > 0 ? (
              <div className="dashboard-transaction-list">
                {recentTransactions.map((item) => (
                  <div className="dashboard-transaction-item" key={item.id}>
                    <div className="dashboard-transaction-meta">
                      <p className="dashboard-transaction-name">{item.name}</p>
                      <p className="dashboard-transaction-date">{item.date}</p>
                    </div>

                    <p
                      className={
                        item.type === "income"
                          ? "dashboard-transaction-amount income"
                          : "dashboard-transaction-amount expense"
                      }
                    >
                      {item.type === "income" ? "+" : "-"}
                      {formatCurrency(Math.abs(item.amount))}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="dashboard-empty">No transactions in this period</p>
            )}
          </article>

          <article className="dashboard-panel">
            <div className="dashboard-panel-head">
              <h2>Spending vs Budget</h2>
              {formattedBudgets.length > 0 && (
                <p>
                  {overBudgetCount} of {formattedBudgets.length} budgets over limit
                </p>
              )}
            </div>

            {formattedBudgets.length > 0 ? (
              <div className="dashboard-budget-list">
                {formattedBudgets.map((item) => (
                  <div className="dashboard-budget-item" key={item.category}>
                    <div className="dashboard-budget-top">
                      <div>
                        <p className="dashboard-budget-category">{item.category}</p>
                        <p className="dashboard-budget-meta">
                          {formatCurrency(item.spent)} spent of {formatCurrency(item.total)}
                        </p>
                      </div>
                      <span className={`dashboard-budget-status ${item.statusClass}`}>{item.statusLabel}</span>
                    </div>

                    <div className="dashboard-budget-bar">
                      <div className={`dashboard-budget-fill ${item.barClass}`} style={{ width: `${item.progress}%` }} />
                    </div>

                    <div className="dashboard-budget-foot">
                      <span>{item.usage}% used</span>
                      <span className={item.remaining < 0 ? "dashboard-budget-over" : "dashboard-budget-left"}>
                        {item.remaining < 0
                          ? `${formatCurrency(Math.abs(item.remaining))} over`
                          : `${formatCurrency(item.remaining)} left`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="dashboard-empty">No budgets created yet</p>
            )}
          </article>
        </section>

        <section className="dashboard-actions">
          <button className="dashboard-action-btn" onClick={() => navigate("/transactions/add")} type="button">
            <TrendingUp size={18} /> Add Transaction
          </button>

          <button className="dashboard-action-btn" onClick={() => navigate("/budgets/create")} type="button">
            <CreditCard size={18} /> Create Budget
          </button>

          <button className="dashboard-action-btn" onClick={() => navigate("/report")} type="button">
            <Calendar size={18} /> View Reports
          </button>
        </section>
      </div>
    </div>
  );
}
