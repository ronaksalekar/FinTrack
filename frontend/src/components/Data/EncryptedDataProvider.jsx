import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../Auth/AuthContext";
import { encryptData, decryptData } from "../../utils/encryption";
import { API_BASE_URL } from "../../config/api";

const API_URL = `${API_BASE_URL}/api/data`;
const DEFAULT_LIMIT = 50;
const SHOULD_USE_WORKERS = process.env.NODE_ENV === "production";

const INITIAL_ENTRY = {
  data: [],
  loading: false,
  error: null,
  hasMore: true,
  skip: 0,
  initialized: false,
};

const EncryptedDataContext = createContext(null);

const dedupeById = (items = []) => {
  const seen = new Set();
  const output = [];

  items.forEach((item) => {
    if (!item?._id || seen.has(item._id)) return;
    seen.add(item._id);
    output.push(item);
  });

  return output;
};

export function EncryptedDataProvider({ children }) {
  const { encryptionKey, getAuthHeader, isAuthenticated } = useAuth();
  const [store, setStore] = useState({});
  const storeRef = useRef(store);
  const workerRef = useRef(null);

  useEffect(() => {
    storeRef.current = store;
  }, [store]);

  useEffect(() => {
    if (
      !SHOULD_USE_WORKERS ||
      typeof window === "undefined" ||
      typeof Worker === "undefined"
    ) {
      return;
    }

    try {
      workerRef.current = new Worker(new URL("../../workers/decryptWorker.js", import.meta.url));
      workerRef.current.onerror = () => {
        if (workerRef.current) {
          workerRef.current.terminate();
          workerRef.current = null;
        }
      };
    } catch {
      workerRef.current = null;
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setStore({});
    }
  }, [isAuthenticated]);

  const getCandidateKeys = useCallback(() => {
    const altKey = localStorage.getItem("encKeyAlt");
    return [...new Set([encryptionKey, altKey].filter(Boolean))];
  }, [encryptionKey]);

  const decryptRowsWithWorker = useCallback((encryptedRows, candidateKeys) => {
    if (!workerRef.current) return null;

    return new Promise((resolve, reject) => {
      const worker = workerRef.current;

      const handleMessage = (event) => {
        worker.removeEventListener("message", handleMessage);
        worker.removeEventListener("error", handleError);
        resolve(event.data?.decrypted || []);
      };

      const handleError = (error) => {
        worker.removeEventListener("message", handleMessage);
        worker.removeEventListener("error", handleError);
        reject(error);
      };

      worker.addEventListener("message", handleMessage);
      worker.addEventListener("error", handleError);
      worker.postMessage({ encryptedRows, candidateKeys });
    });
  }, []);

  const decryptRowsFallback = useCallback((encryptedRows, candidateKeys) => {
    return encryptedRows
      .map((item) => {
        for (const key of candidateKeys) {
          try {
            const parsed = decryptData(item.encryptedData, key);
            return {
              ...parsed,
              _id: item._id,
              _timestamp: item.encryptedTimestamp,
            };
          } catch {
            // Try next key.
          }
        }

        return {
          _id: item._id,
          _corrupted: true,
        };
      })
      .filter(Boolean);
  }, []);

  const decryptRows = useCallback(
    async (encryptedRows, candidateKeys) => {
      try {
        const workerResult = await decryptRowsWithWorker(encryptedRows, candidateKeys);
        if (workerResult) return workerResult;
      } catch {
        // Fall through to main-thread decrypt.
      }

      return decryptRowsFallback(encryptedRows, candidateKeys);
    },
    [decryptRowsFallback, decryptRowsWithWorker]
  );

  const getEntry = useCallback((dataType) => {
    return storeRef.current[dataType] || { ...INITIAL_ENTRY };
  }, []);

  const setEntry = useCallback((dataType, updater) => {
    setStore((prev) => {
      const current = prev[dataType] || { ...INITIAL_ENTRY };
      const nextEntry = typeof updater === "function" ? updater(current) : updater;
      return {
        ...prev,
        [dataType]: nextEntry,
      };
    });
  }, []);

  const fetchPage = useCallback(
    async (dataType, { reset = false, limit = DEFAULT_LIMIT } = {}) => {
      const candidateKeys = getCandidateKeys();
      if (!isAuthenticated || candidateKeys.length === 0) {
        setEntry(dataType, { ...INITIAL_ENTRY, initialized: true });
        return [];
      }

      const current = getEntry(dataType);
      const skip = reset ? 0 : current.skip;

      setEntry(dataType, (entry) => ({
        ...entry,
        loading: true,
        error: null,
      }));

      try {
        const res = await axios.get(API_URL, {
          params: { dataType, limit, skip },
          headers: getAuthHeader(),
        });

        const encryptedRows = Array.isArray(res.data?.data) ? res.data.data : [];
        const decrypted = await decryptRows(encryptedRows, candidateKeys);

        setEntry(dataType, (entry) => {
          const baseData = reset ? [] : entry.data;
          const merged = dedupeById([...baseData, ...decrypted]);
          return {
            ...entry,
            data: merged,
            loading: false,
            error: null,
            initialized: true,
            skip: reset ? encryptedRows.length : entry.skip + encryptedRows.length,
            hasMore: encryptedRows.length === limit,
          };
        });

        return decrypted;
      } catch (error) {
        setEntry(dataType, (entry) => ({
          ...entry,
          loading: false,
          initialized: true,
          error: error.message,
        }));
        toast.error(error.response?.data?.message || "Failed to fetch data");
        return [];
      }
    },
    [decryptRows, getAuthHeader, getCandidateKeys, getEntry, isAuthenticated, setEntry]
  );

  const ensureData = useCallback(
    async (dataType, { limit = DEFAULT_LIMIT } = {}) => {
      const entry = getEntry(dataType);
      if (entry.initialized || entry.loading) return entry.data;
      return fetchPage(dataType, { reset: true, limit });
    },
    [fetchPage, getEntry]
  );

  const refreshData = useCallback(
    async (dataType, { limit = DEFAULT_LIMIT } = {}) => {
      return fetchPage(dataType, { reset: true, limit });
    },
    [fetchPage]
  );

  const loadMoreData = useCallback(
    async (dataType, { limit = DEFAULT_LIMIT } = {}) => {
      const entry = getEntry(dataType);
      if (entry.loading || !entry.hasMore) return [];
      return fetchPage(dataType, { reset: false, limit });
    },
    [fetchPage, getEntry]
  );

  const loadAllData = useCallback(
    async (dataType, { limit = 200 } = {}) => {
      await ensureData(dataType, { limit });

      let entry = getEntry(dataType);
      while (entry.hasMore && !entry.loading) {
        // eslint-disable-next-line no-await-in-loop
        await loadMoreData(dataType, { limit });
        entry = getEntry(dataType);
      }
    },
    [ensureData, getEntry, loadMoreData]
  );

  const addData = useCallback(
    async (dataType, newData) => {
      if (!encryptionKey) {
        toast.error("Encryption key missing");
        return null;
      }

      try {
        const encrypted = encryptData(newData, encryptionKey);
        const res = await axios.post(
          API_URL,
          {
            dataType,
            encryptedData: encrypted,
            encryptedTimestamp: newData.date || new Date().toISOString(),
          },
          { headers: getAuthHeader() }
        );

        const newItem = {
          ...newData,
          _id: res.data.data._id,
          _timestamp: res.data.data.encryptedTimestamp,
        };

        setEntry(dataType, (entry) => ({
          ...entry,
          data: dedupeById([newItem, ...entry.data]),
          skip: entry.skip + 1,
          initialized: true,
        }));

        toast.success("Data saved");
        return newItem;
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to save data");
        return null;
      }
    },
    [encryptionKey, getAuthHeader, setEntry]
  );

  const updateData = useCallback(
    async (dataType, id, updatedData) => {
      if (!encryptionKey) return false;

      try {
        const encrypted = encryptData(updatedData, encryptionKey);
        await axios.put(
          `${API_URL}/${id}`,
          {
            encryptedData: encrypted,
            encryptedTimestamp: updatedData.date || new Date().toISOString(),
          },
          { headers: getAuthHeader() }
        );

        setEntry(dataType, (entry) => ({
          ...entry,
          data: entry.data.map((item) =>
            item._id === id
              ? { ...updatedData, _id: id, _timestamp: item._timestamp }
              : item
          ),
        }));

        toast.success("Updated");
        return true;
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to update");
        return false;
      }
    },
    [encryptionKey, getAuthHeader, setEntry]
  );

  const deleteData = useCallback(
    async (dataType, id) => {
      try {
        await axios.delete(`${API_URL}/${id}`, {
          headers: getAuthHeader(),
        });

        setEntry(dataType, (entry) => ({
          ...entry,
          data: entry.data.filter((item) => item._id !== id),
          skip: Math.max(0, entry.skip - 1),
        }));

        toast.success("Deleted");
        return true;
      } catch (error) {
        toast.error(error.response?.data?.message || "Delete failed");
        return false;
      }
    },
    [getAuthHeader, setEntry]
  );

  const value = useMemo(
    () => ({
      store,
      ensureData,
      refreshData,
      loadMoreData,
      loadAllData,
      addData,
      updateData,
      deleteData,
    }),
    [addData, deleteData, ensureData, loadAllData, loadMoreData, refreshData, store, updateData]
  );

  return <EncryptedDataContext.Provider value={value}>{children}</EncryptedDataContext.Provider>;
}

export function useEncryptedDataStore() {
  const ctx = useContext(EncryptedDataContext);
  if (!ctx) throw new Error("useEncryptedDataStore must be inside EncryptedDataProvider");
  return ctx;
}
