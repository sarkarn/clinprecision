import React, { createContext, useContext, useReducer, useCallback } from 'react';
import PropTypes from 'prop-types';

// Initial form state
const initialFormState = {
    formData: {},
    validationErrors: {},
    isValid: true,
    isDirty: false,
    isSaving: false,
    mode: 'entry',
    context: 'general'
};

// Form actions
const FormActions = {
    SET_FORM_DATA: 'SET_FORM_DATA',
    UPDATE_FIELD: 'UPDATE_FIELD',
    SET_VALIDATION_ERRORS: 'SET_VALIDATION_ERRORS',
    SET_SAVING: 'SET_SAVING',
    SET_DIRTY: 'SET_DIRTY',
    SET_MODE: 'SET_MODE',
    SET_CONTEXT: 'SET_CONTEXT',
    RESET_FORM: 'RESET_FORM'
};

// Form reducer
const formReducer = (state, action) => {
    switch (action.type) {
        case FormActions.SET_FORM_DATA:
            return {
                ...state,
                formData: action.payload,
                isDirty: false
            };

        case FormActions.UPDATE_FIELD:
            return {
                ...state,
                formData: {
                    ...state.formData,
                    [action.payload.fieldId]: action.payload.value
                },
                isDirty: true
            };

        case FormActions.SET_VALIDATION_ERRORS:
            return {
                ...state,
                validationErrors: action.payload,
                isValid: Object.keys(action.payload).length === 0
            };

        case FormActions.SET_SAVING:
            return {
                ...state,
                isSaving: action.payload
            };

        case FormActions.SET_DIRTY:
            return {
                ...state,
                isDirty: action.payload
            };

        case FormActions.SET_MODE:
            return {
                ...state,
                mode: action.payload
            };

        case FormActions.SET_CONTEXT:
            return {
                ...state,
                context: action.payload
            };

        case FormActions.RESET_FORM:
            return {
                ...initialFormState,
                mode: state.mode,
                context: state.context,
                ...action.payload
            };

        default:
            return state;
    }
};

// Create contexts
const FormStateContext = createContext();
const FormDispatchContext = createContext();

/**
 * FormProvider - Main form context provider
 * Manages form state, validation, and provides actions
 */
export const FormProvider = ({
    children,
    initialData = {},
    mode = 'entry',
    context = 'general',
    onDataChange,
    onValidationChange,
    formDefinition
}) => {
    const [state, dispatch] = useReducer(formReducer, {
        ...initialFormState,
        formData: initialData,
        mode,
        context
    });

    // Action creators
    const actions = {
        setFormData: useCallback((data) => {
            dispatch({ type: FormActions.SET_FORM_DATA, payload: data });
            onDataChange?.(data);
        }, [onDataChange]),

        updateField: useCallback((fieldId, value) => {
            dispatch({ type: FormActions.UPDATE_FIELD, payload: { fieldId, value } });
            const newData = { ...state.formData, [fieldId]: value };
            onDataChange?.(newData, fieldId, value);
        }, [state.formData, onDataChange]),

        setValidationErrors: useCallback((errors) => {
            dispatch({ type: FormActions.SET_VALIDATION_ERRORS, payload: errors });
            const isValid = Object.keys(errors).length === 0;
            onValidationChange?.(errors, isValid);
        }, [onValidationChange]),

        setSaving: useCallback((saving) => {
            dispatch({ type: FormActions.SET_SAVING, payload: saving });
        }, []),

        setDirty: useCallback((dirty) => {
            dispatch({ type: FormActions.SET_DIRTY, payload: dirty });
        }, []),

        setMode: useCallback((newMode) => {
            dispatch({ type: FormActions.SET_MODE, payload: newMode });
        }, []),

        setContext: useCallback((newContext) => {
            dispatch({ type: FormActions.SET_CONTEXT, payload: newContext });
        }, []),

        resetForm: useCallback((newData = {}) => {
            dispatch({ type: FormActions.RESET_FORM, payload: newData });
            onDataChange?.(newData);
        }, [onDataChange])
    };

    const value = {
        ...state,
        actions,
        formDefinition
    };

    return (
        <FormStateContext.Provider value={value}>
            <FormDispatchContext.Provider value={actions}>
                {children}
            </FormDispatchContext.Provider>
        </FormStateContext.Provider>
    );
};

/**
 * FormValidationProvider - Provides validation context
 */
export const FormValidationProvider = ({ children, validationErrors = {}, isValid = true }) => {
    const value = {
        validationErrors,
        isValid,
        hasError: (fieldId) => validationErrors[fieldId]?.length > 0,
        getErrors: (fieldId) => validationErrors[fieldId] || [],
        hasAnyErrors: () => Object.keys(validationErrors).length > 0
    };

    return (
        <FormValidationContext.Provider value={value}>
            {children}
        </FormValidationContext.Provider>
    );
};

// Validation context
const FormValidationContext = createContext({});

// Custom hooks for consuming contexts
export const useFormState = () => {
    const context = useContext(FormStateContext);
    if (!context) {
        throw new Error('useFormState must be used within a FormProvider');
    }
    return context;
};

export const useFormDispatch = () => {
    const context = useContext(FormDispatchContext);
    if (!context) {
        throw new Error('useFormDispatch must be used within a FormProvider');
    }
    return context;
};

export const useFormValidation = () => {
    const context = useContext(FormValidationContext);
    if (context === undefined) {
        // Return default validation state if not within provider
        return {
            validationErrors: {},
            isValid: true,
            hasError: () => false,
            getErrors: () => [],
            hasAnyErrors: () => false
        };
    }
    return context;
};

// Combined hook for form state and actions
export const useForm = () => {
    const state = useFormState();
    const actions = useFormDispatch();
    return { ...state, ...actions };
};

// Hook for field-specific operations
export const useFormField = (fieldId) => {
    const { formData, validationErrors, actions } = useForm();
    const validation = useFormValidation();

    return {
        value: formData[fieldId],
        setValue: (value) => actions.updateField(fieldId, value),
        errors: validation.getErrors(fieldId),
        hasError: validation.hasError(fieldId),
        isValid: !validation.hasError(fieldId)
    };
};

// PropTypes
FormProvider.propTypes = {
    children: PropTypes.node.isRequired,
    initialData: PropTypes.object,
    mode: PropTypes.oneOf(['entry', 'view', 'preview', 'designer']),
    context: PropTypes.oneOf(['general', 'study', 'template', 'patient']),
    onDataChange: PropTypes.func,
    onValidationChange: PropTypes.func,
    formDefinition: PropTypes.object
};

FormValidationProvider.propTypes = {
    children: PropTypes.node.isRequired,
    validationErrors: PropTypes.object,
    isValid: PropTypes.bool
};

// Export context and actions for advanced use cases
export { FormStateContext, FormDispatchContext, FormValidationContext, FormActions };
export { FormContext } from './FormContext';