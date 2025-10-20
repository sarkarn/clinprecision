/**
 * OptionLoaderService
 * 
 * Centralized service for loading select field options from various sources.
 * Supports static, code list, study data, API, and external standard sources.
 * 
 * Integrates with existing useCodeList hook for caching.
 */

import ApiService from './ApiService';

/**
 * In-memory cache for options
 * Structure: { cacheKey: { data, timestamp } }
 */
const optionCache = new Map();

/**
 * Default cache duration (1 hour)
 */
const DEFAULT_CACHE_DURATION = 3600;

/**
 * Load options based on field configuration
 * 
 * @param {Object} field - Field definition with metadata
 * @param {Object} context - Context data (studyId, siteId, subjectId, etc.)
 * @returns {Promise<Array>} Array of options {value, label, description}
 */
export const loadFieldOptions = async (field, context = {}) => {
  console.log(`🔍 [OptionLoader] loadFieldOptions called for field: ${field.id}`);
  console.log(`🔍 [OptionLoader] Field metadata:`, field.metadata);
  
  let optionSource = field.metadata?.uiConfig?.optionSource;
  console.log(`🔍 [OptionLoader] optionSource from uiConfig:`, optionSource);
  
  // Check for simplified code list category format (from form designer)
  if (!optionSource && field.metadata?.codeListCategory) {
    console.log(`🔍 [OptionLoader] Found codeListCategory: ${field.metadata.codeListCategory}`);
    optionSource = {
      type: 'CODE_LIST',
      category: field.metadata.codeListCategory,
      cacheable: true,
      cacheDuration: DEFAULT_CACHE_DURATION
    };
    console.log(`🔍 [OptionLoader] Created optionSource:`, optionSource);
  }
  
  // If no option source specified, use static options (backward compatible)
  if (!optionSource) {
    console.log(`⚠️ [OptionLoader] No optionSource found for field ${field.id}, using static options`);
    // Check multiple locations for backward compatibility:
    // 1. field.metadata.uiConfig.options (new format)
    // 2. field.metadata.options (alternative new format)
    // 3. field.options (old format - for existing forms)
    const optionsArray = field.metadata?.uiConfig?.options || field.metadata?.options || field.options || [];
    console.log(`🔍 [OptionLoader] Found options array (length: ${optionsArray.length}):`, optionsArray);
    const staticOptions = formatStaticOptions(optionsArray);
    console.log(`🔍 [OptionLoader] Formatted static options:`, staticOptions);
    return staticOptions;
  }
  
  console.log(`🔍 [OptionLoader] Final optionSource:`, optionSource);
  
  // Check if options should be cached
  const cacheable = optionSource.cacheable !== false; // Default: true
  const cacheDuration = (optionSource.cacheDuration || DEFAULT_CACHE_DURATION) * 1000; // Convert to ms
  
  // Generate cache key
  const cacheKey = generateCacheKey(field.id, optionSource, context);
  
  // Check cache first
  if (cacheable) {
    const cached = getCachedOptions(cacheKey, cacheDuration);
    if (cached) {
      console.log(`[OptionLoader] Using cached options for field ${field.id}`);
      return cached;
    }
  }
  
  // Load options based on source type
  let options = [];
  
  try {
    switch (optionSource.type) {
      case 'STATIC':
        options = formatStaticOptions(field.metadata?.uiConfig?.options || []);
        break;
        
      case 'CODE_LIST':
        options = await loadCodeListOptions(optionSource);
        break;
        
      case 'STUDY_DATA':
        options = await loadStudyDataOptions(optionSource, context);
        break;
        
      case 'API':
        options = await loadApiOptions(optionSource, context);
        break;
        
      case 'EXTERNAL_STANDARD':
        options = await loadExternalStandardOptions(optionSource, context);
        break;
        
      default:
        console.warn(`[OptionLoader] Unknown option source type: ${optionSource.type}`);
        options = [];
    }
    
    // Cache the results
    if (cacheable && options.length > 0) {
      cacheOptions(cacheKey, options);
    }
    
    return options;
    
  } catch (error) {
    console.error(`[OptionLoader] Error loading options for field ${field.id}:`, error);
    
    // Try to return cached data even if expired
    const staleCache = optionCache.get(cacheKey);
    if (staleCache) {
      console.warn(`[OptionLoader] Using stale cached options for field ${field.id}`);
      return staleCache.data;
    }
    
    return [];
  }
};

