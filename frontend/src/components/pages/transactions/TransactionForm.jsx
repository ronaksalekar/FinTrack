import { useState } from "react";
import { IndianRupee, Calendar, Tag, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEncryptedData } from "../../../hooks/useEncryptedData";
import toast from "react-hot-toast";
import "./TransactionForm.css";

const CATEGORIES = {
  income: ["Salary", "Freelance", "Investment", "Gift", "Other Income"],
  expense: [
    "Groceries",
    "Rent",
    "Utilities",
    "Transportation",
    "Entertainment",
    "Healthcare",
    "Education",
    "Shopping",
    "Dining",
    "Other Expense",
  ],
};

export default function TransactionForm() {
  const navigate = useNavigate();
  const { addData } = useEncryptedData("transaction");

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    category: "",
    description: "",
    paymentMethod: "cash",
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "type" && { category: "" }),
    }));
  };

  // Submit form (Encrypted Save)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.amount || !formData.category) {
      toast.error("Please fill required fields");
      setLoading(false);
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      toast.error("Amount must be greater than 0");
      setLoading(false);
      return;
    }

    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount),
    };

    const result = await addData(transactionData);

    if (result) {
      toast.success("Transaction added successfully!");
      navigate("/dashboard");
    }

    setLoading(false);
  };

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div className="header">
          <h1>Transactions</h1>
        </div>

        {/* FORM CARD */}
        <form className="card" onSubmit={handleSubmit}>
          <h2>Add Transaction</h2>

          {/* TYPE */}
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

          {/* AMOUNT */}
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
              min="0"
              step="0.01"
            />
          </div>

          {/* DATE */}
          <div className="form-group">
            <label>
              <Calendar size={14} /> <strong>Date</strong>
            </label>

            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* CATEGORY */}
          <div className="form-group">
            <label>
              <Tag size={14} /> <strong>Category</strong>
            </label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">Select category</option>

              {CATEGORIES[formData.type].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* DESCRIPTION */}
          <div className="form-group">
            <label>
              <FileText size={14} /> <strong>Description</strong>
            </label>

            <textarea
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* ACTION BUTTONS */}
          <div className="btn-group">
            <button
              type="submit"
              className="primary-btn"
              disabled={loading}
            >
              {loading ? "Encrypting & Saving..." : "Add Transaction"}
            </button>

            <button
              type="button"
              className="secondary-btn"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
