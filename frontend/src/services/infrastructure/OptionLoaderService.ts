// src/services/core/OptionLoaderService.ts
import ApiService from './ApiService';
import {
  IOptionLoaderService,
  FieldDefinition,
  OptionLoadContext,
  SelectOption,
  OptionSource,
  OptionSourceType,
  CodeListItem,
  CachedOptions,
  CacheStats,
  PlaceholderMapping,
} from '../../types/OptionLoaderService.types';

/**
 * OptionLoaderService - Centralized service for loading select field options
 * 
 * Features:
 * - Multiple option sources (static, code list, study data, API, external standards)
 * - In-memory caching with configurable duration
 * - Context-aware option loading
 * - Backward compatibility with existing forms
 * - Integration with code list service
 * 
 * Usage:
 *   import OptionLoaderService from '../infrastructure/OptionLoaderService';
 *   const options = await OptionLoaderService.loadFieldOptions(field, { studyId: 123 });
 */

/**
 * In-memory cache for options
 * Structure: { cacheKey: { data, timestamp } }
 */
const optionCache = new Map<string, CachedOptions>();

/**
 * Default cache duration (1 hour = 3600 seconds)
 */
const DEFAULT_CACHE_DURATION = 3600;

/**
 * Format static options to standard format
 */
const formatStaticOptions = (options: any[]): SelectOption[] => {
  if (!Array.isArray(options)) return [];

  return options.map((opt) => ({
    value: opt.value,
    label: opt.label,
    description: opt.description || '',
    order: opt.order,
    codingValue: opt.codingValue,
    codingSystem: opt.codingSystem,
  }));
};

/**
 * Load options from code list service
 */
const loadCodeListOptions = async (optionSource: OptionSource): Promise<SelectOption[]> => {
  const { category } = optionSource;

  if (!category) {
    console.error('*** OptionLoader: ❌ Code list category is required but not provided!');
    throw new Error('Code list category is required');
  }

  console.log(`*** OptionLoader: 📡 Loading code list: ${category}`);
  const apiUrl = `/clinops-ws/api/v1/study-design/metadata/codelists/simple/${category}`;
  console.log(`*** OptionLoader: 📡 API URL: ${apiUrl}`);

  try {
    // Use the existing code list API
    const response = await ApiService.get<CodeListItem[]>(apiUrl);

    console.log(`*** OptionLoader: ✅ API Response status: ${response.status}`);
    console.log(`*** OptionLoader: ✅ API Response data:`, response.data);
    
    if (response.data && response.data.length > 0) {
      console.log(`*** OptionLoader: ✅ First item in response:`, response.data[0]);
      console.log(`*** OptionLoader: ✅ First item keys:`, Object.keys(response.data[0] || {}));
    }

    if (!response.data || !Array.isArray(response.data)) {
      console.warn(`*** OptionLoader: ⚠️ Invalid code list response for ${category}`);
      return [];
    }

    // Format response to standard option format
    const formattedOptions = response.data.map((item) => {
      const formatted: SelectOption = {
        value: item.code || item.value || item.id || '',
        label: item.displayName || item.name || item.label || item.value || item.code || '',
        description: item.description || '',
        order: item.displayOrder || item.order,
      };
      console.log(`*** OptionLoader: 🔧 Formatting item:`, { original: item, formatted });
      return formatted;
    });

    console.log(`*** OptionLoader: ✅ Formatted ${formattedOptions.length} options:`, formattedOptions);
    return formattedOptions;
  } catch (error) {
    console.error(`*** OptionLoader: ❌ Error loading code list ${category}:`, error);
    throw error;
  }
};

/**
 * Load options from study data endpoints
 */