/**
 * Format static options to standard format
 */
const formatStaticOptions = (options) => {
  if (!Array.isArray(options)) return [];
  
  return options.map(opt => ({
    value: opt.value,
    label: opt.label,
    description: opt.description || '',
    order: opt.order,
    codingValue: opt.codingValue,
    codingSystem: opt.codingSystem
  }));
};

/**
 * Load options from code list service
 */
const loadCodeListOptions = async (optionSource) => {
  const { category } = optionSource;
  
  if (!category) {
    console.error('❌ [OptionLoader] Code list category is required but not provided!');
    throw new Error('Code list category is required');
  }
  
  console.log(`📡 [OptionLoader] Loading code list: ${category}`);
  const apiUrl = `/clinops-ws/api/v1/study-design/metadata/codelists/simple/${category}`;
  console.log(`📡 [OptionLoader] API URL: ${apiUrl}`);
  
  try {
    // Use the existing code list API
    const response = await ApiService.get(apiUrl);
    
    console.log(`✅ [OptionLoader] API Response status: ${response.status}`);
    console.log(`✅ [OptionLoader] API Response data:`, response.data);
    console.log(`✅ [OptionLoader] First item in response:`, response.data[0]);
    console.log(`✅ [OptionLoader] First item keys:`, Object.keys(response.data[0] || {}));
    
    if (!response.data || !Array.isArray(response.data)) {
      console.warn(`⚠️ [OptionLoader] Invalid code list response for ${category}`);
      return [];
    }
    
    // Format response to standard option format
    const formattedOptions = response.data.map(item => {
      const formatted = {
        value: item.code || item.value || item.id,
        label: item.displayName || item.name || item.label || item.value || item.code,
        description: item.description || '',
        order: item.displayOrder || item.order
      };
      console.log(`🔧 [OptionLoader] Formatting item:`, { original: item, formatted });
      return formatted;
    });
    
    console.log(`✅ [OptionLoader] Formatted ${formattedOptions.length} options:`, formattedOptions);
    return formattedOptions;
    
  } catch (error) {
    console.error(`[OptionLoader] Error loading code list ${category}:`, error);
    throw error;
  }
};

/**
 * Load options from study data endpoints
 */
