import { useState, useEffect, useMemo } from 'react';
import { CODE_LIST_ENDPOINTS } from '../services/StudyServiceModern';

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
 */
export const useCodeList = (category, options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

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
  const fetchData = async (force = false) => {
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
        const queryParams = new URLSearchParams(filters);
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

      const rawData = await response.json();
      console.log(`✅ Retrieved ${rawData.length} items for ${category}`);

      // Transform data if transformer provided
      let processedData = rawData;
      if (transformData && typeof transformData === 'function') {
        processedData = transformData(rawData);
      }

      // Ensure consistent format for frontend components
      const formattedData = processedData.map(item => ({
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
          localStorage.setItem(cacheKey, JSON.stringify({
            data: formattedData,
            timestamp: Date.now()
          }));
        } catch (e) {
          console.warn('Failed to cache data:', e);
        }
      }

    } catch (err) {
      console.error(`❌ Error fetching CodeList data for ${category}:`, err);
      setError(err.message);
      
      // Try to load from cache first
      if (enableCache) {
        try {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            const { data: cachedData } = JSON.parse(cached);
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
          const { data: cachedData, timestamp } = JSON.parse(cached);
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
  }, [category, cacheKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      fetchData(true); // Force refresh
    }, refreshIntervalMs);

    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshIntervalMs]); // eslint-disable-line react-hooks/exhaustive-deps

  // Manual refresh function
  const refresh = () => fetchData(true);

  // Clear cache function
  const clearCache = () => {
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
    lastFetch: new Date(lastFetch).toISOString(),
    cacheKey
  };
};

/**
 * Specialized hooks for common code lists
 */
export const useRegulatoryStatuses = (options = {}) => {
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

export const useStudyPhases = (options = {}) => {
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

export const useStudyStatuses = (options = {}) => {
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

export const useAmendmentTypes = (options = {}) => {
  return useCodeList('AMENDMENT_TYPE', {
    fallbackData: [
      { id: 1, value: 'MAJOR', label: 'Major Amendment', description: 'Significant protocol changes' },
      { id: 2, value: 'MINOR', label: 'Minor Amendment', description: 'Administrative changes' },
      { id: 3, value: 'SAFETY', label: 'Safety Amendment', description: 'Safety-related changes' }
    ],
    ...options
  });
};

export const useVisitTypes = (options = {}) => {
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