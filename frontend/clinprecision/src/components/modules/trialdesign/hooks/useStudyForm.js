import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook for managing study form state and validation
 */
export const useStudyForm = (initialData = {}) => {
  const [formData, setFormData] = useState({
    // Basic Study Information
    name: '',
    protocolNumber: '',
    studyPhaseId: '', // Changed from 'phase' to match backend expectation
    sponsor: '',
    description: '',
    
    // Timeline Information
    studyStatusId: '', // Changed from 'status' to match backend expectation
    startDate: '',
    endDate: '',
    estimatedDuration: '',
    
    // Personnel Information
    principalInvestigator: '',
    studyCoordinator: '',
    medicalMonitor: '',
    
    // Organization Associations
    organizations: [], // { organizationId, role, isPrimary }
    
    // Study Configuration
    studyType: 'interventional', // interventional, observational
    primaryObjective: '',
    secondaryObjectives: [],
    
    // Regulatory Information
    regulatoryStatusId: '', // Changed from 'regulatoryStatus' to match backend expectation
    ethicsApproval: false,
    fdaInd: false,
    
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation rules
  const validationRules = {
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
    startDate: {
      required: false,
      validate: (value, allData) => {
        if (value && allData.endDate && new Date(value) >= new Date(allData.endDate)) {
          return 'Start date must be before end date';
        }
        return null;
      }
    },
    endDate: {
      required: false,
      validate: (value, allData) => {
        if (value && allData.startDate && new Date(value) <= new Date(allData.startDate)) {
          return 'End date must be after start date';
        }
        return null;
      }
    }
  };

  // Validate a single field
  const validateField = useCallback((fieldName, value, allData = formData) => {
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
  const validateForm = useCallback(() => {
    const newErrors = {};
    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName], formData);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);

  // Update a single field
  const updateField = useCallback((fieldName, value) => {
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
    if (touched[fieldName] || value) {
      const error = validateField(fieldName, value, { ...formData, [fieldName]: value });
      setErrors(prev => ({
        ...prev,
        [fieldName]: error
      }));
    }
  }, [formData, touched, validateField]);

  // Update multiple fields at once
  const updateFields = useCallback((updates) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }));

    // Mark updated fields as touched
    const updatedFieldNames = Object.keys(updates);
    setTouched(prev => ({
      ...prev,
      ...updatedFieldNames.reduce((acc, field) => ({ ...acc, [field]: true }), {})
    }));

    // Validate updated fields
    const newErrors = { ...errors };
    updatedFieldNames.forEach(fieldName => {
      const error = validateField(fieldName, updates[fieldName], { ...formData, ...updates });
      if (error) {
        newErrors[fieldName] = error;
      } else {
        delete newErrors[fieldName];
      }
    });
    setErrors(newErrors);
  }, [formData, errors, validateField]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      protocolNumber: '',
      studyPhaseId: '',
      sponsor: '',
      description: '',
      studyStatusId: '',
      startDate: '',
      endDate: '',
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
    const validationErrors = {};
    Object.keys(validationRules).forEach(fieldName => {
      const rule = validationRules[fieldName];
      const value = formData[fieldName];
      
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
  }, [formData, validationRules, validateField]);

  // Check if form has been modified
  const isDirty = Object.keys(touched).length > 0;

  // Get error for a specific field
  const getFieldError = useCallback((fieldName) => {
    return touched[fieldName] ? errors[fieldName] : null;
  }, [touched, errors]);

  // Check if a field has an error
  const hasFieldError = useCallback((fieldName) => {
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
