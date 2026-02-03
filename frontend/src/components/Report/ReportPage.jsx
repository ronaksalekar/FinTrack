import { useState } from "react";
import {
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  PieChart,
  BarChart3,
  Filter
} from "lucide-react";
import "./ReportPage.css";

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const monthlyData = [
    { month: "Jan", income: 4500, expenses: 2800 },
    { month: "Feb", income: 5200, expenses: 3100 },
    { month: "Mar", income: 4800, expenses: 2900 },
    { month: "Apr", income: 5500, expenses: 3400 },
    { month: "May", income: 6000, expenses: 3200 },
    { month: "Jun", income: 5800, expenses: 3600 }
  ];

  const categoryBreakdown = [
    { category: "Food & Dining", amount: 1250, percentage: 35, color: "#3b82f6" },
    { category: "Transportation", amount: 890, percentage: 25, color: "#8b5cf6" },
    { category: "Bills & Utilities", amount: 710, percentage: 20, color: "#ec4899" },
    { category: "Entertainment", amount: 400, percentage: 11, color: "#22c55e" },
    { category: "Shopping", amount: 180, percentage: 5, color: "#f59e0b" },
    { category: "Other", amount: 140, percentage: 4, color: "#6b7280" }
  ];

  const topExpenses = [
    { name: "Whole Foods Market", category: "Food", amount: 185.5, date: "2026-01-15" },
    { name: "Shell Gas Station", category: "Transport", amount: 65, date: "2026-01-14" },
    { name: "Amazon Purchase", category: "Shopping", amount: 120.99, date: "2026-01-13" },
    { name: "Electric Bill", category: "Bills", amount: 110, date: "2026-01-10" },
    { name: "Restaurant Dinner", category: "Food", amount: 95.75, date: "2026-01-08" }
  ];

  const maxAmount = Math.max(...monthlyData.map(d => Math.max(d.income, d.expenses)));

  return (
    <div className="reports">
      <div className="reports-header">
        <div>
          <h1>Reports</h1>
          <p>Analyze your financial performance</p>
        </div>
        <button className="export-btn">
          <Download size={18} />
          Export Report
        </button>
      </div>

      <div className="reports-container">
        <div className="filters">
          <div>
            <label><Calendar size={14} /> Time Period</label>
            <div className="period-buttons">
              {["week", "month", "year"].map(p => (
                <button
                  key={p}
                  className={selectedPeriod === p ? "active" : ""}
                  onClick={() => setSelectedPeriod(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label><Filter size={14} /> Category</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="food">Food & Dining</option>
              <option value="transport">Transportation</option>
              <option value="bills">Bills & Utilities</option>
              <option value="entertainment">Entertainment</option>
              <option value="shopping">Shopping</option>
            </select>
          </div>
        </div>

        <div className="summary">
          <div className="stat gradient">
            <TrendingUp  />
            <h3>$31,800</h3>
            <span>Total Income</span>
          </div>
          <div className="stat expense">
            <TrendingDown />
            <h3>$19,000</h3>
            <span>Total Expenses</span>
          </div>
          <div className="stat income">
            <IndianRupee />
            <h3>$12,800</h3>
            <span>Net Savings</span>
          </div>
          <div className="stat daily">
            <BarChart3  />
            <h3>$108.57</h3>
            <span>Average Daily Spending</span>
          </div>
        </div>

        <div className="charts">
          <div className="card wide">
            <h3>Income vs Expenses</h3>
            <svg viewBox="0 0 600 250" className="bar-chart">
              {monthlyData.map((d, i) => {
                const x = 80 + i * 85;
                const ih = (d.income / maxAmount) * 150;
                const eh = (d.expenses / maxAmount) * 150;
                return (
                  <g key={i}>
                    <rect x={x} y={210 - ih} width="30" height={ih} fill="#22c55e" rx="4" />
                    <rect x={x + 35} y={210 - eh} width="30" height={eh} fill="#ef4444" rx="4" />
                    <text x={x + 32} y="235" textAnchor="middle">{d.month}</text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="card">
            <h3>Category Breakdown</h3>
            <svg viewBox="0 0 200 200" className="pie-chart">
              {categoryBreakdown.reduce((acc, cat, i) => {
                const start = acc.angle;
                const end = start + (cat.percentage / 100) * 360;
                acc.angle = end;
                const sr = (start - 90) * Math.PI / 180;
                const er = (end - 90) * Math.PI / 180;
                const x1 = 100 + 80 * Math.cos(sr);
                const y1 = 100 + 80 * Math.sin(sr);
                const x2 = 100 + 80 * Math.cos(er);
                const y2 = 100 + 80 * Math.sin(er);
                acc.paths.push(
                  <path
                    key={i}
                    d={`M100 100 L${x1} ${y1} A80 80 0 ${cat.percentage > 50 ? 1 : 0} 1 ${x2} ${y2} Z`}
                    fill={cat.color}
                  />
                );
                return acc;
              }, { angle: 0, paths: [] }).paths}
              <circle cx="100" cy="100" r="50" fill="#fff" />
            </svg>
          </div>
        </div>

        <div className="card">
          <h3>Top Expenses</h3>
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
              {topExpenses.map((e, i) => (
                <tr key={i}>
                  <td>{e.name}</td>
                  <td>{e.category}</td>
                  <td>{e.date}</td>
                  <td className="right red">${e.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="insights">
          <div className="info blue">
            <h4>Spending Insight</h4>
            <p>You're spending 35% more on Food & Dining compared to last month.</p>
          </div>
          <div className="info green">
            <h4>Savings Goal</h4>
            <p>You're on track to save $2,500 this month.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