const loadStudyDataOptions = async (
  optionSource: OptionSource,
  context: OptionLoadContext
): Promise<SelectOption[]> => {
  let { endpoint, filter, valueField, labelField } = optionSource;

  if (!endpoint) {
    throw new Error('Study data endpoint is required');
  }

  // Replace placeholders in endpoint
  endpoint = replacePlaceholders(endpoint, context);

  // Add filter as query parameter if specified
  if (filter) {
    const separator = endpoint.includes('?') ? '&' : '?';
    endpoint = `${endpoint}${separator}${filter}`;
  }

  console.log(`*** OptionLoader: Loading study data from: ${endpoint}`);

  try {
    const response = await ApiService.get<any[]>(endpoint);

    if (!response.data || !Array.isArray(response.data)) {
      console.warn(`*** OptionLoader: ⚠️ Invalid study data response from ${endpoint}`);
      return [];
    }

    // Use default field names if not specified
    const vField = valueField || 'id';
    const lField = labelField || 'name';

    // Format response to standard option format
    return response.data.map((item) => ({
      value: item[vField],
      label: item[lField],
      description: item.description || '',
      ...item, // Include all original fields
    }));
  } catch (error) {
    console.error(`*** OptionLoader: ❌ Error loading study data from ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Load options from custom API endpoint
 */
const loadApiOptions = async (
  optionSource: OptionSource,
  context: OptionLoadContext
): Promise<SelectOption[]> => {
  let { endpoint, queryParams, valueField, labelField } = optionSource;

  if (!endpoint) {
    throw new Error('API endpoint is required');
  }

  // Replace placeholders in endpoint
  endpoint = replacePlaceholders(endpoint, context);

  // Add query parameters if specified
  if (queryParams) {
    const separator = endpoint.includes('?') ? '&' : '?';
    endpoint = `${endpoint}${separator}${queryParams}`;
  }

  console.log(`*** OptionLoader: Loading API options from: ${endpoint}`);

  try {
    const response = await ApiService.get<any>(endpoint);

    if (!response.data) {
      console.warn(`*** OptionLoader: ⚠️ Invalid API response from ${endpoint}`);
      return [];
    }

    // Handle array or object response
    const data = Array.isArray(response.data) ? response.data : [response.data];

    // Use default field names if not specified
    const vField = valueField || 'value';
    const lField = labelField || 'label';

    // Format response to standard option format
    return data.map((item) => ({
      value: item[vField],
      label: item[lField],
      description: item.description || '',
      ...item,
    }));
  } catch (error) {
    console.error(`*** OptionLoader: ❌ Error loading API options from ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Load options from external standards (MedDRA, ICD-10, etc.)
 */
const loadExternalStandardOptions = async (
  optionSource: OptionSource,
  context: OptionLoadContext
): Promise<SelectOption[]> => {
  const { category, filter, valueField, labelField } = optionSource;

  if (!category) {
    throw new Error('External standard category is required');
  }

  console.log(`*** OptionLoader: Loading external standard: ${category}`);

  // Build endpoint based on category
  let endpoint = `/clinops-ws/api/external-standards/${category}`;

  if (filter) {
    endpoint += `?${filter}`;
  }

  try {
    const response = await ApiService.get<any[]>(endpoint);

    if (!response.data || !Array.isArray(response.data)) {
      console.warn(`*** OptionLoader: ⚠️ Invalid external standard response for ${category}`);
      return [];
    }

    // Use default field names if not specified
    const vField = valueField || 'code';
    const lField = labelField || 'term';

    // Format response to standard option format
    return response.data.map((item) => ({
      value: item[vField],
      label: item[lField],
      description: item.description || '',
      codingValue: item[vField],
      codingSystem: category,
      ...item,
    }));
  } catch (error) {
    console.error(`*** OptionLoader: ❌ Error loading external standard ${category}:`, error);
    throw error;
  }
};

/**
 * Replace placeholders in endpoint URL
 */
const replacePlaceholders = (endpoint: string, context: OptionLoadContext): string => {
  let result = endpoint;

  // Replace common placeholders
  const placeholders: PlaceholderMapping = {
    '{studyId}': context.studyId,
    '{siteId}': context.siteId,
    '{subjectId}': context.subjectId,
    '{visitId}': context.visitId,
    '{formId}': context.formId,
  };

  Object.entries(placeholders).forEach(([placeholder, value]) => {
    if (value !== undefined && value !== null) {
      result = result.replace(placeholder, String(value));
    }
  });

  return result;
};

/**
 * Generate cache key
 */
const generateCacheKey = (
  fieldId: string,
  optionSource: OptionSource,
  context: OptionLoadContext
): string => {
  const parts = [
    'options',
    fieldId,
    optionSource.type,
    optionSource.category || '',
    optionSource.endpoint || '',
    context.studyId || '',
    context.siteId || '',
    optionSource.filter || '',
  ];

  return parts.filter((p) => p).join('_');
};

/**
 * Get cached options if not expired
 */
const getCachedOptions = (cacheKey: string, cacheDuration: number): SelectOption[] | null => {
  const cached = optionCache.get(cacheKey);

  if (!cached) return null;

  const age = Date.now() - cached.timestamp;

  if (age > cacheDuration) {
    // Cache expired, remove it
    optionCache.delete(cacheKey);
    return null;
  }

  return cached.data;
};

/**
 * Cache options
 */
const cacheOptions = (cacheKey: string, options: SelectOption[]): void => {
  optionCache.set(cacheKey, {
    data: options,
    timestamp: Date.now(),
  });

  console.log(`*** OptionLoader: Cached ${options.length} options with key: ${cacheKey}`);
};

/**
 * OptionLoaderService implementation
 */
const OptionLoaderService: IOptionLoaderService = {
  /**
   * Load options based on field configuration
   * @param field - Field definition with metadata
   * @param context - Context data (studyId, siteId, subjectId, etc.)
   * @returns Array of options {value, label, description}
   */
  loadFieldOptions: async (
    field: FieldDefinition,
    context: OptionLoadContext = {}
  ): Promise<SelectOption[]> => {
    console.log(`*** OptionLoader: 🔍 loadFieldOptions called for field: ${field.id}`);
    console.log(`*** OptionLoader: 🔍 Field metadata:`, field.metadata);

    let optionSource = field.metadata?.uiConfig?.optionSource;
    console.log(`*** OptionLoader: 🔍 optionSource from uiConfig:`, optionSource);

    // Check for simplified code list category format (from form designer)
    if (!optionSource && field.metadata?.codeListCategory) {
      console.log(`*** OptionLoader: 🔍 Found codeListCategory: ${field.metadata.codeListCategory}`);
      optionSource = {
        type: OptionSourceType.CODE_LIST,
        category: field.metadata.codeListCategory,
        cacheable: true,
        cacheDuration: DEFAULT_CACHE_DURATION,
      };
      console.log(`*** OptionLoader: 🔍 Created optionSource:`, optionSource);
    }

    // If no option source specified, use static options (backward compatible)
    if (!optionSource) {
      console.log(`*** OptionLoader: ⚠️ No optionSource found for field ${field.id}, using static options`);
      // Check multiple locations for backward compatibility:
      // 1. field.metadata.uiConfig.options (new format)
      // 2. field.metadata.options (alternative new format)
      // 3. field.options (old format - for existing forms)
      const optionsArray = field.metadata?.uiConfig?.options || field.metadata?.options || field.options || [];
      console.log(`*** OptionLoader: 🔍 Found options array (length: ${optionsArray.length}):`, optionsArray);
      const staticOptions = formatStaticOptions(optionsArray);
      console.log(`*** OptionLoader: 🔍 Formatted static options:`, staticOptions);
      return staticOptions;
    }

    console.log(`*** OptionLoader: 🔍 Final optionSource:`, optionSource);

    // Check if options should be cached
    const cacheable = optionSource.cacheable !== false; // Default: true
    const cacheDuration = (optionSource.cacheDuration || DEFAULT_CACHE_DURATION) * 1000; // Convert to ms

    // Generate cache key
    const cacheKey = generateCacheKey(field.id, optionSource, context);

    // Check cache first
    if (cacheable) {
      const cached = getCachedOptions(cacheKey, cacheDuration);
      if (cached) {
        console.log(`*** OptionLoader: Using cached options for field ${field.id}`);
        return cached;
      }
    }

    // Load options based on source type
    let options: SelectOption[] = [];

    try {
      switch (optionSource.type) {
        case OptionSourceType.STATIC:
          options = formatStaticOptions(field.metadata?.uiConfig?.options || []);
          break;

        case OptionSourceType.CODE_LIST:
          options = await loadCodeListOptions(optionSource);
          break;

        case OptionSourceType.STUDY_DATA:
          options = await loadStudyDataOptions(optionSource, context);
          break;

        case OptionSourceType.API:
          options = await loadApiOptions(optionSource, context);
          break;

        case OptionSourceType.EXTERNAL_STANDARD:
          options = await loadExternalStandardOptions(optionSource, context);
          break;

        default:
          console.warn(`*** OptionLoader: ⚠️ Unknown option source type: ${optionSource.type}`);
          options = [];
      }

      // Cache the results
      if (cacheable && options.length > 0) {
        cacheOptions(cacheKey, options);
      }

      return options;
    } catch (error) {
      console.error(`*** OptionLoader: ❌ Error loading options for field ${field.id}:`, error);

      // Try to return cached data even if expired
      const staleCache = optionCache.get(cacheKey);
      if (staleCache) {
        console.warn(`*** OptionLoader: ⚠️ Using stale cached options for field ${field.id}`);
        return staleCache.data;
      }

      return [];
    }
  },

  /**
   * Clear all cached options
   */
  clearOptionCache: (): void => {
    optionCache.clear();
    console.log('*** OptionLoader: Cleared all cached options');
  },

  /**
   * Clear cache for specific field
   * @param fieldId - Field ID to clear cache for
   */
  clearFieldCache: (fieldId: string): void => {
    const keys = Array.from(optionCache.keys());
    const removed = keys.filter((key) => key.includes(fieldId));

    removed.forEach((key) => optionCache.delete(key));

    console.log(`*** OptionLoader: Cleared cache for field ${fieldId} (${removed.length} entries)`);
  },

  /**
   * Get cache statistics
   * @returns Cache statistics including entry count and details
   */
  getCacheStats: (): CacheStats => {
    const stats: CacheStats = {
      totalEntries: optionCache.size,
      entries: [],
    };

    optionCache.forEach((value, key) => {
      const age = Date.now() - value.timestamp;
      stats.entries.push({
        key,
        optionCount: value.data.length,
        ageSeconds: Math.floor(age / 1000),
        timestamp: new Date(value.timestamp).toISOString(),
      });
    });

    return stats;
  },
};

// Export default service
export default OptionLoaderService;

// Named exports
export { formatStaticOptions };
export type { IOptionLoaderService };
