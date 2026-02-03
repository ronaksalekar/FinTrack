import React, { useState } from "react";
import {
  Plus,
  IndianRupee,
  Calendar,
  Tag,
  Target,
  TrendingUp,
} from "lucide-react";
import "./BudgetForm.css";

export default function BudgetForm() {
  const [showForm, setShowForm] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    period: "monthly",
    startDate: "",
    endDate: "",
    notes: "",
  });
  const handleSubmit = () => {
    if (!formData.category || !formData.amount || !formData.startDate) return;

    setBudgets([
      ...budgets,
      {
        ...formData,
        id: Date.now(),
        amount: Number(formData.amount),
        spent: 0
      }
    ]);

    setFormData({
      category: "",
      amount: "",
      period: "monthly",
      startDate: "",
      endDate: "",
      notes: "",
    });
    setShowForm(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getProgressPercentage = (spent, total) => {
    Math.min((spent / total) * 100, 100);
  };

  return (
    <>
      <div className="budget-page">
        <div className="budget-container">
          <div className="budget-header">
            <h1>Budgets</h1>
            <button
              className="primary-btn"
              onClick={() => setShowForm(!showForm)}
            >
              <Plus size={18} /> Add Budget
            </button>
          </div>

          {showForm && (
            <div className="card">
              <h2>Add Budget</h2>

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
                  <option value="food">Food</option>
                  <option value="transport">Transport</option>
                  <option value="shopping">Shopping</option>
                  <option value="bills">Bills</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="groceries">Groceries</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="other">Other</option>
                </select>
              </div>

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

              <div className="form-group">
                <label>
                  <Calendar size={14} /> End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </div>

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

              <div className="btn-group">
                <button className="primary-btn" onClick={handleSubmit}>
                  Add
                </button>
                <button
                  className="secondary-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="card">
            <h2>Active Budgets</h2>

            {budgets.length === 0 ? (
              <p className="empty">No budgets yet</p>
            ) : (
              budgets.map((b) => {
                const progress = getProgressPercentage(b.spent, b.amount);
                const remaining = b.amount - b.spent;

                return (
                  <div className="budget-item" key={b.id}>
                    <div className="budget-top">
                      <div>
                        <p className="category">{b.category}</p>
                        <p className="period">
                          {b.period} • {b.startDate}
                        </p>
                        {b.notes && <p className="notes">{b.notes}</p>}
                      </div>
                      <div className="total">
                        ₹{Number(b.amount).toFixed(2)}
                      </div>
                    </div>

                    <div className="progress-info">
                      <span>Spent: ₹{b.spent}</span>
                      <span className={remaining >= 0 ? "green" : "red"}>
                        Remaining: ₹{remaining}
                      </span>
                    </div>

                    <div className="progress-bar">
                      <div style={{ width: `${progress}%` }} />
                    </div>

                    <p className="progress-text">{progress}% used</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
