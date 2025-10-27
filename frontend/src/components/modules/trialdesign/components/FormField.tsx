import React, { FC, useState, ChangeEvent, FocusEvent } from 'react';
import { CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface ValidationState {
  isValid: boolean;
  isValidating: boolean;
  error: string | null;
}

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string | boolean;
  onChange: (name: string, value: string | boolean) => void;
  error?: string;
  touched?: boolean;
  required?: boolean;
  placeholder?: string;
  options?: Option[] | string[];
  rows?: number;
  disabled?: boolean;
  helpText?: string;
  className?: string;
  showValidIcon?: boolean;
  progressiveValidation?: boolean;
  validationState?: ValidationState | null;
  [key: string]: any;
}

/**
 * Enhanced form field with validation feedback
 */
const FormField: FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  touched = false,
  required = false,
  placeholder,
  options = [],
  rows = 3,
  disabled = false,
  helpText,
  className = '',
  showValidIcon = false,
  progressiveValidation = false,
  validationState = null,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const target = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      onChange(name, target.checked);
    } else {
      onChange(name, target.value);
    }
  };

  const handleFocus = (): void => {
    setIsFocused(true);
  };

  const handleBlur = (): void => {
    setIsFocused(false);
  };

  const showError = touched && error;
  const showValid = showValidIcon && touched && !error && value;
  const isValidating = validationState?.isValidating || false;

  // Determine border color based on validation state
  const getBorderColor = (): string => {
    if (isFocused) return 'border-blue-500 ring-2 ring-blue-200';
    if (showError) return 'border-red-500';
    if (showValid) return 'border-green-500';
    return 'border-gray-300';
  };

  // Common input classes
  const inputClasses = `
    mt-1 block w-full rounded-md shadow-sm
    ${getBorderColor()}
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
    focus:outline-none
    transition-all duration-200
  `;

  // Render validation icon
  const renderValidationIcon = (): React.ReactElement | null => {
    if (isValidating) {
      return (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      );
    }

    if (showValid && progressiveValidation) {
      return (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <CheckCircle className="h-5 w-5 text-green-600" />
        </div>
      );
    }

    if (showError) {
      return (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <AlertCircle className="h-5 w-5 text-red-600" />
        </div>
      );
    }

    return null;
  };

  // Render field based on type
  const renderField = (): React.ReactElement => {
    if (type === 'textarea') {
      return (
        <textarea
          id={name}
          name={name}
          value={value as string}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          rows={rows}
          disabled={disabled}
          placeholder={placeholder}
          className={inputClasses}
          {...props}
        />
      );
    }

    if (type === 'select') {
      return (
        <select
          id={name}
          name={name}
          value={value as string}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          className={inputClasses}
          {...props}
        >
          <option value="">{placeholder || 'Select an option'}</option>
          {options.map((option, index) => {
            if (typeof option === 'string') {
              return (
                <option key={index} value={option}>
                  {option}
                </option>
              );
            }
            return (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            );
          })}
        </select>
      );
    }

    if (type === 'checkbox') {
      return (
        <div className="flex items-center">
          <input
            id={name}
            name={name}
            type="checkbox"
            checked={value as boolean}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            {...props}
          />
          <label htmlFor={name} className="ml-2 block text-sm text-gray-900">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>
      );
    }

    // Default: text, email, number, date, etc.
    return (
      <div className="relative">
        <input
          id={name}
          name={name}
          type={type}
          value={value as string}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          className={inputClasses}
          {...props}
        />
        {renderValidationIcon()}
      </div>
    );
  };

  // Checkbox has different layout
  if (type === 'checkbox') {
    return (
      <div className={`mb-4 ${className}`}>
        {renderField()}
        {showError && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        {helpText && !showError && (
          <p className="mt-1 text-sm text-gray-500 flex items-center">
            <HelpCircle className="w-4 h-4 mr-1" />
            {helpText}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
      {showError && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </p>
      )}
      {helpText && !showError && (
        <p className="mt-1 text-sm text-gray-500 flex items-center">
          <HelpCircle className="w-4 h-4 mr-1" />
          {helpText}
        </p>
      )}
    </div>
  );
};

export default FormField;
