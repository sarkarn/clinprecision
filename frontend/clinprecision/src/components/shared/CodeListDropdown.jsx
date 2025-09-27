import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useCodeList } from '../../hooks/useCodeList';

/**
 * Universal CodeListDropdown Component
 * 
 * Phase 3 Frontend Integration: Replaces ALL hardcoded dropdown arrays
 * throughout the application with dynamic data from Admin Service
 * 
 * Features:
 * - Auto-fetching from centralized CodeList API
 * - Loading states and error handling
 * - Search/filter capabilities
 * - Consistent styling and behavior
 * - Accessibility support
 * - Custom data transformation
 * 
 * Usage:
 *   <CodeListDropdown 
 *     category="STUDY_PHASE" 
 *     value={selectedPhase}
 *     onChange={handlePhaseChange}
 *     placeholder="Select Phase..."
 *   />
 */
export const CodeListDropdown = ({
    category,
    value,
    onChange,
    onBlur,
    name,
    id,
    className = '',
    placeholder = 'Select...',
    disabled = false,
    required = false,
    allowEmpty = true,
    emptyText = 'None',
    filters = {},
    transformData = null,
    showDescription = false,
    searchable = false,
    loading: externalLoading = false,
    error: externalError = null,
    'data-testid': testId,
    ...props
}) => {
    // Fetch data using our universal hook
    const {
        data: options,
        loading: hookLoading,
        error: hookError,
        refresh
    } = useCodeList(category, {
        filters,
        transformData
    });

    // Use external loading/error states if provided, otherwise use hook states
    const loading = externalLoading || hookLoading;
    const error = externalError || hookError;

    // Filter options for searchable dropdown
    const [searchTerm, setSearchTerm] = React.useState('');
    const filteredOptions = useMemo(() => {
        if (!searchable || !searchTerm.trim()) {
            return options;
        }

        const term = searchTerm.toLowerCase();
        return options.filter(option =>
            option.label.toLowerCase().includes(term) ||
            option.value.toLowerCase().includes(term) ||
            (option.description && option.description.toLowerCase().includes(term))
        );
    }, [options, searchTerm, searchable]);

    // Base CSS classes
    const baseClasses = `
    w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
    ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
    ${loading ? 'animate-pulse' : ''}
    ${className}
  `.trim();

    // Handle change events
    const handleChange = (e) => {
        const selectedValue = e.target.value;
        const selectedOption = options.find(opt => opt.value === selectedValue);

        if (onChange) {
            onChange(e, selectedOption);
        }
    };

    // Handle retry on error
    const handleRetry = () => {
        refresh();
    };

    // Render loading state
    if (loading) {
        return (
            <div className="relative">
                <select
                    className={baseClasses}
                    disabled
                    data-testid={testId}
                >
                    <option>Loading {category.toLowerCase().replace('_', ' ')}...</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
            </div>
        );
    }

    // Render error state
    if (error && options.length === 0) {
        return (
            <div className="space-y-2">
                <select
                    className={`${baseClasses} border-red-300`}
                    disabled
                    data-testid={testId}
                >
                    <option>Error loading data</option>
                </select>
                <div className="flex items-center justify-between text-sm text-red-600">
                    <span>⚠️ Failed to load {category.toLowerCase().replace('_', ' ')}</span>
                    <button
                        type="button"
                        onClick={handleRetry}
                        className="text-blue-600 hover:text-blue-800 underline"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Render searchable dropdown
    if (searchable) {
        return (
            <div className="space-y-2">
                <input
                    type="text"
                    placeholder={`Search ${category.toLowerCase().replace('_', ' ')}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    disabled={disabled}
                />
                <select
                    id={id}
                    name={name}
                    value={value || ''}
                    onChange={handleChange}
                    onBlur={onBlur}
                    className={baseClasses}
                    disabled={disabled}
                    required={required}
                    data-testid={testId}
                    {...props}
                >
                    {allowEmpty && (
                        <option value="">{emptyText}</option>
                    )}
                    {placeholder && !allowEmpty && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}

                    {filteredOptions.map((option) => (
                        <option
                            key={option.id}
                            value={option.value}
                            title={showDescription ? option.description : option.label}
                        >
                            {option.label}
                            {showDescription && option.description && ` - ${option.description}`}
                        </option>
                    ))}
                </select>

                {searchTerm && filteredOptions.length === 0 && (
                    <p className="text-sm text-gray-500">
                        No results found for "{searchTerm}"
                    </p>
                )}
            </div>
        );
    }

    // Render standard dropdown
    return (
        <div>
            <select
                id={id}
                name={name}
                value={value || ''}
                onChange={handleChange}
                onBlur={onBlur}
                className={baseClasses}
                disabled={disabled}
                required={required}
                data-testid={testId}
                {...props}
            >
                {allowEmpty && (
                    <option value="">{emptyText}</option>
                )}
                {placeholder && !allowEmpty && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}

                {options.map((option) => (
                    <option
                        key={option.id}
                        value={option.value}
                        title={showDescription ? option.description : option.label}
                    >
                        {option.label}
                        {showDescription && option.description && ` - ${option.description}`}
                    </option>
                ))}
            </select>

            {/* Show data source info in development */}
            {process.env.NODE_ENV === 'development' && (
                <div className="mt-1 text-xs text-gray-500">
                    📊 {options.length} items from {category} via Admin Service
                </div>
            )}
        </div>
    );
};

CodeListDropdown.propTypes = {
    category: PropTypes.oneOf([
        'REGULATORY_STATUS',
        'STUDY_PHASE',
        'STUDY_STATUS',
        'AMENDMENT_TYPE',
        'VISIT_TYPE'
    ]).isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
    name: PropTypes.string,
    id: PropTypes.string,
    className: PropTypes.string,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    required: PropTypes.bool,
    allowEmpty: PropTypes.bool,
    emptyText: PropTypes.string,
    filters: PropTypes.object,
    transformData: PropTypes.func,
    showDescription: PropTypes.bool,
    searchable: PropTypes.bool,
    loading: PropTypes.bool,
    error: PropTypes.string,
    'data-testid': PropTypes.string
};

/**
 * Specialized dropdown components for common use cases
 */

export const RegulatoryStatusDropdown = (props) => (
    <CodeListDropdown
        category="REGULATORY_STATUS"
        placeholder="Select Regulatory Status..."
        showDescription
        {...props}
    />
);

export const StudyPhaseDropdown = (props) => (
    <CodeListDropdown
        category="STUDY_PHASE"
        placeholder="Select Study Phase..."
        showDescription
        {...props}
    />
);

export const StudyStatusDropdown = (props) => (
    <CodeListDropdown
        category="STUDY_STATUS"
        placeholder="Select Study Status..."
        {...props}
    />
);

export const AmendmentTypeDropdown = (props) => (
    <CodeListDropdown
        category="AMENDMENT_TYPE"
        placeholder="Select Amendment Type..."
        searchable
        {...props}
    />
);

export const VisitTypeDropdown = (props) => (
    <CodeListDropdown
        category="VISIT_TYPE"
        placeholder="Select Visit Type..."
        searchable
        showDescription
        {...props}
    />
);

export default CodeListDropdown;