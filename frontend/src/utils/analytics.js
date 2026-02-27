const PERIOD_VALUES = new Set(["week", "month", "year"]);

export const PERIOD_FILTERS = [
  { value: "year", label: "Year" },
  { value: "month", label: "Month" },
  { value: "week", label: "Weekly" },
];

export const PERIOD_LABELS = {
  week: "Weekly",
  month: "Month",
  year: "Year",
};

const pad = (num) => String(num).padStart(2, "0");

const toLocalDateKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const sanitizePeriod = (period) => (PERIOD_VALUES.has(period) ? period : "month");

const getDateFromItem = (item) => {
  const rawValue = item?.date || item?._timestamp;
  const parsedDate = new Date(rawValue);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const getPeriodStart = (period, now) => {
  const safePeriod = sanitizePeriod(period);

  if (safePeriod === "year") {
    return new Date(now.getFullYear(), 0, 1);
  }

  if (safePeriod === "week") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 6);
    return start;
  }

  return new Date(now.getFullYear(), now.getMonth(), 1);
};

export const filterTransactionsByPeriod = (transactions = [], period, now = new Date()) => {
  const safeNow = new Date(now);
  safeNow.setHours(23, 59, 59, 999);
  const start = getPeriodStart(period, safeNow);

  return transactions.filter((item) => {
    const date = getDateFromItem(item);
    return date && date >= start && date <= safeNow;
  });
};

const getSeriesSkeleton = (period, now) => {
  const safePeriod = sanitizePeriod(period);

  if (safePeriod === "year") {
    return Array.from({ length: 12 }, (_, monthIndex) => ({
      key: `${now.getFullYear()}-${pad(monthIndex + 1)}`,
      label: new Date(now.getFullYear(), monthIndex, 1).toLocaleDateString("en-US", {
        month: "short",
      }),
      income: 0,
      expense: 0,
    }));
  }

  if (safePeriod === "week") {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(now);
      date.setHours(0, 0, 0, 0);
      date.setDate(now.getDate() - (6 - index));
      return {
        key: toLocalDateKey(date),
        label: date.toLocaleDateString("en-US", { weekday: "short" }),
        income: 0,
        expense: 0,
      };
    });
  }

  const currentDay = now.getDate();
  return Array.from({ length: currentDay }, (_, index) => ({
    key: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(index + 1)}`,
    label: String(index + 1),
    income: 0,
    expense: 0,
  }));
};

export const buildIncomeExpenseSeries = (transactions = [], period, now = new Date()) => {
  const safePeriod = sanitizePeriod(period);
  const filtered = filterTransactionsByPeriod(transactions, safePeriod, now);
  const seed = getSeriesSkeleton(safePeriod, now);
  const byKey = new Map(seed.map((item) => [item.key, item]));

  filtered.forEach((transaction) => {
    const date = getDateFromItem(transaction);
    if (!date) return;

    const amount = Number(transaction.amount || 0);
    if (amount <= 0) return;

    const key =
      safePeriod === "year"
        ? `${date.getFullYear()}-${pad(date.getMonth() + 1)}`
        : toLocalDateKey(date);

    const bucket = byKey.get(key);
    if (!bucket) return;

    if (transaction.type === "income") bucket.income += amount;
    if (transaction.type === "expense") bucket.expense += amount;
  });

  return seed;
};

export const getCategoryBreakdown = (transactions = [], maxItems = 6) => {
  const expenseTotals = new Map();
  const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#22c55e", "#f59e0b", "#06b6d4"];

  transactions
    .filter((item) => item?.type === "expense")
    .forEach((item) => {
      const category = item.category || "Other";
      const amount = Number(item.amount || 0);
      if (amount <= 0) return;
      expenseTotals.set(category, (expenseTotals.get(category) || 0) + amount);
    });

  const sorted = [...expenseTotals.entries()]
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);

  const top = sorted.slice(0, maxItems).map((item, index) => ({
    ...item,
    color: colors[index % colors.length],
  }));

  const othersTotal = sorted.slice(maxItems).reduce((sum, item) => sum + item.amount, 0);
  const data = othersTotal > 0 ? [...top, { name: "Other", amount: othersTotal, color: "#64748b" }] : top;

  const grandTotal = data.reduce((sum, item) => sum + item.amount, 0);
  return data.map((item) => ({
    ...item,
    percentage: grandTotal > 0 ? Math.round((item.amount / grandTotal) * 100) : 0,
  }));
};
