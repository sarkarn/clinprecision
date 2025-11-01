import type { EntityStatus } from './common.types';


// ============================================================================
// Validation Types
// ============================================================================

/**
 * Generic validation error
 */
export interface ValidationError {
  field?: string;
  code?: string;
  message: string;
  severity?: 'ERROR' | 'CRITICAL' | 'WARNING' | 'INFO';
}

/**
 * Generic validation warning
 */
export interface ValidationWarning {
  field?: string;
  code?: string;
  message: string;
}

/**
 * Generic validation result
 */
export interface ValidationResult {
  isValid: boolean;
  valid?: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  timestamp?: string;
}



/**
 * Generic sort options
 */
export interface SortOptions {
  sortBy?: string;
  field?: string;
  sortDirection?: 'asc' | 'desc';
  order?: 'asc' | 'desc';
}

/**
 * Generic filter options
 */
export interface FilterOptions {
  status?: string;
  searchTerm?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  fromDate?: string;
  toDate?: string;
  [key: string]: any;
}

// ============================================================================
// Date and Time Types
// ============================================================================

/**
 * Date range
 */
export interface DateRange {
  startDate?: string;
  endDate?: string;
  fromDate?: string;
  toDate?: string;
}

// ============================================================================
// Address and Contact Types
// ============================================================================

/**
 * Address information
 */
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  address?: string; // Full address string
}

/**
 * Contact information
 */
export interface ContactInfo {
  email?: string;
  phone?: string;
  phoneNumber?: string;
  fax?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

// ============================================================================
// Service Response Types
// ============================================================================

/**
 * Service health response
 */
export interface ServiceHealthResponse {
  status: 'UP' | 'DOWN' | 'DEGRADED';
  timestamp: string;
  version?: string;
  details?: Record<string, any>;
}

/**
 * Success response
 */
export interface SuccessResponse {
  success: boolean;
  message?: string;
}

// ============================================================================
// React Hook Types
// ============================================================================

/**
 * Query hook result
 */
export interface UseQueryResult<T> {
  data?: T;
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  refetch?: () => void;
}

/**
 * Mutation hook result
 */
export interface UseMutationResult<T, V = any> {
  mutate: (variables: V) => Promise<T>;
  mutateAsync: (variables: V) => Promise<T>;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  error?: Error | null;
  data?: T;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Key-value pair
 */
export interface KeyValuePair<T = any> {
  key: string;
  value: T;
}

/**
 * Option for dropdowns/selects
 */
export interface SelectOption {
  value: string | number;
  label: string;
  description?: string;
  order?: number;
  disabled?: boolean;
  [key: string]: any;
}

/**
 * File information
 */
export interface FileInfo {
  fileName: string;
  fileSize: number;
  filePath?: string;
  contentType?: string;
  mimeType?: string;
  checksum?: string;
}

/**
 * Metadata container
 */
export interface Metadata {
  [key: string]: any;
}

// ============================================================================
// Export Type Alias
// ============================================================================

export type Status = EntityStatus | string;
