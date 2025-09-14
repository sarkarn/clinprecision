import React from 'react';
import PropTypes from 'prop-types';
import { FieldWrapper } from './FieldWrapper';

/**
 * ReadOnlyDisplay - Displays field values in read-only mode
 * Used for view mode and read-only fields
 */
export const ReadOnlyDisplay = ({
    field,
    value,
    mode = 'view',
    errors = [],
    context = 'general',
    config = {},
    customStyles = {},
    className = '',
    ...props
}) => {
    // Format value based on field type
    const formatValue = () => {
        if (value === undefined || value === null || value === '') {
            return <span className="text-gray-400 italic">Not provided</span>;
        }

        switch (field.type) {
            case 'text':
            case 'email':
            case 'tel':
            case 'url':
                return <span className="text-gray-900">{value}</span>;

            case 'textarea':
            case 'longtext':
                return (
                    <div className="text-gray-900 whitespace-pre-wrap">
                        {value}
                    </div>
                );

            case 'number':
            case 'integer':
            case 'float':
            case 'decimal':
                const numValue = parseFloat(value);
                const formattedNumber = isNaN(numValue) ? value : numValue.toLocaleString();
                return (
                    <span className="text-gray-900">
                        {formattedNumber}
                        {field.metadata?.units && (
                            <span className="text-gray-500 ml-1">{field.metadata.units}</span>
                        )}
                    </span>
                );

            case 'date':
                try {
                    const dateValue = new Date(value);
                    return (
                        <span className="text-gray-900">
                            {dateValue.toLocaleDateString()}
                        </span>
                    );
                } catch {
                    return <span className="text-gray-900">{value}</span>;
                }

            case 'time':
                return <span className="text-gray-900">{value}</span>;

            case 'datetime':
            case 'datetime-local':
                try {
                    const dateTime = new Date(value);
                    return (
                        <span className="text-gray-900">
                            {dateTime.toLocaleString()}
                        </span>
                    );
                } catch {
                    return <span className="text-gray-900">{value}</span>;
                }

            case 'select':
            case 'dropdown':
                // Find the option label if options are provided
                if (field.metadata?.options || field.options) {
                    const options = field.metadata?.options || field.options;
                    const selectedOption = options.find(opt =>
                        typeof opt === 'string' ? opt === value : opt.value === value
                    );
                    const displayValue = selectedOption
                        ? (typeof selectedOption === 'string' ? selectedOption : selectedOption.label)
                        : value;
                    return <span className="text-gray-900">{displayValue}</span>;
                }
                return <span className="text-gray-900">{value}</span>;

            case 'multiselect':
            case 'multi-select':
                if (!Array.isArray(value) || value.length === 0) {
                    return <span className="text-gray-400 italic">None selected</span>;
                }

                const options = field.metadata?.options || field.options || [];
                const selectedLabels = value.map(val => {
                    const option = options.find(opt =>
                        typeof opt === 'string' ? opt === val : opt.value === val
                    );
                    return option
                        ? (typeof option === 'string' ? option : option.label)
                        : val;
                });

                return (
                    <div className="space-y-1">
                        {selectedLabels.map((label, index) => (
                            <span
                                key={index}
                                className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 mb-1"
                            >
                                {label}
                            </span>
                        ))}
                    </div>
                );

            case 'radio':
            case 'radio-group':
                // Find the option label if options are provided
                if (field.metadata?.options || field.options) {
                    const options = field.metadata?.options || field.options;
                    const selectedOption = options.find(opt =>
                        typeof opt === 'string' ? opt === value : opt.value === value
                    );
                    const displayValue = selectedOption
                        ? (typeof selectedOption === 'string' ? selectedOption : selectedOption.label)
                        : value;
                    return <span className="text-gray-900">{displayValue}</span>;
                }
                return <span className="text-gray-900">{value}</span>;

            case 'checkbox':
                if (field.metadata?.options && Array.isArray(value)) {
                    // Multiple checkboxes
                    if (value.length === 0) {
                        return <span className="text-gray-400 italic">None selected</span>;
                    }
                    return (
                        <div className="space-y-1">
                            {value.map((val, index) => (
                                <span
                                    key={index}
                                    className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-1 mb-1"
                                >
                                    {val}
                                </span>
                            ))}
                        </div>
                    );
                } else {
                    // Single checkbox
                    return (
                        <span className={`text-sm ${value ? 'text-green-600' : 'text-gray-500'}`}>
                            {value ? '✓ Yes' : '✗ No'}
                        </span>
                    );
                }

            case 'checkbox-group':
                if (!Array.isArray(value) || value.length === 0) {
                    return <span className="text-gray-400 italic">None selected</span>;
                }
                return (
                    <div className="space-y-1">
                        {value.map((val, index) => (
                            <div key={index} className="flex items-center">
                                <span className="w-4 h-4 bg-green-100 text-green-600 rounded text-xs flex items-center justify-center mr-2">
                                    ✓
                                </span>
                                <span className="text-gray-900">{val}</span>
                            </div>
                        ))}
                    </div>
                );

            case 'file':
            case 'upload':
                if (typeof value === 'string' && value.trim() !== '') {
                    return (
                        <a
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                        >
                            {value.split('/').pop() || 'View File'}
                        </a>
                    );
                }
                return <span className="text-gray-400 italic">No file uploaded</span>;

            case 'range':
            case 'slider':
                const rangeValue = parseFloat(value);
                return (
                    <div className="flex items-center space-x-3">
                        <span className="text-gray-900 font-medium">{rangeValue}</span>
                        {field.metadata?.min !== undefined && field.metadata?.max !== undefined && (
                            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-32">
                                <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{
                                        width: `${((rangeValue - field.metadata.min) / (field.metadata.max - field.metadata.min)) * 100}%`
                                    }}
                                />
                            </div>
                        )}
                        {field.metadata?.units && (
                            <span className="text-gray-500 text-sm">{field.metadata.units}</span>
                        )}
                    </div>
                );

            // Clinical-specific types
            case 'vital-sign':
            case 'lab-value':
                const clinicalValue = parseFloat(value);
                const isAbnormal = field.metadata?.referenceRange &&
                    (clinicalValue < field.metadata.referenceRange.min ||
                        clinicalValue > field.metadata.referenceRange.max);

                return (
                    <div className="flex items-center space-x-2">
                        <span className={`font-medium ${isAbnormal ? 'text-red-600' : 'text-gray-900'}`}>
                            {clinicalValue.toLocaleString()}
                        </span>
                        {field.metadata?.units && (
                            <span className="text-gray-500">{field.metadata.units}</span>
                        )}
                        {isAbnormal && (
                            <span className="text-red-600 text-xs font-semibold">ABNORMAL</span>
                        )}
                    </div>
                );

            case 'medication':
            case 'conmed':
                return (
                    <span className="text-gray-900 bg-yellow-50 px-2 py-1 rounded text-sm">
                        {value}
                    </span>
                );

            case 'adverse-event':
                return (
                    <span className="text-gray-900 bg-red-50 px-2 py-1 rounded text-sm border border-red-200">
                        {value}
                    </span>
                );

            default:
                return <span className="text-gray-900">{String(value)}</span>;
        }
    };

    return (
        <FieldWrapper
            field={field}
            errors={errors}
            context={context}
            customStyles={customStyles}
            showErrors={false} // Don't show errors in read-only mode
        >
            <div
                className={`bg-gray-50 border border-gray-300 rounded-md p-3 ${className}`}
                style={customStyles.display}
            >
                {formatValue()}
            </div>
        </FieldWrapper>
    );
};

ReadOnlyDisplay.propTypes = {
    field: PropTypes.object.isRequired,
    value: PropTypes.any,
    mode: PropTypes.string,
    errors: PropTypes.array,
    context: PropTypes.string,
    config: PropTypes.object,
    customStyles: PropTypes.object,
    className: PropTypes.string
};

export default ReadOnlyDisplay;