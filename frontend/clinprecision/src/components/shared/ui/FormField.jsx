import React, { useState } from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';

/**
 * Enhanced FormField with validation and help text
 * @param {string} label - Field label
 * @param {string} name - Field name
 * @param {string} type - Input type ('text', 'email', 'number', 'select', 'textarea')
 * @param {string} value - Field value
 * @param {function} onChange - Change handler
 * @param {string} error - Error message
 * @param {string} helpText - Help text tooltip
 * @param {boolean} required - Required field
 * @param {Array} options - Options for select (array of {value, label})
 * @param {string} placeholder - Placeholder text
 */
const FormField = ({
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

    const renderInput = () => {
        if (type === 'select') {
            return (
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    className={baseInputStyles}
                    {...props}
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
                    {...props}
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
                {...props}
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
