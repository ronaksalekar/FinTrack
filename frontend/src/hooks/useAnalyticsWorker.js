import { useEffect, useMemo, useState } from "react";
import {
  buildIncomeExpenseSeries,
  filterTransactionsByPeriod,
  getCategoryBreakdown,
} from "../utils/analytics";

const SHOULD_USE_WORKERS = process.env.NODE_ENV === "production";

const EMPTY_RESULT = {
  filteredTransactions: [],
  trendData: [],
  categoryBreakdown: [],
};

export function useAnalyticsWorker(transactions = [], period = "month") {
  const [analytics, setAnalytics] = useState(EMPTY_RESULT);
  const [loading, setLoading] = useState(false);

  const syncFallback = useMemo(
    () => ({
      filteredTransactions: filterTransactionsByPeriod(transactions, period),
      trendData: buildIncomeExpenseSeries(transactions, period),
      categoryBreakdown: getCategoryBreakdown(
        filterTransactionsByPeriod(transactions, period)
      ),
    }),
    [period, transactions]
  );

  useEffect(() => {
    if (!transactions.length) {
      setAnalytics(EMPTY_RESULT);
      setLoading(false);
      return;
    }

    if (!SHOULD_USE_WORKERS || typeof Worker === "undefined") {
      setAnalytics(syncFallback);
      setLoading(false);
      return;
    }

    setLoading(true);
    let isCanceled = false;
    let worker;

    try {
      worker = new Worker(new URL("../workers/analyticsWorker.js", import.meta.url));
      worker.onmessage = (event) => {
        if (isCanceled) return;
        setAnalytics(event.data || EMPTY_RESULT);
        setLoading(false);
      };
      worker.onerror = () => {
        if (isCanceled) return;
        setAnalytics(syncFallback);
        setLoading(false);
      };
      worker.postMessage({ transactions, period });
    } catch {
      setAnalytics(syncFallback);
      setLoading(false);
    }

    return () => {
      isCanceled = true;
      if (worker) worker.terminate();
    };
  }, [period, syncFallback, transactions]);

  return {
    filteredTransactions: analytics.filteredTransactions || [],
    trendData: analytics.trendData || [],
    categoryBreakdown: analytics.categoryBreakdown || [],
    analyticsLoading: loading,
  };
}
