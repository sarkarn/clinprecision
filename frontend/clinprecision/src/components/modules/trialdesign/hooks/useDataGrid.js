import { useState, useCallback, useMemo } from 'react';

/**
 * Advanced data grid hook for study management
 * Provides filtering, sorting, pagination, and selection
 */
export const useDataGrid = (initialData = [], options = {}) => {
  const {
    pageSize = 10,
    sortable = true,
    filterable = true,
    selectable = false
  } = options;

  // State
  const [data, setData] = useState(initialData);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(pageSize);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // Filter functions
  const applyFilters = useCallback((items, filterConfig, globalFilterValue) => {
    let filtered = items;

    // Apply column-specific filters
    Object.entries(filterConfig).forEach(([key, filterValue]) => {
      if (filterValue && filterValue !== '') {
        filtered = filtered.filter(item => {
          const itemValue = item[key];
          
          if (typeof itemValue === 'string') {
            return itemValue.toLowerCase().includes(filterValue.toLowerCase());
          } else if (typeof itemValue === 'number') {
            return itemValue.toString().includes(filterValue);
          } else if (Array.isArray(itemValue)) {
            return itemValue.some(val => 
              val.toString().toLowerCase().includes(filterValue.toLowerCase())
            );
          }
          
          return false;
        });
      }
    });

    // Apply global filter
    if (globalFilterValue && globalFilterValue.trim() !== '') {
      const searchTerm = globalFilterValue.toLowerCase();
      filtered = filtered.filter(item =>
        Object.values(item).some(value => {
          if (value === null || value === undefined) return false;
          return value.toString().toLowerCase().includes(searchTerm);
        })
      );
    }

    return filtered;
  }, []);

  // Sort function
  const applySorting = useCallback((items, sortKey, sortDirection) => {
    if (!sortKey) return items;

    return [...items].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? 1 : -1;
      if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? -1 : 1;

      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Handle dates
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === 'asc' ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
      }

      // Handle date strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
          return sortDirection === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
        }
      }

      // Default string comparison
      const aStr = aValue.toString().toLowerCase();
      const bStr = bValue.toString().toLowerCase();
      const comparison = aStr.localeCompare(bStr);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, []);

  // Process data with filters, sorting, and pagination
  const processedData = useMemo(() => {
    // Apply filters
    const filtered = applyFilters(data, filters, globalFilter);
    
    // Apply sorting
    const sorted = applySorting(filtered, sortConfig.key, sortConfig.direction);
    
    // Calculate pagination
    const totalItems = sorted.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = sorted.slice(startIndex, endIndex);

    return {
      items: paginatedData,
      totalItems,
      totalPages,
      currentPage,
      itemsPerPage,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, totalItems)
    };
  }, [data, filters, globalFilter, sortConfig, currentPage, itemsPerPage, applyFilters, applySorting]);

  // Sorting handlers
  const handleSort = useCallback((key) => {
    if (!sortable) return;
    
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1); // Reset to first page when sorting
  }, [sortable]);

  // Filter handlers
  const handleFilterChange = useCallback((key, value) => {
    if (!filterable) return;
    
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
  }, [filterable]);

  const handleGlobalFilterChange = useCallback((value) => {
    setGlobalFilter(value);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setGlobalFilter('');
    setCurrentPage(1);
  }, []);

  // Pagination handlers
  const goToPage = useCallback((page) => {
    const maxPage = processedData.totalPages;
    if (page >= 1 && page <= maxPage) {
      setCurrentPage(page);
    }
  }, [processedData.totalPages]);

  const nextPage = useCallback(() => {
    if (processedData.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [processedData.hasNextPage]);

  const previousPage = useCallback(() => {
    if (processedData.hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [processedData.hasPreviousPage]);

  const changeItemsPerPage = useCallback((newSize) => {
    setItemsPerPage(newSize);
    setCurrentPage(1);
  }, []);

  // Selection handlers
  const toggleSelectItem = useCallback((itemId) => {
    if (!selectable) return;
    
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, [selectable]);

  const selectAll = useCallback(() => {
    if (!selectable) return;
    
    const allIds = processedData.items.map(item => item.id);
    setSelectedItems(new Set(allIds));
  }, [selectable, processedData.items]);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const isSelected = useCallback((itemId) => {
    return selectedItems.has(itemId);
  }, [selectedItems]);

  const isAllSelected = useCallback(() => {
    return processedData.items.length > 0 && 
           processedData.items.every(item => selectedItems.has(item.id));
  }, [processedData.items, selectedItems]);

  const isPartiallySelected = useCallback(() => {
    return selectedItems.size > 0 && !isAllSelected();
  }, [selectedItems.size, isAllSelected]);

  // Data management
  const updateData = useCallback((newData) => {
    setData(newData);
    setCurrentPage(1);
  }, []);

  const addItem = useCallback((item) => {
    setData(prev => [...prev, item]);
  }, []);

  const updateItem = useCallback((itemId, updatedItem) => {
    setData(prev => prev.map(item => 
      item.id === itemId ? { ...item, ...updatedItem } : item
    ));
  }, []);

  const removeItem = useCallback((itemId) => {
    setData(prev => prev.filter(item => item.id !== itemId));
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  }, []);

  const removeSelectedItems = useCallback(() => {
    const selectedIds = Array.from(selectedItems);
    setData(prev => prev.filter(item => !selectedIds.includes(item.id)));
    setSelectedItems(new Set());
  }, [selectedItems]);

  // Bulk operations
  const bulkUpdate = useCallback((updates) => {
    const selectedIds = Array.from(selectedItems);
    setData(prev => prev.map(item =>
      selectedIds.includes(item.id) ? { ...item, ...updates } : item
    ));
  }, [selectedItems]);

  return {
    // Processed data
    ...processedData,
    
    // Raw data
    rawData: data,
    
    // State
    sortConfig,
    filters,
    globalFilter,
    selectedItems,
    loading,
    
    // Actions
    handleSort,
    handleFilterChange,
    handleGlobalFilterChange,
    clearFilters,
    
    // Pagination
    goToPage,
    nextPage,
    previousPage,
    changeItemsPerPage,
    
    // Selection
    toggleSelectItem,
    selectAll,
    clearSelection,
    isSelected,
    isAllSelected,
    isPartiallySelected,
    
    // Data management
    updateData,
    addItem,
    updateItem,
    removeItem,
    removeSelectedItems,
    bulkUpdate,
    setLoading
  };
};

export default useDataGrid;
