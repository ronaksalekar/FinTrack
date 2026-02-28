import { useMemo, useState } from "react";
import { IndianRupee, Calendar, Tag, TrendingUp, Target, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEncryptedData } from "../../../hooks/useEncryptedData";
import toast from "react-hot-toast";
import "./BudgetForm.css";

const CATEGORIES = [
  "Groceries",
  "Rent",
  "Utilities",
  "Transportation",
  "Entertainment",
  "Healthcare",
  "Education",
  "Shopping",
  "Dining",
  "Savings",
  "Other",
];

const PERIODS = ["weekly", "monthly", "yearly"];

const toTitleCase = (value = "") => (value ? value[0].toUpperCase() + value.slice(1) : "");

const formatDate = (value) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value || "No date";

  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function BudgetForm() {
  const navigate = useNavigate();
  const { addData, data: existingBudgets, hasMore, loadMore, loading: dataLoading } = useEncryptedData(
    "budget",
    { pageSize: 25 }
  );

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    period: "monthly",
    startDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const totalBudgeted = useMemo(
    () => existingBudgets.reduce((sum, budget) => sum + Number(budget.limit || 0), 0),
    [existingBudgets]
  );

  const categoryCount = useMemo(
    () => new Set(existingBudgets.map((budget) => budget.category).filter(Boolean)).size,
    [existingBudgets]
  );

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.category || !formData.amount) {
      toast.error("Please fill required fields");
      setLoading(false);
      return;
    }

    if (Number(formData.amount) <= 0) {
      toast.error("Budget amount must be greater than 0");
      setLoading(false);
      return;
    }

    const exists = existingBudgets.some(
      (budget) => budget.category === formData.category && budget.period === formData.period
    );

    if (exists) {
      toast.error(`A ${formData.period} budget for ${formData.category} already exists`);
      setLoading(false);
      return;
    }

    const budgetData = {
      category: formData.category,
      limit: parseFloat(formData.amount),
      period: formData.period,
      startDate: formData.startDate,
      notes: formData.notes,
      createdAt: new Date().toISOString(),
    };

    const result = await addData(budgetData);

    if (result) {
      toast.success("Budget created successfully!");
      navigate("/dashboard");
    }

    setLoading(false);
  };

  return (
    <div className="budget-page">
      <div className="budget-shell">
        <header className="budget-header">
          <h1>Budgets</h1>
          <p className="budget-subtitle">
            Create category limits and keep your monthly spending under control.
          </p>
        </header>

        <div className="budget-grid">
          <section className="budget-panel">
            <header className="budget-panel-head">
              <h2>Create budget</h2>
            </header>

            <form className="budget-form" onSubmit={handleSubmit}>
              <div className="budget-field">
                <label htmlFor="budgetCategory">
                  <Tag size={14} /> Category
                </label>
                <select
                  id="budgetCategory"
                  className="budget-input"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="budget-field">
                <label htmlFor="budgetAmount">
                  <IndianRupee size={14} /> Budget amount
                </label>
                <input
                  id="budgetAmount"
                  className="budget-input"
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="budget-field">
                <label>
                  <TrendingUp size={14} /> Period
                </label>
                <div className="budget-period-options">
                  {PERIODS.map((period) => (
                    <label
                      key={period}
                      className={
                        formData.period === period ? "budget-period-chip active" : "budget-period-chip"
                      }
                    >
                      <input
                        type="radio"
                        name="period"
                        value={period}
                        checked={formData.period === period}
                        onChange={handleChange}
                      />
                      {toTitleCase(period)}
                    </label>
                  ))}
                </div>
              </div>

              <div className="budget-field">
                <label htmlFor="budgetStartDate">
                  <Calendar size={14} /> Start date
                </label>
                <input
                  id="budgetStartDate"
                  className="budget-input"
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </div>

              <div className="budget-field">
                <label htmlFor="budgetNotes">
                  <Target size={14} /> Notes
                </label>
                <textarea
                  id="budgetNotes"
                  className="budget-input budget-textarea"
                  rows="3"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Optional goal or reminder"
                />
              </div>

              <div className="budget-actions">
                <button className="budget-btn-primary" type="submit" disabled={loading}>
                  {loading ? "Encrypting and saving..." : "Add budget"}
                </button>

                <button
                  className="budget-btn-secondary"
                  type="button"
                  onClick={() => navigate("/dashboard")}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>

          <section className="budget-panel">
            <header className="budget-panel-head">
              <h2>Active budgets</h2>
              <p>View every saved limit and category assignment.</p>
            </header>

            <div className="budget-stats">
              <article className="budget-stat-card">
                <p className="budget-stat-label">Total budgets</p>
                <p className="budget-stat-value">{existingBudgets.length}</p>
              </article>
              <article className="budget-stat-card">
                <p className="budget-stat-label">Tracked categories</p>
                <p className="budget-stat-value">{categoryCount}</p>
              </article>
              <article className="budget-stat-card budget-stat-wide">
                <p className="budget-stat-label">Total allocated</p>
                <p className="budget-stat-value">Rs. {totalBudgeted.toFixed(2)}</p>
              </article>
            </div>

            {existingBudgets.length === 0 && !dataLoading ? (
              <p className="budget-empty">No budgets yet</p>
            ) : (
              <div className="budget-list">
                {existingBudgets.map((budget) => (
                  <article className="budget-list-item" key={budget._id}>
                    <div className="budget-list-head">
                      <div>
                        <p className="budget-category">{budget.category || "Uncategorized"}</p>
                        <p className="budget-meta">
                          {toTitleCase(budget.period || "monthly")} - {formatDate(budget.startDate)}
                        </p>
                      </div>
                      <p className="budget-amount">Rs. {Number(budget.limit || 0).toFixed(2)}</p>
                    </div>

                    {budget.notes ? (
                      <p className="budget-notes">{budget.notes}</p>
                    ) : (
                      <p className="budget-notes muted">No notes</p>
                    )}

                    <div className="budget-tag-row">
                      <span className="budget-tag">
                        <Layers size={13} /> {toTitleCase(budget.period || "monthly")}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {hasMore && (
              <div className="budget-load-more">
                <button className="budget-btn-secondary" type="button" onClick={loadMore}>
                  Load more budgets
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
