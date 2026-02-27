import { useState } from "react";
import {
  IndianRupee,
  Calendar,
  Tag,
  TrendingUp,
  Target,
} from "lucide-react";
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

  // Handle input change
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Submit Budget (Encrypted)
  const handleSubmit = async () => {
    setLoading(true);

    if (!formData.category || !formData.amount) {
      toast.error("Please fill required fields");
      setLoading(false);
      return;
    }

    // Prevent duplicate budgets
    const exists = existingBudgets.some(
      (b) => b.category === formData.category && b.period === formData.period
    );

    if (exists) {
      toast.error(
        `A ${formData.period} budget for ${formData.category} already exists`
      );
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
      <div className="budget-container">
        {/* Header */}
        <div className="budget-header">
          <h1>Budgets</h1>
        </div>

        {/* FORM CARD */}
        <div className="card">
          <h2>Add Budget</h2>

          {/* CATEGORY */}
          <div className="form-group">
            <label>
              <Tag size={14} /> Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">Select category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* AMOUNT */}
          <div className="form-group">
            <label>
              <IndianRupee size={14} /> Budget Amount
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
            />
          </div>

          {/* PERIOD */}
          <div className="form-group">
            <label>
              <TrendingUp size={14} /> Period
            </label>

            <div className="radio-group">
              {["weekly", "monthly", "yearly"].map((p) => (
                <label key={p}>
                  <input
                    type="radio"
                    name="period"
                    value={p}
                    checked={formData.period === p}
                    onChange={handleChange}
                  />
                  {p}
                </label>
              ))}
            </div>
          </div>

          {/* START DATE */}
          <div className="form-group">
            <label>
              <Calendar size={14} /> Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
            />
          </div>

          {/* NOTES */}
          <div className="form-group">
            <label>
              <Target size={14} /> Notes
            </label>
            <textarea
              rows="3"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          {/* ACTIONS */}
          <div className="btn-group">
            <button
              className="primary-btn"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Encrypting & Saving..." : "Add Budget"}
            </button>

            <button
              className="secondary-btn"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </button>
          </div>
        </div>

        {/* EXISTING BUDGETS */}
        <div className="card">
          <h2>Active Budgets</h2>

          {existingBudgets.length === 0 && !dataLoading ? (
            <p className="empty">No budgets yet</p>
          ) : (
            existingBudgets.map((b) => (
              <div className="budget-item" key={b._id}>
                <div className="budget-top">
                  <div>
                    <p className="category">{b.category}</p>
                    <p className="period">
                      {b.period} • {b.startDate}
                    </p>
                  </div>
                  <div className="total">
                    ₹{Number(b.limit).toFixed(2)}
                  </div>
                </div>
              </div>
            ))
          )}

          {hasMore && (
            <div className="btn-group">
              <button className="secondary-btn" type="button" onClick={loadMore}>
                Load More Budgets
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
