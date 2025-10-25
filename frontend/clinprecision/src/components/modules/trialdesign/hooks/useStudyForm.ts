import { useState, useCallback, useMemo } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface StudyFormData {
  // Basic Study Information
  name: string;
  protocolNumber: string;
  studyPhaseId: string | number;
  sponsor: string;
  description: string;
  organizationId: number | null;
  
  // Timeline Information
  studyStatusId: string | number;
  plannedStartDate: string;
  plannedEndDate: string;
  estimatedDuration: string;
  
  // Personnel Information
  principalInvestigator: string;
  studyCoordinator: string;
  medicalMonitor: string;
  
  // Organization Associations
  organizations: Array<{ organizationId: number; role: string; isPrimary: boolean }>;
  
  // Study Configuration
  studyType: 'interventional' | 'observational';
  primaryObjective: string;
  secondaryObjectives: string[];
  
  // Regulatory Information
  regulatoryStatusId: string | number;
  ethicsApproval: boolean;
  fdaInd: boolean;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message?: string;
  validate?: (value: any, allData: StudyFormData) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface FormErrors {
  [key: string]: string | null;
}

export interface FormTouched {
  [key: string]: boolean;
}

export interface UseStudyFormReturn {
  // Data
  formData: StudyFormData;
  errors: FormErrors;
  touched: FormTouched;
  
  // Computed states
  isValid: boolean;
  isDirty: boolean;
  
  // Actions
  updateField: (fieldName: keyof StudyFormData, value: any) => void;
  updateFields: (updates: Partial<StudyFormData>) => void;
  validateForm: () => boolean;
  validateField: (fieldName: string, value: any, allData?: StudyFormData) => string | null;
  resetForm: () => void;
  
  // Helpers
  getFieldError: (fieldName: string) => string | null;
  hasFieldError: (fieldName: string) => boolean;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Custom hook for managing study form state and validation
 * 
 * @param initialData - Initial form data
 * @returns Study form state and methods
 */
export const useStudyForm = (initialData: Partial<StudyFormData> = {}): UseStudyFormReturn => {
  const [formData, setFormData] = useState<StudyFormData>({
    // Basic Study Information
    name: '',
    protocolNumber: '',
    studyPhaseId: '',
    sponsor: '',
    description: '',
    organizationId: null,
    
    // Timeline Information
    studyStatusId: '',
    plannedStartDate: '',
    plannedEndDate: '',
    estimatedDuration: '',
    
    // Personnel Information
    principalInvestigator: '',
    studyCoordinator: '',
    medicalMonitor: '',
    
    // Organization Associations
    organizations: [],
    
    // Study Configuration
    studyType: 'interventional',
    primaryObjective: '',
    secondaryObjectives: [],
    
    // Regulatory Information
    regulatoryStatusId: '',
    ethicsApproval: false,
    fdaInd: false,
    
    ...initialData
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});

  // Validation rules
  const validationRules: ValidationRules = {
    name: {
      required: true,
      minLength: 3,
      maxLength: 255,
      message: 'Study name must be between 3 and 255 characters'
    },
    protocolNumber: {
      required: true,
      pattern: /^[A-Z0-9-]+$/,
      message: 'Protocol number must contain only uppercase letters, numbers, and hyphens'
    },
    studyPhaseId: {
      required: true,
      message: 'Study phase is required'
    },
    organizationId: {
      required: true,
      message: 'Owning organization is required'
    },
    studyStatusId: {
      required: true,
      message: 'Study status is required'
    },
    regulatoryStatusId: {
      required: false,
      message: 'Regulatory status is required'
    },
    sponsor: {
      required: true,
      message: 'Sponsor is required'
    },
    principalInvestigator: {
      required: true,
      message: 'Principal Investigator is required'
    },
    plannedStartDate: {
      required: false,
      validate: (value, allData) => {
        if (value && allData.plannedEndDate && new Date(value) >= new Date(allData.plannedEndDate)) {
          return 'Planned start date must be before planned end date';
        }
        return null;
      }
    },
    plannedEndDate: {
      required: false,
      validate: (value, allData) => {
        if (value && allData.plannedStartDate && new Date(value) <= new Date(allData.plannedStartDate)) {
          return 'Planned end date must be after planned start date';
        }
        return null;
      }
    }
  };

  // Validate a single field
  const validateField = useCallback((fieldName: string, value: any, allData: StudyFormData = formData): string | null => {
    const rule = validationRules[fieldName];
    if (!rule) return null;

    // Required validation
    if (rule.required && (!value || value.toString().trim() === '')) {
      return rule.message || `${fieldName} is required`;
    }

    // Skip other validations if field is empty and not required
    if (!value) return null;

    // Length validations
    if (rule.minLength && value.length < rule.minLength) {
      return rule.message || `${fieldName} must be at least ${rule.minLength} characters`;
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      return rule.message || `${fieldName} must be no more than ${rule.maxLength} characters`;
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      return rule.message || `${fieldName} format is invalid`;
    }

    // Custom validation
    if (rule.validate) {
      return rule.validate(value, allData);
    }

    return null;
  }, [formData]);

  // Validate all fields
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, (formData as any)[fieldName], formData);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);

  // Update a single field
  const updateField = useCallback((fieldName: keyof StudyFormData, value: any): void => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));

    // Validate field if it has been touched
    if (touched[fieldName as string] || value) {
      const error = validateField(fieldName as string, value, { ...formData, [fieldName]: value });
      setErrors(prev => ({
        ...prev,
        [fieldName]: error
      }));
    }
  }, [formData, touched, validateField]);

  // Update multiple fields at once
  const updateFields = useCallback((updates: Partial<StudyFormData>): void => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }));

    // Mark updated fields as touched
    const updatedFieldNames = Object.keys(updates);
    setTouched(prev => ({
      ...prev,
      ...updatedFieldNames.reduce<FormTouched>((acc, field) => ({ ...acc, [field]: true }), {})
    }));

    // Validate updated fields
    const newErrors = { ...errors };
    updatedFieldNames.forEach(fieldName => {
      const error = validateField(fieldName, (updates as any)[fieldName], { ...formData, ...updates });
      if (error) {
        newErrors[fieldName] = error;
      } else {
        delete newErrors[fieldName];
      }
    });
    setErrors(newErrors);
  }, [formData, errors, validateField]);

  // Reset form
  const resetForm = useCallback((): void => {
    setFormData({
      name: '',
      protocolNumber: '',
      studyPhaseId: '',
      sponsor: '',
      description: '',
      organizationId: null,
      studyStatusId: '',
      plannedStartDate: '',
      plannedEndDate: '',
      estimatedDuration: '',
      principalInvestigator: '',
      studyCoordinator: '',
      medicalMonitor: '',
      organizations: [],
      studyType: 'interventional',
      primaryObjective: '',
      secondaryObjectives: [],
      regulatoryStatusId: '',
      ethicsApproval: false,
      fdaInd: false,
      ...initialData
    });
    setErrors({});
    setTouched({});
  }, [initialData]);

  // Check if form is valid (validate all required fields, not just touched ones)
  const isValid = useMemo(() => {
    const validationErrors: FormErrors = {};
    Object.keys(validationRules).forEach(fieldName => {
      const rule = validationRules[fieldName];
      const value = (formData as any)[fieldName];
      
      // Check required fields regardless of touched status
      if (rule.required && (!value || value.toString().trim() === '')) {
        validationErrors[fieldName] = rule.message || `${fieldName} is required`;
        return;
      }
      
      // Skip other validations if field is empty and not required
      if (!value) return;
      
      // Run other validations
      const error = validateField(fieldName, value, formData);
      if (error) {
        validationErrors[fieldName] = error;
      }
    });
    
    return Object.keys(validationErrors).length === 0;
  }, [formData, validateField]);

  // Check if form has been modified
  const isDirty = Object.keys(touched).length > 0;

  // Get error for a specific field
  const getFieldError = useCallback((fieldName: string): string | null => {
    return touched[fieldName] ? errors[fieldName] || null : null;
  }, [touched, errors]);

  // Check if a field has an error
  const hasFieldError = useCallback((fieldName: string): boolean => {
    return Boolean(touched[fieldName] && errors[fieldName]);
  }, [touched, errors]);

  return {
    // Data
    formData,
    errors,
    touched,
    
    // Computed states
    isValid,
    isDirty,
    
    // Actions
    updateField,
    updateFields,
    validateForm,
    validateField,
    resetForm,
    
    // Helpers
    getFieldError,
    hasFieldError
  };
};

export default useStudyForm;
