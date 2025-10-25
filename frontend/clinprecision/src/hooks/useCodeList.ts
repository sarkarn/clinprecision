import { useState, useEffect, useMemo } from 'react';
import { CODE_LIST_ENDPOINTS } from '../services/StudyServiceModern';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Code list category keys
 */
export type CodeListCategory =
  | 'REGULATORY_STATUS'
  | 'STUDY_PHASE'
  | 'STUDY_STATUS'
  | 'AMENDMENT_TYPE'
  | 'VISIT_TYPE';

/**
 * Standardized code list item structure
 */
export interface CodeListItem {
  id: number | string;
  value: string;
  label: string;
  description?: string;
  code?: string;
  name?: string;
  [key: string]: any; // Allow additional properties
}

/**
 * Options for useCodeList hook
 */
export interface UseCodeListOptions {
  /** Query filters to apply */
  filters?: Record<string, string | number | boolean>;
  /** Enable caching */
  enableCache?: boolean;
  /** Cache time-to-live in milliseconds */
  cacheTimeMs?: number;
  /** Fallback data if fetch fails */
  fallbackData?: CodeListItem[];
  /** Transform function for raw data */
  transformData?: ((data: any[]) => any[]) | null;
  /** Enable automatic refresh */
  autoRefresh?: boolean;
  /** Auto-refresh interval in milliseconds */
  refreshIntervalMs?: number;
}

/**
 * Cached code list data structure
 */
interface CachedCodeListData {
  data: CodeListItem[];
  timestamp: number;
}

/**
 * Return type of useCodeList hook
 */
