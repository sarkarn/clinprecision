/**
 * API Type Definitions
 * Types for API services, HTTP communication, and external integrations
 */

import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';


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
 * Option source configuration
 */
export interface OptionSource {
  type: OptionSourceType;
  category?: string;
  endpoint?: string;
  filter?: string;
  queryParams?: string;
  valueField?: string;
  labelField?: string;
  cacheable?: boolean;
  cacheDuration?: number;
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
 * Cached option entry
 */
export interface CachedOptions {
  data: any[];
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
  loadFieldOptions(field: any, context?: OptionLoadContext): Promise<any[]>;
  clearOptionCache(): void;
  clearFieldCache(fieldId: string): void;
  getCacheStats(): CacheStats;
}

/*
 * Computation complete data
 */
export interface ComputationCompleteData {
  studyId: string;
  computationType: string;
  result: any;
  duration: number;
  timestamp: string;
}

