import React, { useState } from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';

interface FieldOption {
    value: string;
    label: string;
}

interface FormFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, 'type' | 'onChange'> {
    label: string;
    name: string;
    type?: 'text' | 'email' | 'number' | 'select' | 'textarea';
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    error?: string;
    helpText?: string;
    required?: boolean;
    options?: FieldOption[];
    placeholder?: string;
    className?: string;
}

/**
 * Enhanced FormField with validation and help text
 */
const FormField: React.FC<FormFieldProps> = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    error,
    helpText,
    required = false,
    options = [],
    placeholder = "",
    className = "",
    ...props
}) => {
    const [showHelp, setShowHelp] = useState(false);

    const baseInputStyles = `block w-full px-4 py-2 border rounded-lg 
    focus:ring-2 focus:outline-none transition-colors
    ${error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
        }`;

    const renderInput = (): React.ReactElement => {
        if (type === 'select') {
            return (
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    className={baseInputStyles}
                    {...props as React.SelectHTMLAttributes<HTMLSelectElement>}
                >
                    <option value="">{placeholder || 'Select...'}</option>
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            );
        }

        if (type === 'textarea') {
            return (
                <textarea
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    rows={4}
                    className={baseInputStyles}
                    {...props as React.TextareaHTMLAttributes<HTMLTextAreaElement>}
                />
            );
        }

        return (
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={baseInputStyles}
                {...props as React.InputHTMLAttributes<HTMLInputElement>}
            />
        );
    };

    return (
        <div className={`mb-4 ${className}`}>
            <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {helpText && (
                    <div className="relative">
                        <button
                            type="button"
                            onMouseEnter={() => setShowHelp(true)}
                            onMouseLeave={() => setShowHelp(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <HelpCircle className="h-4 w-4" />
                        </button>
                        {showHelp && (
                            <div className="absolute right-0 top-6 z-10 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                                {helpText}
                                <div className="absolute -top-1 right-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {renderInput()}

            {error && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

export default FormField;