export interface UseCodeListResult {
  data: CodeListItem[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  clearCache: () => void;
  lastFetch: string;
  cacheKey: string;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Universal CodeList Hook
 * 
 * Phase 3 Frontend Integration: Centralized hook for all reference data access
 * Replaces hardcoded arrays and individual API calls throughout the application
 * 
 * Features:
 * - Automatic caching with TTL
 * - Loading states and error handling
 * - Support for filtering and metadata queries
 * - Consistent data format across all components
 * - Fallback to default data when services unavailable
 * 
 * @param category - The code list category to fetch
 * @param options - Configuration options
 * @returns Code list data and utilities
 * 
 * @example
 * ```typescript
 * const { data, loading, error, refresh } = useCodeList('STUDY_PHASE', {
 *   enableCache: true,
 *   cacheTimeMs: 300000, // 5 minutes
 *   fallbackData: defaultPhases
 * });
 * ```
 */
export const useCodeList = (
  category: CodeListCategory | string,
  options: UseCodeListOptions = {}
): UseCodeListResult => {
  const [data, setData] = useState<CodeListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number | null>(null);

  const {
    filters = {},
    enableCache = true,
    cacheTimeMs = 5 * 60 * 1000, // 5 minutes default
    fallbackData = [],
    transformData = null,
    autoRefresh = false,
    refreshIntervalMs = 30 * 60 * 1000 // 30 minutes default
  } = options;

  // Generate cache key
  const cacheKey = useMemo(() => {
    const filterStr = Object.keys(filters).length > 0 ? 
      JSON.stringify(filters) : '';
    return `codelist_${category}_${filterStr}`;
  }, [category, filters]);

  // Check cache validity
  const isCacheValid = useMemo(() => {
    if (!enableCache || !lastFetch) return false;
    return (Date.now() - lastFetch) < cacheTimeMs;
  }, [enableCache, lastFetch, cacheTimeMs]);

  // Fetch data from API
  const fetchData = async (force: boolean = false): Promise<void> => {
    if (!force && isCacheValid) {
      return; // Use cached data
    }

    setLoading(true);
    setError(null);

    try {
      const baseEndpoint = CODE_LIST_ENDPOINTS[category];

      if (!baseEndpoint) {
        throw new Error(`Unknown category: ${category}`);
      }

      // Add filters for advanced queries
      let requestUrl = baseEndpoint;
      if (Object.keys(filters).length > 0) {
        const queryParams = new URLSearchParams(
          Object.entries(filters).reduce((acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
          }, {} as Record<string, string>)
        );
        requestUrl += `?${queryParams}`;
      }

      console.log(`🔍 Fetching CodeList data: ${category} from ${requestUrl}`);

      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const rawData: any[] = await response.json();
      console.log(`✅ Retrieved ${rawData.length} items for ${category}`);

      // Transform data if transformer provided
      let processedData = rawData;
      if (transformData && typeof transformData === 'function') {
        processedData = transformData(rawData);
      }

      // Ensure consistent format for frontend components
      const formattedData: CodeListItem[] = processedData.map((item: any) => ({
        id: item.id,
        value: item.code || item.value,
        label: item.name || item.label,
        description: item.description || '',
        ...item // Include all original properties
      }));

      setData(formattedData);
      setLastFetch(Date.now());
      
      // Cache data in localStorage if enabled
      if (enableCache) {
        try {
          const cachedData: CachedCodeListData = {
            data: formattedData,
            timestamp: Date.now()
          };
          localStorage.setItem(cacheKey, JSON.stringify(cachedData));
        } catch (e) {
          console.warn('Failed to cache data:', e);
        }
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`❌ Error fetching CodeList data for ${category}:`, err);
      setError(errorMessage);
      
      // Try to load from cache first
      if (enableCache) {
        try {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            const { data: cachedData }: CachedCodeListData = JSON.parse(cached);
            console.log(`🔄 Using cached data for ${category} (${cachedData.length} items)`);
            setData(cachedData);
            setLastFetch(Date.now()); // Reset to prevent continuous retries
          }
        } catch (cacheErr) {
          console.warn('Failed to load cached data:', cacheErr);
        }
      }
      
      // If no cache available, use fallback data
      if (data.length === 0 && fallbackData.length > 0) {
        console.log(`📋 Using fallback data for ${category} (${fallbackData.length} items)`);
        setData(fallbackData);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and cache check
  useEffect(() => {
    // First check cache
    if (enableCache) {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { data: cachedData, timestamp }: CachedCodeListData = JSON.parse(cached);
          if ((Date.now() - timestamp) < cacheTimeMs) {
            console.log(`💾 Using cached data for ${category} (${cachedData.length} items)`);
            setData(cachedData);
            setLastFetch(timestamp);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn('Failed to load cached data:', e);
      }
    }

    // Fetch fresh data
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, cacheKey]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      fetchData(true); // Force refresh
    }, refreshIntervalMs);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, refreshIntervalMs]);

  // Manual refresh function
  const refresh = (): void => {
    fetchData(true);
  };

  // Clear cache function
  const clearCache = (): void => {
    try {
      localStorage.removeItem(cacheKey);
      console.log(`🗑️  Cleared cache for ${category}`);
    } catch (e) {
      console.warn('Failed to clear cache:', e);
    }
  };

  return {
    data,
    loading,
    error,
    refresh,
    clearCache,
    lastFetch: lastFetch ? new Date(lastFetch).toISOString() : '',
    cacheKey
  };
};

// ============================================================================
// Specialized Hooks
// ============================================================================

/**
 * Hook for fetching regulatory statuses
 */
export const useRegulatoryStatuses = (options: UseCodeListOptions = {}): UseCodeListResult => {
  return useCodeList('REGULATORY_STATUS', {
    fallbackData: [
      { id: 1, value: 'NOT_APPLICABLE', label: 'Not Applicable', description: 'No regulatory approval required' },
      { id: 2, value: 'PREPARING_SUBMISSION', label: 'Preparing Submission', description: 'Preparing regulatory documents' },
      { id: 3, value: 'IND_APPROVED', label: 'IND Approved', description: 'IND application approved by FDA' },
      { id: 4, value: 'IRB_APPROVED', label: 'IRB Approved', description: 'Study approved by IRB' }
    ],
    ...options
  });
};

/**
 * Hook for fetching study phases
 */
export const useStudyPhases = (options: UseCodeListOptions = {}): UseCodeListResult => {
  return useCodeList('STUDY_PHASE', {
    fallbackData: [
      { id: 1, value: 'PRECLINICAL', label: 'Preclinical', description: 'Laboratory and animal studies' },
      { id: 2, value: 'PHASE_I', label: 'Phase I', description: 'First-in-human studies focusing on safety' },
      { id: 3, value: 'PHASE_II', label: 'Phase II', description: 'Studies focusing on efficacy' },
      { id: 4, value: 'PHASE_III', label: 'Phase III', description: 'Large-scale studies to confirm efficacy' }
    ],
    ...options
  });
};

/**
 * Hook for fetching study statuses
 */
export const useStudyStatuses = (options: UseCodeListOptions = {}): UseCodeListResult => {
  return useCodeList('STUDY_STATUS', {
    fallbackData: [
      { id: 1, value: 'DRAFT', label: 'Draft', description: 'Study in draft state' },
      { id: 2, value: 'UNDER_REVIEW', label: 'Under Review', description: 'Study under review' },
      { id: 3, value: 'APPROVED', label: 'Approved', description: 'Study approved for execution' },
      { id: 4, value: 'ACTIVE', label: 'Active', description: 'Study actively enrolling participants' }
    ],
    ...options
  });
};

/**
 * Hook for fetching amendment types
 */
export const useAmendmentTypes = (options: UseCodeListOptions = {}): UseCodeListResult => {
  return useCodeList('AMENDMENT_TYPE', {
    fallbackData: [
      { id: 1, value: 'MAJOR', label: 'Major Amendment', description: 'Significant protocol changes' },
      { id: 2, value: 'MINOR', label: 'Minor Amendment', description: 'Administrative changes' },
      { id: 3, value: 'SAFETY', label: 'Safety Amendment', description: 'Safety-related changes' }
    ],
    ...options
  });
};

/**
 * Hook for fetching visit types
 */
export const useVisitTypes = (options: UseCodeListOptions = {}): UseCodeListResult => {
  return useCodeList('VISIT_TYPE', {
    fallbackData: [
      { id: 1, value: 'SCREENING', label: 'Screening Visit', description: 'Initial patient screening' },
      { id: 2, value: 'BASELINE', label: 'Baseline Visit', description: 'Baseline measurements' },
      { id: 3, value: 'TREATMENT', label: 'Treatment Visit', description: 'Treatment administration' },
      { id: 4, value: 'FOLLOW_UP', label: 'Follow-up Visit', description: 'Post-treatment follow-up' }
    ],
    ...options
  });
};
