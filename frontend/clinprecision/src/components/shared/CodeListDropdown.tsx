import React, { useMemo } from 'react';
import { useCodeList } from '../../hooks/useCodeList';

type CodeListCategory = 
    | 'REGULATORY_STATUS' 
    | 'STUDY_PHASE' 
    | 'STUDY_STATUS' 
    | 'AMENDMENT_TYPE' 
    | 'VISIT_TYPE';

interface CodeListOption {
    id: string;
    value: string;
    label: string;
    description?: string;
}

interface CodeListDropdownProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
    category: CodeListCategory;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>, selectedOption?: CodeListOption) => void;
    onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
    name?: string;
    id?: string;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    allowEmpty?: boolean;
    emptyText?: string;
    filters?: Record<string, any>;
    transformData?: ((data: any[]) => any[]) | null;
    showDescription?: boolean;
    searchable?: boolean;
    loading?: boolean;
    error?: string | null;
    'data-testid'?: string;
}

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
 */
export const CodeListDropdown: React.FC<CodeListDropdownProps> = ({
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
    }) as any;

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
        return options.filter((option: CodeListOption) =>
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
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;
        const selectedOption = options.find((opt: CodeListOption) => opt.value === selectedValue);

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

                    {filteredOptions.map((option: CodeListOption) => (
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

                {options.map((option: CodeListOption) => (
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

/**
 * Specialized dropdown components for common use cases
 */

interface SpecializedDropdownProps extends Omit<CodeListDropdownProps, 'category'> {}

export const RegulatoryStatusDropdown: React.FC<SpecializedDropdownProps> = (props) => (
    <CodeListDropdown
        category="REGULATORY_STATUS"
        placeholder="Select Regulatory Status..."
        showDescription
        {...props}
    />
);

export const StudyPhaseDropdown: React.FC<SpecializedDropdownProps> = (props) => (
    <CodeListDropdown
        category="STUDY_PHASE"
        placeholder="Select Study Phase..."
        showDescription
        {...props}
    />
);

export const StudyStatusDropdown: React.FC<SpecializedDropdownProps> = (props) => (
    <CodeListDropdown
        category="STUDY_STATUS"
        placeholder="Select Study Status..."
        {...props}
    />
);

export const AmendmentTypeDropdown: React.FC<SpecializedDropdownProps> = (props) => (
    <CodeListDropdown
        category="AMENDMENT_TYPE"
        placeholder="Select Amendment Type..."
        searchable
        {...props}
    />
);

export const VisitTypeDropdown: React.FC<SpecializedDropdownProps> = (props) => (
    <CodeListDropdown
        category="VISIT_TYPE"
        placeholder="Select Visit Type..."
        searchable
        showDescription
        {...props}
    />
);

export default CodeListDropdown;
