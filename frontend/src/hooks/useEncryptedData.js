import { useEffect } from "react";
import { useEncryptedDataStore } from "../components/Data/EncryptedDataProvider";

const DEFAULT_PAGE_SIZE = 50;

export function useEncryptedData(
  dataType,
  { pageSize = DEFAULT_PAGE_SIZE, prefetchAll = false, autoFetch = true } = {}
) {
  const {
    store,
    ensureData,
    refreshData,
    loadMoreData,
    loadAllData,
    addData: addDataToStore,
    updateData: updateDataInStore,
    deleteData: deleteDataFromStore,
  } = useEncryptedDataStore();

  const entry = store[dataType] || {
    data: [],
    loading: false,
    error: null,
    hasMore: true,
    skip: 0,
    initialized: false,
  };

  useEffect(() => {
    if (!autoFetch) return;
    ensureData(dataType, { limit: pageSize });
  }, [autoFetch, dataType, ensureData, pageSize]);

  useEffect(() => {
    if (!prefetchAll || !entry.initialized || !entry.hasMore || entry.loading) return;
    loadAllData(dataType, { limit: pageSize });
  }, [dataType, entry.hasMore, entry.initialized, entry.loading, loadAllData, pageSize, prefetchAll]);

  return {
    data: entry.data,
    loading: entry.loading,
    error: entry.error,
    hasMore: entry.hasMore,
    initialized: entry.initialized,
    addData: (newData) => addDataToStore(dataType, newData),
    updateData: (id, updatedData) => updateDataInStore(dataType, id, updatedData),
    deleteData: (id) => deleteDataFromStore(dataType, id),
    refreshData: () => refreshData(dataType, { limit: pageSize }),
    loadMore: () => loadMoreData(dataType, { limit: pageSize }),
  };
}
