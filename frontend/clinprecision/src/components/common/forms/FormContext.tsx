import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';

// Types
interface FormData {
    [key: string]: any;
}

interface ValidationErrors {
    [key: string]: string[];
}

interface FormState {
    formData: FormData;
    validationErrors: ValidationErrors;
    isValid: boolean;
    isDirty: boolean;
    isSaving: boolean;
    mode: 'entry' | 'view' | 'preview' | 'designer';
    context: 'general' | 'study' | 'template' | 'patient';
}

interface UpdateFieldPayload {
    fieldId: string;
    value: any;
}

interface FormAction {
    type: string;
    payload?: any;
}

interface FormActions {
    setFormData: (data: FormData) => void;
    updateField: (fieldId: string, value: any) => void;
    setValidationErrors: (errors: ValidationErrors) => void;
    setSaving: (saving: boolean) => void;
    setDirty: (dirty: boolean) => void;
    setMode: (mode: 'entry' | 'view' | 'preview' | 'designer') => void;
    setContext: (context: 'general' | 'study' | 'template' | 'patient') => void;
    resetForm: (newData?: FormData) => void;
}

interface FormStateContextValue extends FormState {
    actions: FormActions;
    formDefinition?: any;
}

interface FormProviderProps {
    children: ReactNode;
    initialData?: FormData;
    mode?: 'entry' | 'view' | 'preview' | 'designer';
    context?: 'general' | 'study' | 'template' | 'patient';
    onDataChange?: (data: FormData, fieldId?: string, value?: any) => void;
    onValidationChange?: (errors: ValidationErrors, isValid: boolean) => void;
    formDefinition?: any;
}

interface FormValidationProviderProps {
    children: ReactNode;
    validationErrors?: ValidationErrors;
    isValid?: boolean;
}

interface FormValidationContextValue {
    validationErrors: ValidationErrors;
    isValid: boolean;
    hasError: (fieldId: string) => boolean;
    getErrors: (fieldId: string) => string[];
    hasAnyErrors: () => boolean;
}

// Initial form state
const initialFormState: FormState = {
    formData: {},
    validationErrors: {},
    isValid: true,
    isDirty: false,
    isSaving: false,
    mode: 'entry',
    context: 'general'
};

// Form actions
const FormActionsEnum = {
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
const formReducer = (state: FormState, action: FormAction): FormState => {
    switch (action.type) {
        case FormActionsEnum.SET_FORM_DATA:
            return {
                ...state,
                formData: action.payload,
                isDirty: false
            };

        case FormActionsEnum.UPDATE_FIELD:
            return {
                ...state,
                formData: {
                    ...state.formData,
                    [action.payload.fieldId]: action.payload.value
                },
                isDirty: true
            };

        case FormActionsEnum.SET_VALIDATION_ERRORS:
            return {
                ...state,
                validationErrors: action.payload,
                isValid: Object.keys(action.payload).length === 0
            };

        case FormActionsEnum.SET_SAVING:
            return {
                ...state,
                isSaving: action.payload
            };

        case FormActionsEnum.SET_DIRTY:
            return {
                ...state,
                isDirty: action.payload
            };

        case FormActionsEnum.SET_MODE:
            return {
                ...state,
                mode: action.payload
            };

        case FormActionsEnum.SET_CONTEXT:
            return {
                ...state,
                context: action.payload
            };

        case FormActionsEnum.RESET_FORM:
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
const FormStateContext = createContext<FormStateContextValue | undefined>(undefined);
const FormDispatchContext = createContext<FormActions | undefined>(undefined);
const FormValidationContext = createContext<FormValidationContextValue | undefined>(undefined);

/**
 * FormProvider - Main form context provider
 * Manages form state, validation, and provides actions
 */
export const FormProvider: React.FC<FormProviderProps> = ({
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
    const actions: FormActions = {
        setFormData: useCallback((data: FormData) => {
            dispatch({ type: FormActionsEnum.SET_FORM_DATA, payload: data });
            onDataChange?.(data);
        }, [onDataChange]),

        updateField: useCallback((fieldId: string, value: any) => {
            dispatch({ type: FormActionsEnum.UPDATE_FIELD, payload: { fieldId, value } });
            const newData = { ...state.formData, [fieldId]: value };
            onDataChange?.(newData, fieldId, value);
        }, [state.formData, onDataChange]),

        setValidationErrors: useCallback((errors: ValidationErrors) => {
            dispatch({ type: FormActionsEnum.SET_VALIDATION_ERRORS, payload: errors });
            const isValid = Object.keys(errors).length === 0;
            onValidationChange?.(errors, isValid);
        }, [onValidationChange]),

        setSaving: useCallback((saving: boolean) => {
            dispatch({ type: FormActionsEnum.SET_SAVING, payload: saving });
        }, []),

        setDirty: useCallback((dirty: boolean) => {
            dispatch({ type: FormActionsEnum.SET_DIRTY, payload: dirty });
        }, []),

        setMode: useCallback((newMode: 'entry' | 'view' | 'preview' | 'designer') => {
            dispatch({ type: FormActionsEnum.SET_MODE, payload: newMode });
        }, []),

        setContext: useCallback((newContext: 'general' | 'study' | 'template' | 'patient') => {
            dispatch({ type: FormActionsEnum.SET_CONTEXT, payload: newContext });
        }, []),

        resetForm: useCallback((newData: FormData = {}) => {
            dispatch({ type: FormActionsEnum.RESET_FORM, payload: newData });
            onDataChange?.(newData);
        }, [onDataChange])
    };

    const value: FormStateContextValue = {
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
export const FormValidationProvider: React.FC<FormValidationProviderProps> = ({ 
    children, 
    validationErrors = {}, 
    isValid = true 
}) => {
    const value: FormValidationContextValue = {
        validationErrors,
        isValid,
        hasError: (fieldId: string) => (validationErrors[fieldId]?.length ?? 0) > 0,
        getErrors: (fieldId: string) => validationErrors[fieldId] || [],
        hasAnyErrors: () => Object.keys(validationErrors).length > 0
    };

    return (
        <FormValidationContext.Provider value={value}>
            {children}
        </FormValidationContext.Provider>
    );
};

// Custom hooks for consuming contexts
export const useFormState = (): FormStateContextValue => {
    const context = useContext(FormStateContext);
    if (!context) {
        throw new Error('useFormState must be used within a FormProvider');
    }
    return context;
};

export const useFormDispatch = (): FormActions => {
    const context = useContext(FormDispatchContext);
    if (!context) {
        throw new Error('useFormDispatch must be used within a FormProvider');
    }
    return context;
};

export const useFormValidation = (): FormValidationContextValue => {
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
export const useFormField = (fieldId: string) => {
    const { formData, validationErrors, actions } = useForm();
    const validation = useFormValidation();

    return {
        value: formData[fieldId],
        setValue: (value: any) => actions.updateField(fieldId, value),
        errors: validation.getErrors(fieldId),
        hasError: validation.hasError(fieldId),
        isValid: !validation.hasError(fieldId)
    };
};

// Export context and actions for advanced use cases
export { FormStateContext, FormDispatchContext, FormValidationContext, FormActionsEnum as FormActions };
