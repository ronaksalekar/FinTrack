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
import {
  PERIOD_FILTERS,
  PERIOD_LABELS,
} from "../utils/analytics";
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

  const {
    filteredTransactions,
    trendData,
    categoryBreakdown,
    analyticsLoading,
  } = useAnalyticsWorker(transactions, selectedPeriod);

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
        .slice(0, 5)
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
      budgets.map((budget, index) => {
        const spent = Number(budgetsByCategory[budget.category] || 0);
        const total = Number(budget.limit || 0);
        const usage = total > 0 ? (spent / total) * 100 : 0;
        const roundedUsage = Math.round(usage);
        const remaining = total - spent;

        let statusLabel = "On Track";
        let statusClass = "status-good";
        let barClass = "bar-good";

        if (usage > 100) {
          statusLabel = "Over Budget";
          statusClass = "status-danger";
          barClass = "bar-danger";
        } else if (usage >= 80) {
          statusLabel = "Near Limit";
          statusClass = "status-warn";
          barClass = "bar-warn";
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
      }).sort((a, b) => b.usage - a.usage),
    [budgets, budgetsByCategory]
  );

  const overBudgetCount = formattedBudgets.filter((item) => item.remaining < 0).length;

  if (isInitialLoading) {
    return (
      <div className="dashboard">
        <div className="dashboard-container">
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
    <div className="dashboard">
      <div className="dashboard-container">
        <div className="header">
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">
            Showing {PERIOD_LABELS[selectedPeriod]} performance
          </p>
          {analyticsLoading && <span className="updating-tag">Updating analytics...</span>}
        </div>

        <div className="period">
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

        <div className="stats">
          <div className="stat gradient">
            <Wallet />
            <h3>{formatCurrency(stats.totalBalance)}</h3>
            <span>Total Balance</span>
          </div>

          <div className="stat income">
            <TrendingUp />
            <h3>{formatCurrency(stats.income)}</h3>
            <span>Income</span>
          </div>

          <div className="stat expense">
            <TrendingDown />
            <h3>{formatCurrency(stats.expenses)}</h3>
            <span>Expenses</span>
          </div>

          <div className="stat savings">
            <IndianRupee />
            <h3>{formatCurrency(stats.savings)}</h3>
            <span>Savings</span>
          </div>
        </div>

        <div className="analysis">
          <div className="card">
            <h3>Income vs Expense Trend</h3>
            <p className="chart-tag">{PERIOD_LABELS[selectedPeriod]}</p>
            {hasTrendData ? (
              <div className="chart">
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
              <p className="empty">No transactions in this period</p>
            )}
          </div>

          <div className="card">
            <h3>Expense Breakdown</h3>
            <p className="chart-tag">By category</p>
            {categoryBreakdown.length > 0 ? (
              <div className="pie">
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
              <p className="empty">No expense data in this period</p>
            )}
          </div>
        </div>

        <div className="content-grid">
          <div className="card">
            <h3>Recent Transactions</h3>

            {recentTransactions.length > 0 ? (
              recentTransactions.map((item) => (
                <div className="transaction-item" key={item.id}>
                  <div className="transaction-info">
                    <span className="transaction-name">{item.name}</span>
                    <span className="transaction-date">{item.date}</span>
                  </div>

                  <span
                    className={`transaction-amount ${item.type === "income" ? "income" : "expense"}`}
                  >
                    {item.type === "income" ? "+" : "-"}
                    {formatCurrency(Math.abs(item.amount))}
                  </span>
                </div>
              ))
            ) : (
              <p className="empty">No transactions in this period</p>
            )}
          </div>

          <div className="card">
            <h3>Spending vs Budget</h3>
            {formattedBudgets.length > 0 && (
              <p className="budget-summary">
                {overBudgetCount} of {formattedBudgets.length} budgets over limit
              </p>
            )}

            {formattedBudgets.length > 0 ? (
              formattedBudgets.map((item) => (
                <div className="budget" key={item.category}>
                  <div className="budget-top">
                    <div>
                      <span className="budget-category">{item.category}</span>
                      <p className="budget-meta">
                        {formatCurrency(item.spent)} spent of {formatCurrency(item.total)}
                      </p>
                    </div>
                    <span className={`budget-status ${item.statusClass}`}>{item.statusLabel}</span>
                  </div>

                  <div className="bar">
                    <div className={item.barClass} style={{ width: `${item.progress}%` }} />
                  </div>

                  <div className="budget-foot">
                    <span>{item.usage}% used</span>
                    <span className={item.remaining < 0 ? "budget-over" : "budget-left"}>
                      {item.remaining < 0
                        ? `${formatCurrency(Math.abs(item.remaining))} over`
                        : `${formatCurrency(item.remaining)} left`}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty">No budgets created yet</p>
            )}
          </div>
        </div>

        <div className="quick">
          <button onClick={() => navigate("/transactions/add")} type="button">
            <TrendingUp /> Add Transaction
          </button>

          <button onClick={() => navigate("/budgets/create")} type="button">
            <CreditCard /> Create Budget
          </button>

          <button onClick={() => navigate("/report")} type="button">
            <Calendar /> View Reports
          </button>
        </div>
      </div>
    </div>
  );
}
