import { useState, useCallback, useMemo, useRef, useEffect } from 'react';

/**
 * Enhanced form validation hook with real-time validation, progressive feedback,
 * and intelligent validation scheduling
 */
export const useEnhancedFormValidation = (initialData = {}, validationConfig = {}) => {
    const [formData, setFormData] = useState(initialData);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [validationStatus, setValidationStatus] = useState({}); // 'idle', 'validating', 'valid', 'invalid'
    const [validationMode, setValidationMode] = useState('progressive'); // 'progressive', 'realtime', 'onBlur', 'onSubmit'
    const [fieldFocus, setFieldFocus] = useState({});
    
    const validationTimers = useRef({});
    const validationCache = useRef({});

    const {
        rules = {},
        debounceMs = 300,
        enableProgressiveValidation = true,
        enableRealTimeValidation = true,
        cacheValidation = true
    } = validationConfig;

    // Progressive validation rules - validate fields as user progresses through form
    const getProgressiveValidationRules = useCallback((fieldName) => {
        const baseRules = rules[fieldName] || {};
        const progressiveRules = {};

        // Only validate touched fields in progressive mode
        if (validationMode === 'progressive' && !touched[fieldName]) {
            return {};
        }

        // Start with basic validation first
        if (baseRules.required) {
            progressiveRules.required = baseRules.required;
        }

        // Add format validation only after basic validation passes
        if (formData[fieldName] && !errors[fieldName]) {
            if (baseRules.pattern) {
                progressiveRules.pattern = baseRules.pattern;
            }
            if (baseRules.minLength) {
                progressiveRules.minLength = baseRules.minLength;
            }
            if (baseRules.maxLength) {
                progressiveRules.maxLength = baseRules.maxLength;
            }
        }

        // Add complex validation only after format validation passes
        if (formData[fieldName] && !errors[fieldName] && validationStatus[fieldName] === 'valid') {
            if (baseRules.custom) {
                progressiveRules.custom = baseRules.custom;
            }
            if (baseRules.async) {
                progressiveRules.async = baseRules.async;
            }
        }

        return progressiveRules;
    }, [validationMode, touched, formData, errors, validationStatus, rules]);

    // Enhanced validation function
    const validateField = useCallback(async (fieldName, value, allData = formData) => {
        const fieldRules = getProgressiveValidationRules(fieldName);
        
        if (Object.keys(fieldRules).length === 0) {
            return null;
        }

        // Check cache first
        const cacheKey = `${fieldName}-${value}`;
        if (cacheValidation && validationCache.current[cacheKey]) {
            return validationCache.current[cacheKey];
        }

        setValidationStatus(prev => ({ ...prev, [fieldName]: 'validating' }));

        try {
            let error = null;

            // Required validation
            if (fieldRules.required && (!value || value.toString().trim() === '')) {
                error = typeof fieldRules.required === 'string' ? fieldRules.required : `${fieldName} is required`;
            }

            // Skip other validations if field is empty and not required
            if (!value && !fieldRules.required) {
                setValidationStatus(prev => ({ ...prev, [fieldName]: 'idle' }));
                return null;
            }

            // Length validations
            if (!error && fieldRules.minLength && value.length < fieldRules.minLength) {
                error = `Must be at least ${fieldRules.minLength} characters`;
            }

            if (!error && fieldRules.maxLength && value.length > fieldRules.maxLength) {
                error = `Must be no more than ${fieldRules.maxLength} characters`;
            }

            // Pattern validation
            if (!error && fieldRules.pattern && !fieldRules.pattern.test(value)) {
                error = fieldRules.message || 'Invalid format';
            }

            // Custom validation
            if (!error && fieldRules.custom) {
                const customResult = await fieldRules.custom(value, allData);
                if (customResult !== true) {
                    error = typeof customResult === 'string' ? customResult : 'Invalid value';
                }
            }

            // Async validation
            if (!error && fieldRules.async) {
                try {
                    const asyncResult = await fieldRules.async(value, allData);
                    if (asyncResult !== true) {
                        error = typeof asyncResult === 'string' ? asyncResult : 'Validation failed';
                    }
                } catch (asyncError) {
                    error = 'Validation error occurred';
                }
            }

            // Cache result
            if (cacheValidation) {
                validationCache.current[cacheKey] = error;
            }

            setValidationStatus(prev => ({ 
                ...prev, 
                [fieldName]: error ? 'invalid' : 'valid' 
            }));

            return error;
        } catch (err) {
            setValidationStatus(prev => ({ ...prev, [fieldName]: 'invalid' }));
            return 'Validation error occurred';
        }
    }, [formData, getProgressiveValidationRules, cacheValidation]);

    // Debounced validation for real-time validation
    const debouncedValidateField = useCallback((fieldName, value, allData) => {
        // Clear existing timer
        if (validationTimers.current[fieldName]) {
            clearTimeout(validationTimers.current[fieldName]);
        }

        // Set new timer
        validationTimers.current[fieldName] = setTimeout(async () => {
            const error = await validateField(fieldName, value, allData);
            setErrors(prev => ({
                ...prev,
                [fieldName]: error
            }));
        }, debounceMs);
    }, [validateField, debounceMs]);

    // Update field value with intelligent validation
    const updateField = useCallback((fieldName, value, options = {}) => {
        const { 
            shouldValidate = enableRealTimeValidation,
            markTouched = true,
            triggerMode = validationMode 
        } = options;

        // Update form data
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));

        // Mark field as touched
        if (markTouched) {
            setTouched(prev => ({
                ...prev,
                [fieldName]: true
            }));
        }

        // Trigger validation based on mode
        if (shouldValidate) {
            const allData = { ...formData, [fieldName]: value };
            
            switch (triggerMode) {
                case 'realtime':
                    debouncedValidateField(fieldName, value, allData);
                    break;
                case 'progressive':
                    if (touched[fieldName] || markTouched) {
                        debouncedValidateField(fieldName, value, allData);
                    }
                    break;
                case 'onBlur':
                    // Validation will be triggered on blur
                    break;
                case 'onSubmit':
                    // Validation will be triggered on form submission
                    break;
            }
        }
    }, [formData, touched, validationMode, enableRealTimeValidation, debouncedValidateField]);

    // Handle field focus
    const handleFieldFocus = useCallback((fieldName) => {
        setFieldFocus(prev => ({
            ...prev,
            [fieldName]: true
        }));
    }, []);

    // Handle field blur with validation
    const handleFieldBlur = useCallback(async (fieldName) => {
        setFieldFocus(prev => ({
            ...prev,
            [fieldName]: false
        }));

        if (validationMode === 'onBlur' || validationMode === 'progressive') {
            const error = await validateField(fieldName, formData[fieldName]);
            setErrors(prev => ({
                ...prev,
                [fieldName]: error
            }));
        }
    }, [validationMode, validateField, formData]);

    // Validate entire form
    const validateForm = useCallback(async () => {
        const newErrors = {};
        const validationPromises = Object.keys(rules).map(async (fieldName) => {
            const error = await validateField(fieldName, formData[fieldName]);
            if (error) {
                newErrors[fieldName] = error;
            }
        });

        await Promise.all(validationPromises);
        setErrors(newErrors);
        
        // Mark all fields as touched
        setTouched(Object.keys(rules).reduce((acc, field) => ({
            ...acc,
            [field]: true
        }), {}));

        return Object.keys(newErrors).length === 0;
    }, [rules, validateField, formData]);

    // Get field validation state
    const getFieldValidationState = useCallback((fieldName) => {
        return {
            error: touched[fieldName] ? errors[fieldName] : null,
            isValid: touched[fieldName] && !errors[fieldName] && formData[fieldName],
            isValidating: validationStatus[fieldName] === 'validating',
            isTouched: touched[fieldName],
            isFocused: fieldFocus[fieldName]
        };
    }, [errors, touched, formData, validationStatus, fieldFocus]);

    // Get suggestions for field based on current value and validation rules
    const getFieldSuggestions = useCallback((fieldName) => {
        const rule = rules[fieldName];
        const currentValue = formData[fieldName] || '';
        
        if (!rule || !rule.suggestions) return [];
        
        if (typeof rule.suggestions === 'function') {
            return rule.suggestions(currentValue, formData);
        }
        
        return rule.suggestions.filter(suggestion =>
            suggestion.toLowerCase().includes(currentValue.toLowerCase())
        );
    }, [rules, formData]);

    // Form validity check
    const isFormValid = useMemo(() => {
        // Check if all required fields are filled and valid
        const requiredFields = Object.keys(rules).filter(field => rules[field].required);
        
        return requiredFields.every(field => {
            const value = formData[field];
            const hasValue = value !== undefined && value !== null && value.toString().trim() !== '';
            const hasNoError = !errors[field];
            return hasValue && hasNoError;
        });
    }, [formData, errors, rules]);

    // Form completion percentage
    const completionPercentage = useMemo(() => {
        const totalFields = Object.keys(rules).length;
        if (totalFields === 0) return 100;

        const completedFields = Object.keys(rules).filter(field => {
            const value = formData[field];
            const hasValue = value !== undefined && value !== null && value.toString().trim() !== '';
            const hasNoError = !errors[field];
            return hasValue && hasNoError;
        }).length;

        return Math.round((completedFields / totalFields) * 100);
    }, [formData, errors, rules]);

    // Reset form
    const resetForm = useCallback(() => {
        setFormData(initialData);
        setErrors({});
        setTouched({});
        setValidationStatus({});
        setFieldFocus({});
        
        // Clear timers and cache
        Object.values(validationTimers.current).forEach(clearTimeout);
        validationTimers.current = {};
        validationCache.current = {};
    }, [initialData]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            Object.values(validationTimers.current).forEach(clearTimeout);
        };
    }, []);

    return {
        // Data
        formData,
        errors,
        touched,
        validationStatus,
        fieldFocus,
        
        // Computed states
        isFormValid,
        completionPercentage,
        
        // Actions
        updateField,
        validateField,
        validateForm,
        resetForm,
        
        // Event handlers
        handleFieldFocus,
        handleFieldBlur,
        
        // Helpers
        getFieldValidationState,
        getFieldSuggestions,
        
        // Configuration
        validationMode,
        setValidationMode
    };
};

export default useEnhancedFormValidation;