// Barrel file for hooks

export * from './business/useCodeList';
export * from './ui/useDebounce';
export * from './business/useRoleBasedNavigation';
export * from './business/useStatusSynchronization';

// Study hooks
export * from './api/studies/useStudy';
export * from './api/studies/useStudyForm';
export * from './api/studies/useStudyNavigation';
export * from './api/studies/useStudyVersioning';
export * from './api/studies/useProtocolVersioning';
export * from './api/studies/useDashboardMetrics';
export * from './api/studies/useWizardNavigation';

// Database build hooks
export * from './api/database-build/useStudyDatabaseBuilds';
export * from './api/database-build/useBuildActions';
export * from './api/database-build/useBuildStatus';



// ...existing code...

// Form hooks
export { useEnhancedFormValidation } from './form/useEnhancedFormValidation';
// If you need the types, use aliases:
export type {
  ValidationMode as EnhancedValidationMode,
  ValidationStatus as EnhancedValidationStatus,
  ValidationRule as EnhancedValidationRule,
  ValidationRules as EnhancedValidationRules,
  ValidationConfig as EnhancedValidationConfig,
  UpdateFieldOptions as EnhancedUpdateFieldOptions,
  FieldValidationState as EnhancedFieldValidationState,
  FormValidationState as EnhancedFormValidationState,
  FormErrors as EnhancedFormErrors,
  FormTouched as EnhancedFormTouched,
  FormFocus as EnhancedFormFocus,
  UseEnhancedFormValidationReturn
} from './form/useEnhancedFormValidation';