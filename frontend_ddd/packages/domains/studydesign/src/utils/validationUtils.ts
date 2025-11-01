/**
 * Form validation utilities and predefined validation rules
 * for clinical trial management forms
 */

/**
 * Validation pattern type
 */


export interface ValidationPatterns {
  email: RegExp;
  phone: RegExp;
  protocolNumber: RegExp;
  postCode: RegExp;
  url: RegExp;
  alphanumeric: RegExp;
  numeric: RegExp;
  decimal: RegExp;
  icd10: RegExp;
  medDRA: RegExp;
}

/**
 * Validation rule configuration
 */
export interface ValidationRule {
  required?: string | boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message?: string;
  custom?: (value: any, formData?: any) => boolean | string | Promise<boolean | string>;
  async?: (value: any) => Promise<boolean | string>;
  suggestions?: string[] | ((currentValue: any, formData: any) => string[]);
}

/**
 * Form validation configuration
 */
export interface FormValidationConfig {
  rules: Record<string, ValidationRule>;
  debounceMs?: number;
  enableProgressiveValidation?: boolean;
  enableRealTimeValidation?: boolean;
}

/**
 * Form readiness calculation result
 */
export interface FormReadiness {
  requiredCompletion: number;
  overallCompletion: number;
  readyForSubmission: boolean;
}

/**
 * Form data type (generic object with string keys)
 */
export type FormData = Record<string, any>;

// Common validation patterns
export const validationPatterns: ValidationPatterns = {
  email: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  protocolNumber: /^[A-Z0-9-]+$/,
  postCode: /^[A-Z0-9]{3,10}$/i,
  url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  numeric: /^\d+$/,
  decimal: /^\d+(\.\d+)?$/,
  icd10: /^[A-Z]\d{2}(\.[A-Z0-9]{1,4})?$/,
  medDRA: /^\d{8}$/
};

