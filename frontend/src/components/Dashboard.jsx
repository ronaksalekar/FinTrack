import { useState } from "react";
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Bell,
  User,
  Settings,
} from "lucide-react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const navigate = useNavigate();
  const stats = {
    totalBalance: 12450.5,
    income: 8500,
    expenses: 3250.75,
    savings: 5199.25,
  };

  const recentTransactions = [
    {
      id: 1,
      name: "Grocery Shopping",
      category: "Food",
      amount: -85.5,
      date: "2026-01-17",
      type: "expense",
    },
    {
      id: 2,
      name: "Salary Deposit",
      category: "Income",
      amount: 5000,
      date: "2026-01-15",
      type: "income",
    },
    {
      id: 3,
      name: "Electric Bill",
      category: "Bills",
      amount: -120,
      date: "2026-01-14",
      type: "expense",
    },
  ];

  const budgets = [
    { category: "Food", spent: 450, total: 600, color: "blue" },
    { category: "Transport", spent: 180, total: 250, color: "green" },
    { category: "Entertainment", spent: 95, total: 150, color: "purple" },
    { category: "Shopping", spent: 320, total: 400, color: "pink" },
  ];

  const progress = (s, t) => Math.min((s / t) * 100, 100);

  return (
    <div className="dashboard">
      <div className="container">
        {/* Header */}
        <div className="header">
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">
            Welcome back! Here's your financial overview
          </p>
        </div>

        {/* Period Selector */}
        <div className="period">
          {["week", "month", "year"].map((p) => (
            <button
              key={p}
              className={selectedPeriod === p ? "active" : ""}
              onClick={() => setSelectedPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="stats">
          <div className="stat gradient">
            <Wallet />
            <h3>${stats.totalBalance.toLocaleString()}</h3>
            <span>Total Balance</span>
          </div>
          <div className="stat income">
            <TrendingUp />
            <h3>${stats.income.toLocaleString()}</h3>
            <span>Income</span>
          </div>
          <div className="stat expense">
            <TrendingDown />
            <h3>${stats.expenses.toLocaleString()}</h3>
            <span>Expenses</span>
          </div>
          <div className="stat savings">
            <IndianRupee />
            <h3>${stats.savings.toLocaleString()}</h3>
            <span>Savings</span>
          </div>
        </div>

        {/* Analysis */}
        <div className="analysis">
          <div className="card">
            <h3>Spending Trend</h3>
            <svg viewBox="0 0 400 200" className="chart">
              <polyline
                points="60,120 110,90 160,100 210,70 260,80 310,50 360,60"
                stroke="#22c55e"
                fill="none"
                strokeWidth="3"
              />
              <polyline
                points="60,140 110,150 160,130 210,145 260,120 310,130 360,115"
                stroke="#ef4444"
                fill="none"
                strokeWidth="3"
              />
            </svg>
          </div>

          <div className="card">
            <h3>Expense Breakdown</h3>
            <svg viewBox="0 0 200 200" className="pie">
              <circle cx="100" cy="100" r="80" fill="#3b82f6" />
              <circle cx="100" cy="100" r="50" fill="#fff" />
              <text x="100" y="110" textAnchor="middle">
                $3,251
              </text>
            </svg>
          </div>
        </div>

        {/* Content Grid */}
        <div className="content-grid">
          <div className="card trnasactions">
            <h3>Recent Transactions</h3>
            {recentTransactions.map((t) => (
              <div className="transaction-item" key={t.id}>
                <div className="transaction-info">
                  <span className="transaction-name">{t.name}</span>
                  <span className="transaction-date">
                    {t.date || new Date().toLocaleDateString()}
                  </span>
                </div>

                <span
                  className={
                    t.type === "income"
                      ? "transaction-amount income"
                      : "transaction-amount expense"
                  }
                >
                  {t.type === "income" ? "+" : "-"}$
                  {Math.abs(t.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="card budget">
            <h3>Budgets</h3>
            {budgets.map((b, i) => (
              <div className="budget" key={i}>
                <div className="budget-top">
                  <span>{b.category}</span>
                  <span>
                    ${b.spent}/{b.total}
                  </span>
                </div>
                <div className="bar">
                  <div
                    className={b.color}
                    style={{ width: `${progress(b.spent, b.total)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick">
          <button onClick={() => navigate("/transactions")}>
            <TrendingUp />
            Add Transaction
          </button>
          <button onClick={() => navigate("/budgets")}>
            <CreditCard />
            Create Budget
          </button>
          <button onClick={() => navigate("/reports")}>
            <Calendar />
            View Reports
          </button>
        </div>
      </div>
    </div>
  );
}
