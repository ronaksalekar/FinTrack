import { useMemo, useState } from "react";
import {
  IndianRupee,
  Calendar,
  Tag,
  FileText,
  WalletCards,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";
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

const PAYMENT_METHODS = ["cash", "card", "upi", "bank transfer", "other"];

const formatDate = (value) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value || "No date";

  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const toTitleCase = (value = "") =>
  value
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");

export default function TransactionForm() {
  const navigate = useNavigate();
  const {
    addData,
    data: existingTransactions,
    hasMore,
    loadMore,
    loading: dataLoading,
  } = useEncryptedData("transaction", { pageSize: 25 });

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    category: "",
    description: "",
    paymentMethod: "cash",
  });

  const incomeTotal = useMemo(
    () =>
      existingTransactions
        .filter((item) => item.type === "income")
        .reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [existingTransactions]
  );

  const expenseTotal = useMemo(
    () =>
      existingTransactions
        .filter((item) => item.type === "expense")
        .reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [existingTransactions]
  );

  const sortedTransactions = useMemo(
    () =>
      [...existingTransactions].sort(
        (a, b) =>
          new Date(b.date || b._timestamp || 0).getTime() -
          new Date(a.date || a._timestamp || 0).getTime()
      ),
    [existingTransactions]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "type" && { category: "" }),
    }));
  };

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
    <div className="txn-page">
      <div className="txn-shell">
        <header className="txn-header">
          <h1>Transactions</h1>
          <p className="txn-subtitle">Capture income and expenses with encrypted storage.</p>
        </header>

        <div className="txn-grid">
          <section className="txn-panel">
            <header className="txn-panel-head">
              <h2>Add transaction</h2>
            </header>

            <form className="txn-form" onSubmit={handleSubmit}>
              <div className="txn-field">
                <label>Type</label>
                <div className="txn-type-toggle">
                  {["expense", "income"].map((type) => (
                    <label
                      key={type}
                      className={formData.type === type ? "txn-type-chip active" : "txn-type-chip"}
                    >
                      <input
                        type="radio"
                        name="type"
                        value={type}
                        checked={formData.type === type}
                        onChange={handleChange}
                      />
                      {toTitleCase(type)}
                    </label>
                  ))}
                </div>
              </div>

              <div className="txn-field">
                <label htmlFor="txnAmount">
                  <IndianRupee size={14} /> Amount
                </label>
                <input
                  id="txnAmount"
                  className="txn-input"
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="txn-field">
                <label htmlFor="txnDate">
                  <Calendar size={14} /> Date
                </label>
                <input
                  id="txnDate"
                  className="txn-input"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="txn-field">
                <label htmlFor="txnCategory">
                  <Tag size={14} /> Category
                </label>
                <select
                  id="txnCategory"
                  className="txn-input"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select category</option>
                  {CATEGORIES[formData.type].map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="txn-field">
                <label htmlFor="txnPaymentMethod">
                  <WalletCards size={14} /> Payment method
                </label>
                <select
                  id="txnPaymentMethod"
                  className="txn-input"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {toTitleCase(method)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="txn-field">
                <label htmlFor="txnDescription">
                  <FileText size={14} /> Description
                </label>
                <textarea
                  id="txnDescription"
                  className="txn-input txn-textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Optional note about this transaction"
                />
              </div>

              <div className="txn-actions">
                <button type="submit" className="txn-btn-primary" disabled={loading}>
                  {loading ? "Encrypting and saving..." : "Add transaction"}
                </button>

                <button
                  type="button"
                  className="txn-btn-secondary"
                  onClick={() => navigate("/dashboard")}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>

          <section className="txn-panel">
            <header className="txn-panel-head">
              <h2>Recent activity</h2>
              <p>Quick view of your latest encrypted records.</p>
            </header>

            <div className="txn-stats">
              <article className="txn-stat-card income">
                <p className="txn-stat-label">Income</p>
                <p className="txn-stat-value">Rs. {incomeTotal.toFixed(2)}</p>
              </article>
              <article className="txn-stat-card expense">
                <p className="txn-stat-label">Expenses</p>
                <p className="txn-stat-value">Rs. {expenseTotal.toFixed(2)}</p>
              </article>
            </div>

            {sortedTransactions.length === 0 && !dataLoading ? (
              <p className="txn-empty">No transactions yet</p>
            ) : (
              <div className="txn-list">
                {sortedTransactions.map((transaction) => {
                  const isIncome = transaction.type === "income";
                  const Icon = isIncome ? ArrowUpCircle : ArrowDownCircle;

                  return (
                    <article className="txn-list-item" key={transaction._id}>
                      <div className="txn-list-head">
                        <div>
                          <p className="txn-category">{transaction.category || "Uncategorized"}</p>
                          <p className="txn-meta">
                            {formatDate(transaction.date || transaction._timestamp)} -{" "}
                            {toTitleCase(transaction.paymentMethod || "cash")}
                          </p>
                        </div>
                        <p className={isIncome ? "txn-amount income" : "txn-amount expense"}>
                          <Icon size={15} />
                          {isIncome ? "+" : "-"}Rs. {Number(transaction.amount || 0).toFixed(2)}
                        </p>
                      </div>

                      {transaction.description ? (
                        <p className="txn-description">{transaction.description}</p>
                      ) : (
                        <p className="txn-description muted">No description</p>
                      )}
                    </article>
                  );
                })}
              </div>
            )}

            {hasMore && (
              <div className="txn-load-more">
                <button className="txn-btn-secondary" type="button" onClick={loadMore}>
                  Load more transactions
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