// Predefined validation rules for common clinical fields
export const clinicalValidationRules: Record<string, ValidationRule> = {
  studyName: {
    required: 'Study name is required',
    minLength: 3,
    maxLength: 255,
    suggestions: [
      'Phase I Safety Study of [Drug Name]',
      'Phase II Efficacy Study of [Drug Name] in [Indication]',
      'Phase III Randomized Study Comparing [Drug A] vs [Drug B]',
      'Biomarker Validation Study for [Disease]',
      'Long-term Safety Extension Study'
    ]
  },

  protocolNumber: {
    required: 'Protocol number is required',
    pattern: validationPatterns.protocolNumber,
    message: 'Protocol number must contain only uppercase letters, numbers, and hyphens',
    custom: async (value: string): Promise<boolean | string> => {
      // Check for duplicate protocol numbers
      if (value.length < 6) {
        return 'Protocol number should be at least 6 characters';
      }
      return true;
    },
    suggestions: (currentValue: any, formData: FormData): string[] => {
      const prefix = formData.sponsor ? formData.sponsor.substring(0, 3).toUpperCase() : 'PRO';
      const year = new Date().getFullYear();
      return [
        `${prefix}-${year}-001`,
        `${prefix}-${year}-002`,
        `${prefix}-${year}-003`
      ];
    }
  },

  principalInvestigator: {
    required: 'Principal Investigator is required',
    minLength: 2,
    maxLength: 100,
    pattern: /^[A-Za-z\s\.\,\-\']+$/,
    message: 'Principal Investigator name contains invalid characters',
    suggestions: [
      'Dr. John Smith, MD',
      'Dr. Sarah Johnson, MD, PhD',
      'Prof. Michael Brown, MD'
    ]
  },

  sponsor: {
    required: 'Sponsor is required',
    minLength: 2,
    maxLength: 200,
    suggestions: [
      'Pharmaceutical Company Inc.',
      'Academic Medical Center',
      'National Institutes of Health',
      'Contract Research Organization'
    ]
  },

  studyPhase: {
    required: 'Study phase is required',
    custom: (value: string): boolean | string => {
      const validPhases = ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4', 'Phase 1/2', 'Phase 2/3'];
      return validPhases.includes(value) ? true : 'Please select a valid study phase';
    }
  },

  description: {
    minLength: 10,
    maxLength: 2000,
    custom: (value: string): boolean | string => {
      if (value && value.length < 50) {
        return 'Study description should be more detailed (at least 50 characters)';
      }
      return true;
    }
  },

  email: {
    pattern: validationPatterns.email,
    message: 'Please enter a valid email address',
    async: async (value: string): Promise<boolean | string> => {
      // Simulate email validation
      if (value.includes('tempmail') || value.includes('10minutemail')) {
        return 'Temporary email addresses are not allowed';
      }
      return true;
    }
  },

  startDate: {
    custom: (value: string, formData?: FormData): boolean | string => {
      if (!value) return true;
      
      const startDate = new Date(value);
      const today = new Date();
      
      if (startDate < today) {
        return 'Start date cannot be in the past';
      }
      
      if (formData?.endDate) {
        const endDate = new Date(formData.endDate);
        if (startDate >= endDate) {
          return 'Start date must be before end date';
        }
      }
      
      return true;
    }
  },

  endDate: {
    custom: (value: string, formData?: FormData): boolean | string => {
      if (!value) return true;
      
      const endDate = new Date(value);
      
      if (formData?.startDate) {
        const startDate = new Date(formData.startDate);
        if (endDate <= startDate) {
          return 'End date must be after start date';
        }
        
        // Check for reasonable study duration
        const diffMonths = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
        if (diffMonths > 120) { // 10 years
          return 'Study duration seems unusually long. Please verify dates.';
        }
      }
      
      return true;
    }
  },

  enrollmentTarget: {
    pattern: validationPatterns.numeric,
    message: 'Enrollment target must be a number',
    custom: (value: string | number): boolean | string => {
      const num = typeof value === 'string' ? parseInt(value) : value;
      if (num < 1) {
        return 'Enrollment target must be at least 1';
      }
      if (num > 10000) {
        return 'Enrollment target seems unusually high. Please verify.';
      }
      return true;
    }
  }
};

// Form-specific validation configurations
export const formValidationConfigs: Record<string, FormValidationConfig> = {
  studyRegistration: {
    rules: {
      name: clinicalValidationRules.studyName,
      protocolNumber: clinicalValidationRules.protocolNumber,
      studyPhaseId: clinicalValidationRules.studyPhase,
      sponsor: clinicalValidationRules.sponsor,
      principalInvestigator: clinicalValidationRules.principalInvestigator,
      description: clinicalValidationRules.description,
      startDate: clinicalValidationRules.startDate,
      endDate: clinicalValidationRules.endDate
    },
    debounceMs: 300,
    enableProgressiveValidation: true,
    enableRealTimeValidation: true
  },

  crf: {
    rules: {
      fieldName: {
        required: 'Field name is required',
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
        message: 'Field name must start with a letter and contain only letters, numbers, and underscores'
      },
      label: {
        required: 'Field label is required',
        minLength: 2,
        maxLength: 100
      },
      dataType: {
        required: 'Data type is required'
      }
    },
    debounceMs: 200,
    enableProgressiveValidation: true
  },

  userProfile: {
    rules: {
      firstName: {
        required: 'First name is required',
        minLength: 2,
        maxLength: 50,
        pattern: /^[A-Za-z\s\-\']+$/,
        message: 'First name contains invalid characters'
      },
      lastName: {
        required: 'Last name is required',
        minLength: 2,
        maxLength: 50,
        pattern: /^[A-Za-z\s\-\']+$/,
        message: 'Last name contains invalid characters'
      },
      email: clinicalValidationRules.email,
      phone: {
        pattern: validationPatterns.phone,
        message: 'Please enter a valid phone number'
      }
    }
  }
};

// Validation helper functions
export const validationHelpers = {
  /**
   * Check if a date is in valid range for clinical trials
   */
  isValidStudyDate: (dateString: string, minDate: string | null = null, maxDate: string | null = null): boolean => {
    if (!dateString) return true;
    
    const date = new Date(dateString);
    const today = new Date();
    
    if (isNaN(date.getTime())) return false;
    
    if (minDate && date < new Date(minDate)) return false;
    if (maxDate && date > new Date(maxDate)) return false;
    
    // Clinical trials typically don't go beyond 20 years
    const maxFutureDate = new Date();
    maxFutureDate.setFullYear(today.getFullYear() + 20);
    
    return date <= maxFutureDate;
  },

  /**
   * Validate protocol number format and check for duplicates
   */
  validateProtocolNumber: async (protocolNumber: string, existingProtocols: string[] = []): Promise<string | null> => {
    if (!protocolNumber) return 'Protocol number is required';
    
    if (!validationPatterns.protocolNumber.test(protocolNumber)) {
      return 'Protocol number must contain only uppercase letters, numbers, and hyphens';
    }
    
    if (protocolNumber.length < 6) {
      return 'Protocol number should be at least 6 characters';
    }
    
    if (existingProtocols.includes(protocolNumber)) {
      return 'This protocol number is already in use';
    }
    
    return null;
  },

  /**
   * Generate smart suggestions based on form context
   */
  generateSmartSuggestions: (fieldName: string, currentValue: any, formData: FormData): string[] => {
    switch (fieldName) {
      case 'protocolNumber':
        return generateProtocolSuggestions(formData);
      case 'studyName':
        return generateStudyNameSuggestions(formData);
      default:
        return [];
    }
  },

  /**
   * Validate form completion percentage for progressive disclosure
   */
  calculateFormReadiness: (formData: FormData, validationRules: Record<string, ValidationRule>): FormReadiness => {
    const requiredFields = Object.keys(validationRules).filter(
      field => validationRules[field].required
    );
    
    const completedRequired = requiredFields.filter(
      field => formData[field] && formData[field].toString().trim() !== ''
    ).length;
    
    const totalFields = Object.keys(formData).length;
    const completedTotal = Object.keys(formData).filter(
      field => formData[field] && formData[field].toString().trim() !== ''
    ).length;
    
    return {
      requiredCompletion: (completedRequired / requiredFields.length) * 100,
      overallCompletion: (completedTotal / totalFields) * 100,
      readyForSubmission: completedRequired === requiredFields.length
    };
  }
};

// Helper functions for smart suggestions
const generateProtocolSuggestions = (formData: FormData): string[] => {
  const year = new Date().getFullYear();
  const prefix = formData.sponsor 
    ? formData.sponsor.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '')
    : 'PRO';
  
  return [
    `${prefix}-${year}-001`,
    `${prefix}-${year}-002`,
    `${prefix}-${year}-003`,
    `${prefix}${year}001`,
    `${prefix}${year}002`
  ];
};

const generateStudyNameSuggestions = (formData: FormData): string[] => {
  const phase = formData.studyPhaseId || '[Phase]';
  const indication = formData.indication || '[Indication]';
  
  return [
    `${phase} Safety Study of [Drug Name]`,
    `${phase} Efficacy Study of [Drug Name] in ${indication}`,
    `${phase} Randomized Controlled Trial of [Drug Name]`,
    `Open-label ${phase} Study of [Drug Name]`,
    `Double-blind ${phase} Study of [Drug Name] vs Placebo`
  ];
};

// Export validation configurations for easy import
export default {
  patterns: validationPatterns,
  rules: clinicalValidationRules,
  configs: formValidationConfigs,
  helpers: validationHelpers
};
