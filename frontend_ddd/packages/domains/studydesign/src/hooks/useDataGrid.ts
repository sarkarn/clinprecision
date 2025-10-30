import { useState, useCallback, useMemo } from 'react';

// ============================================================================
// Types
// ============================================================================

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: string | null;
  direction: SortDirection;
}

export interface DataGridOptions {
  pageSize?: number;
  sortable?: boolean;
  filterable?: boolean;
  selectable?: boolean;
}

export interface Filters {
  [key: string]: string | number | boolean;
}

export interface ProcessedDataResult<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startIndex: number;
  endIndex: number;
}

export interface UseDataGridReturn<T> extends ProcessedDataResult<T> {
  // Raw data
  rawData: T[];
  
  // State
  sortConfig: SortConfig;
  filters: Filters;
  globalFilter: string;
  selectedItems: Set<any>;
  loading: boolean;
  
  // Actions
  handleSort: (key: string) => void;
  handleFilterChange: (key: string, value: string | number | boolean) => void;
  handleGlobalFilterChange: (value: string) => void;
  clearFilters: () => void;
  
  // Pagination
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  changeItemsPerPage: (newSize: number) => void;
  
  // Selection
  toggleSelectItem: (itemId: any) => void;
  selectAll: () => void;
  clearSelection: () => void;
  isSelected: (itemId: any) => boolean;
  isAllSelected: () => boolean;
  isPartiallySelected: () => boolean;
  
  // Data management
  updateData: (newData: T[]) => void;
  addItem: (item: T) => void;
  updateItem: (itemId: any, updatedItem: Partial<T>) => void;
  removeItem: (itemId: any) => void;
  removeSelectedItems: () => void;
  bulkUpdate: (updates: Partial<T>) => void;
  setLoading: (loading: boolean) => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Advanced data grid hook for study management
 * Provides filtering, sorting, pagination, and selection
 * 
 * @param initialData - Initial array of data items
 * @param options - Configuration options for the data grid
 * @returns Data grid state and methods
 */
export const useDataGrid = <T extends { id?: any } = any>(
  initialData: T[] = [],
  options: DataGridOptions = {}
): UseDataGridReturn<T> => {
  const {
    pageSize = 10,
    sortable = true,
    filterable = true,
    selectable = false
  } = options;

  // State
  const [data, setData] = useState<T[]>(initialData);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(pageSize);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState<Filters>({});
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<Set<any>>(new Set());
  const [loading, setLoading] = useState<boolean>(false);

  // Filter functions
  const applyFilters = useCallback((
    items: T[],
    filterConfig: Filters,
    globalFilterValue: string
  ): T[] => {
    let filtered = items;

    // Apply column-specific filters
    Object.entries(filterConfig).forEach(([key, filterValue]) => {
      if (filterValue !== undefined && filterValue !== null && filterValue !== '') {
        filtered = filtered.filter(item => {
          const itemValue = (item as any)[key];
          
          if (typeof itemValue === 'string') {
            return itemValue.toLowerCase().includes(filterValue.toString().toLowerCase());
          } else if (typeof itemValue === 'number') {
            return itemValue.toString().includes(filterValue.toString());
          } else if (Array.isArray(itemValue)) {
            return itemValue.some(val => 
              val.toString().toLowerCase().includes(filterValue.toString().toLowerCase())
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
        Object.values(item as any).some(value => {
          if (value === null || value === undefined) return false;
          return value.toString().toLowerCase().includes(searchTerm);
        })
      );
    }

    return filtered;
  }, []);

  // Sort function
  const applySorting = useCallback((
    items: T[],
    sortKey: string | null,
    sortDirection: SortDirection
  ): T[] => {
    if (!sortKey) return items;

    return [...items].sort((a, b) => {
      const aValue = (a as any)[sortKey];
      const bValue = (b as any)[sortKey];

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
  const processedData = useMemo((): ProcessedDataResult<T> => {
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
  const handleSort = useCallback((key: string): void => {
    if (!sortable) return;
    
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1); // Reset to first page when sorting
  }, [sortable]);

  // Filter handlers
  const handleFilterChange = useCallback((key: string, value: string | number | boolean): void => {
    if (!filterable) return;
    
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
  }, [filterable]);

  const handleGlobalFilterChange = useCallback((value: string): void => {
    setGlobalFilter(value);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const clearFilters = useCallback((): void => {
    setFilters({});
    setGlobalFilter('');
    setCurrentPage(1);
  }, []);

  // Pagination handlers
  const goToPage = useCallback((page: number): void => {
    const maxPage = processedData.totalPages;
    if (page >= 1 && page <= maxPage) {
      setCurrentPage(page);
    }
  }, [processedData.totalPages]);

  const nextPage = useCallback((): void => {
    if (processedData.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [processedData.hasNextPage]);

  const previousPage = useCallback((): void => {
    if (processedData.hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [processedData.hasPreviousPage]);

  const changeItemsPerPage = useCallback((newSize: number): void => {
    setItemsPerPage(newSize);
    setCurrentPage(1);
  }, []);

  // Selection handlers
  const toggleSelectItem = useCallback((itemId: any): void => {
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

  const selectAll = useCallback((): void => {
    if (!selectable) return;
    
    const allIds = processedData.items.map(item => item.id);
    setSelectedItems(new Set(allIds));
  }, [selectable, processedData.items]);

  const clearSelection = useCallback((): void => {
    setSelectedItems(new Set());
  }, []);

  const isSelected = useCallback((itemId: any): boolean => {
    return selectedItems.has(itemId);
  }, [selectedItems]);

  const isAllSelected = useCallback((): boolean => {
    return processedData.items.length > 0 && 
           processedData.items.every(item => selectedItems.has(item.id));
  }, [processedData.items, selectedItems]);

  const isPartiallySelected = useCallback((): boolean => {
    return selectedItems.size > 0 && !isAllSelected();
  }, [selectedItems.size, isAllSelected]);

  // Data management
  const updateData = useCallback((newData: T[]): void => {
    setData(newData);
    setCurrentPage(1);
  }, []);

  const addItem = useCallback((item: T): void => {
    setData(prev => [...prev, item]);
  }, []);

  const updateItem = useCallback((itemId: any, updatedItem: Partial<T>): void => {
    setData(prev => prev.map(item => 
      item.id === itemId ? { ...item, ...updatedItem } : item
    ));
  }, []);

  const removeItem = useCallback((itemId: any): void => {
    setData(prev => prev.filter(item => item.id !== itemId));
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  }, []);

  const removeSelectedItems = useCallback((): void => {
    const selectedIds = Array.from(selectedItems);
    setData(prev => prev.filter(item => !selectedIds.includes(item.id)));
    setSelectedItems(new Set());
  }, [selectedItems]);

  // Bulk operations
  const bulkUpdate = useCallback((updates: Partial<T>): void => {
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
