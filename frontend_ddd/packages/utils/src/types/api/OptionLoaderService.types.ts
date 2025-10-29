// src/types/api/OptionLoaderService.types.ts

/**
 * Option source types
 */
export enum OptionSourceType {
  STATIC = 'STATIC',
  CODE_LIST = 'CODE_LIST',
  STUDY_DATA = 'STUDY_DATA',
  API = 'API',
  EXTERNAL_STANDARD = 'EXTERNAL_STANDARD',
}

/**
 * Standard option format
 */
export interface SelectOption {
  value: string | number;
  label: string;
  description?: string;
  order?: number;
  codingValue?: string;
  codingSystem?: string;
  [key: string]: any; // Allow additional properties
}

/**
 * Option source configuration
 */
export interface OptionSource {
  type: OptionSourceType;
  category?: string; // For CODE_LIST and EXTERNAL_STANDARD
  endpoint?: string; // For STUDY_DATA, API
  filter?: string; // Query filter
  queryParams?: string; // Additional query parameters
  valueField?: string; // Field to use as value (default: varies by type)
  labelField?: string; // Field to use as label (default: varies by type)
  cacheable?: boolean; // Whether to cache options (default: true)
  cacheDuration?: number; // Cache duration in seconds (default: 3600)
}

/**
 * Field metadata for UI configuration
 */
export interface FieldUIConfig {
  optionSource?: OptionSource;
  options?: SelectOption[]; // Static options
  [key: string]: any;
}

/**
 * Field metadata
 */
export interface FieldMetadata {
  uiConfig?: FieldUIConfig;
  options?: SelectOption[]; // Alternative location for static options
  codeListCategory?: string; // Simplified code list format
  [key: string]: any;
}

/**
 * Field definition
 */
export interface FieldDefinition {
  id: string;
  metadata?: FieldMetadata;
  options?: SelectOption[]; // Old format for backward compatibility
  [key: string]: any;
}

/**
 * Context data for loading options
 */
export interface OptionLoadContext {
  studyId?: string | number;
  siteId?: string | number;
  subjectId?: string | number;
  visitId?: string | number;
  formId?: string | number;
  [key: string]: any;
}

/**
 * Code list item (API response format)
 */
export interface CodeListItem {
  code?: string;
  value?: string;
  id?: string;
  displayName?: string;
  name?: string;
  label?: string;
  description?: string;
  displayOrder?: number;
  order?: number;
  [key: string]: any;
}

/**
 * Cached option entry
 */
export interface CachedOptions {
  data: SelectOption[];
  timestamp: number;
}

/**
 * Cache statistics entry
 */
export interface CacheEntry {
  key: string;
  optionCount: number;
  ageSeconds: number;
  timestamp: string;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  totalEntries: number;
  entries: CacheEntry[];
}

/**
 * Option loader service interface
 */
export interface IOptionLoaderService {
  loadFieldOptions(field: FieldDefinition, context?: OptionLoadContext): Promise<SelectOption[]>;
  clearOptionCache(): void;
  clearFieldCache(fieldId: string): void;
  getCacheStats(): CacheStats;
}

/**
 * Placeholder mapping for endpoint URLs
 */
export interface PlaceholderMapping {
  '{studyId}'?: string | number;
  '{siteId}'?: string | number;
  '{subjectId}'?: string | number;
  '{visitId}'?: string | number;
  '{formId}'?: string | number;
}
