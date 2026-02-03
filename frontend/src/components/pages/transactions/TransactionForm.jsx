import React, { useState } from "react";
import { Plus,IndianRupee, Calendar, Tag, FileText } from "lucide-react";
import "./TransactionForm.css";

export default function TransactionForm() {
  const [showForm, setShowForm] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({
    amount: "",
    date: "",
    category: "",
    type: "",
    discription: "",
  });

  const handleSubmit = () => {
    if (!formData.amount || !formData.date || !formData.category) return;

    setTransactions([...transactions, { ...formData, id: Date.now() }]);
    setFormData({
      amount: "",
      date: "",
      category: "",
      type: "expense",
      discription: "",
    });
    setShowForm(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <div className="page">
        <div className="container">
          <div className="header">
            <h1>Transanctions</h1>
            <button
              className="primary-btn"
              onClick={() => setShowForm(!showForm)}
            >
              <Plus size={18} /> Add Transaction
            </button>
          </div>

          {showForm && (
            <div className="card">
              <h2>Add Transactions</h2>
              <div className="form-group">
                <label><h4>Type</h4></label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="type"
                      value="expense"
                      checked={formData.type === "expense"}
                      onChange={handleChange}
                    />
                    Expense
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="type"
                      value="income"
                      checked={formData.type === "income"}
                      onChange={handleChange}
                    />
                    Income
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>
                  <IndianRupee size={14} /> <strong>Amount</strong>
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
                  <Calendar size={14} /><strong> Date</strong>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>
                  {" "}
                  <Tag size={14} /> <strong>Category</strong>
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
                  <option value="salary">Salary</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>
                  {" "}
                  <FileText size={14} /> <strong>Discription</strong>
                </label>
                <textarea
                  rows={3}
                  name="discription"
                  value={formData.discription}
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
            <h2>Recent Transactions</h2>

            {transactions.length === 0 ? (
              <p className="empty">No transactions yet</p>
            ) : (
              transactions.map((t) => (
                <div className="transaction" key={t.id}>
                  <div>
                    <p className="category">{t.category}</p>
                    <p className="date">{t.date}</p>
                    {t.description && <p className="desc">{t.description}</p>}
                  </div>
                  <div className={`amount ${t.type}`}>
                    {t.type === "income" ? "+" : "-"}₹
                    {Number(t.amount).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
