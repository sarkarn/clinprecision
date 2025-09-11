import React from 'react';

/**
 * Form field component with validation support
 */
const FormField = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    error,
    touched,
    required = false,
    placeholder,
    options = [], // For select fields
    rows = 3, // For textarea
    disabled = false,
    helpText,
    className = '',
    ...props
}) => {
    const fieldId = `field-${name}`;
    const hasError = touched && error;

    const baseInputStyles = `
    w-full px-3 py-2 border rounded-md transition-colors duration-200
    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
    ${hasError
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
        }
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
  `;

    const renderInput = () => {
        switch (type) {
            case 'textarea':
                return (
                    <textarea
                        id={fieldId}
                        name={name}
                        value={value || ''}
                        onChange={(e) => onChange(name, e.target.value)}
                        placeholder={placeholder}
                        rows={rows}
                        disabled={disabled}
                        className={baseInputStyles}
                        {...props}
                    />
                );

            case 'select':
                return (
                    <select
                        id={fieldId}
                        name={name}
                        value={value || ''}
                        onChange={(e) => onChange(name, e.target.value)}
                        disabled={disabled}
                        className={baseInputStyles}
                        {...props}
                    >
                        <option value="">{placeholder || `Select ${label}`}</option>
                        {options.map((option) => (
                            <option
                                key={option.value || option}
                                value={option.value || option}
                            >
                                {option.label || option}
                            </option>
                        ))}
                    </select>
                );

            case 'checkbox':
                return (
                    <div className="flex items-center">
                        <input
                            id={fieldId}
                            name={name}
                            type="checkbox"
                            checked={value || false}
                            onChange={(e) => onChange(name, e.target.checked)}
                            disabled={disabled}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            {...props}
                        />
                        <label htmlFor={fieldId} className="ml-2 text-sm text-gray-700">
                            {label}
                        </label>
                    </div>
                );

            case 'date':
                return (
                    <input
                        id={fieldId}
                        name={name}
                        type="date"
                        value={value || ''}
                        onChange={(e) => onChange(name, e.target.value)}
                        placeholder={placeholder}
                        disabled={disabled}
                        className={baseInputStyles}
                        {...props}
                    />
                );

            default:
                return (
                    <input
                        id={fieldId}
                        name={name}
                        type={type}
                        value={value || ''}
                        onChange={(e) => onChange(name, e.target.value)}
                        placeholder={placeholder}
                        disabled={disabled}
                        className={baseInputStyles}
                        {...props}
                    />
                );
        }
    };

    if (type === 'checkbox') {
        return (
            <div className={`space-y-1 ${className}`}>
                {renderInput()}
                {hasError && (
                    <p className="text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </p>
                )}
                {helpText && !hasError && (
                    <p className="text-sm text-gray-600">{helpText}</p>
                )}
            </div>
        );
    }

    return (
        <div className={`space-y-1 ${className}`}>
            {/* Label */}
            <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {/* Input Field */}
            {renderInput()}

            {/* Error Message */}
            {hasError && (
                <p className="text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}

            {/* Help Text */}
            {helpText && !hasError && (
                <p className="text-sm text-gray-600">{helpText}</p>
            )}
        </div>
    );
};

export default FormField;