const loadStudyDataOptions = async (optionSource, context) => {
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
  
  console.log(`[OptionLoader] Loading study data from: ${endpoint}`);
  
  try {
    const response = await ApiService.get(endpoint);
    
    if (!response.data || !Array.isArray(response.data)) {
      console.warn(`[OptionLoader] Invalid study data response from ${endpoint}`);
      return [];
    }
    
    // Use default field names if not specified
    const vField = valueField || 'id';
    const lField = labelField || 'name';
    
    // Format response to standard option format
    return response.data.map(item => ({
      value: item[vField],
      label: item[lField],
      description: item.description || '',
      ...item // Include all original fields
    }));
    
  } catch (error) {
    console.error(`[OptionLoader] Error loading study data from ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Load options from custom API endpoint
 */
const loadApiOptions = async (optionSource, context) => {
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
  
  console.log(`[OptionLoader] Loading API options from: ${endpoint}`);
  
  try {
    const response = await ApiService.get(endpoint);
    
    if (!response.data) {
      console.warn(`[OptionLoader] Invalid API response from ${endpoint}`);
      return [];
    }
    
    // Handle array or object response
    const data = Array.isArray(response.data) ? response.data : [response.data];
    
    // Use default field names if not specified
    const vField = valueField || 'value';
    const lField = labelField || 'label';
    
    // Format response to standard option format
    return data.map(item => ({
      value: item[vField],
      label: item[lField],
      description: item.description || '',
      ...item
    }));
    
  } catch (error) {
    console.error(`[OptionLoader] Error loading API options from ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Load options from external standards (MedDRA, ICD-10, etc.)
 */
const loadExternalStandardOptions = async (optionSource, context) => {
  const { category, filter, valueField, labelField } = optionSource;
  
  if (!category) {
    throw new Error('External standard category is required');
  }
  
  console.log(`[OptionLoader] Loading external standard: ${category}`);
  
  // Build endpoint based on category
  let endpoint = `/clinops-ws/api/external-standards/${category}`;
  
  if (filter) {
    endpoint += `?${filter}`;
  }
  
  try {
    const response = await ApiService.get(endpoint);
    
    if (!response.data || !Array.isArray(response.data)) {
      console.warn(`[OptionLoader] Invalid external standard response for ${category}`);
      return [];
    }
    
    // Use default field names if not specified
    const vField = valueField || 'code';
    const lField = labelField || 'term';
    
    // Format response to standard option format
    return response.data.map(item => ({
      value: item[vField],
      label: item[lField],
      description: item.description || '',
      codingValue: item[vField],
      codingSystem: category,
      ...item
    }));
    
  } catch (error) {
    console.error(`[OptionLoader] Error loading external standard ${category}:`, error);
    throw error;
  }
};

/**
 * Replace placeholders in endpoint URL
 */
const replacePlaceholders = (endpoint, context) => {
  let result = endpoint;
  
  // Replace common placeholders
  const placeholders = {
    '{studyId}': context.studyId,
    '{siteId}': context.siteId,
    '{subjectId}': context.subjectId,
    '{visitId}': context.visitId,
    '{formId}': context.formId
  };
  
  Object.entries(placeholders).forEach(([placeholder, value]) => {
    if (value !== undefined && value !== null) {
      result = result.replace(placeholder, value);
    }
  });
  
  return result;
};

/**
 * Generate cache key
 */
const generateCacheKey = (fieldId, optionSource, context) => {
  const parts = [
    'options',
    fieldId,
    optionSource.type,
    optionSource.category || '',
    optionSource.endpoint || '',
    context.studyId || '',
    context.siteId || '',
    optionSource.filter || ''
  ];
  
  return parts.filter(p => p).join('_');
};

/**
 * Get cached options if not expired
 */
const getCachedOptions = (cacheKey, cacheDuration) => {
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
const cacheOptions = (cacheKey, options) => {
  optionCache.set(cacheKey, {
    data: options,
    timestamp: Date.now()
  });
  
  console.log(`[OptionLoader] Cached ${options.length} options with key: ${cacheKey}`);
};

/**
 * Clear all cached options
 */
export const clearOptionCache = () => {
  optionCache.clear();
  console.log('[OptionLoader] Cleared all cached options');
};

/**
 * Clear cache for specific field
 */
export const clearFieldCache = (fieldId) => {
  const keys = Array.from(optionCache.keys());
  const removed = keys.filter(key => key.includes(fieldId));
  
  removed.forEach(key => optionCache.delete(key));
  
  console.log(`[OptionLoader] Cleared cache for field ${fieldId} (${removed.length} entries)`);
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  const stats = {
    totalEntries: optionCache.size,
    entries: []
  };
  
  optionCache.forEach((value, key) => {
    const age = Date.now() - value.timestamp;
    stats.entries.push({
      key,
      optionCount: value.data.length,
      ageSeconds: Math.floor(age / 1000),
      timestamp: new Date(value.timestamp).toISOString()
    });
  });
  
  return stats;
};

export default {
  loadFieldOptions,
  clearOptionCache,
  clearFieldCache,
  getCacheStats
};
