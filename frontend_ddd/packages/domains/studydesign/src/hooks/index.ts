/**
 * Trial Design module hooks barrel export
 * Centralized export for all Trial Design hooks
 */

// Protocol and Study Versioning
export { default as useProtocolVersioning } from './useProtocolVersioning';
export { default as useStudyVersioning } from './useStudyVersioning';

// Form Management
export { default as useEnhancedFormValidation } from './useEnhancedFormValidation';
export { default as useStudyForm } from './useStudyForm';

// Data Grid
export { default as useDataGrid } from './useDataGrid';

// Navigation (uses named export)
export { useStudyNavigation } from './useStudyNavigation';

// Metrics (uses named export)
export { useDashboardMetrics } from './useDashboardMetrics';

// Wizard
export { default as useWizardNavigation } from './useWizardNavigation';

// Re-export types
export type { UseProtocolVersioningReturn } from './useProtocolVersioning';
export type { UseEnhancedFormValidationReturn, ValidationMode, ValidationRule as FormValidationRule } from './useEnhancedFormValidation';
export type { UseDataGridReturn, SortDirection, SortConfig, Filters } from './useDataGrid';
export type { UseStudyVersioningReturn } from './useStudyVersioning';
export type { UseStudyFormReturn, StudyFormData } from './useStudyForm';
export type { UseStudyNavigationReturn, NavigationContext, BreadcrumbItem } from './useStudyNavigation';
export type { UseDashboardMetricsReturn, EnhancedDashboardMetrics } from './useDashboardMetrics';
export type { UseWizardNavigationReturn, StepErrors } from './useWizardNavigation';
