import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, Check, X, Search } from 'lucide-react';
import FieldWrapper from './FieldWrapper';
import { useFormField } from '../FormContext';

/**
 * SelectInput - Reusable select/dropdown input field component
 * Supports single select, multi-select, searchable options, and custom options
 */
const SelectInput = ({
    id,
    name,
    label,
    value,
    onChange,
    onBlur,
    onFocus,
    options = [],
    required = false,
    readOnly = false,
    disabled = false,
    placeholder = 'Select an option...',
    multiple = false,
    searchable = false,
    allowCustom = false,
    maxSelections,
    groupBy,
    context = 'general',
    validation = {},
    className = '',
    style = {},
    ...props
}) => {
    const selectRef = useRef(null);
    const dropdownRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOptions, setFilteredOptions] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [customOption, setCustomOption] = useState('');
    const [validationMessage, setValidationMessage] = useState('');

    // Use form context if available
    const formField = useFormField(id);
    const fieldValue = formField?.value ?? value;
    const fieldError = formField?.error;

    // Initialize selected options
    useEffect(() => {
        if (fieldValue !== undefined && fieldValue !== null) {
            if (multiple) {
                const values = Array.isArray(fieldValue) ? fieldValue : [fieldValue];
                setSelectedOptions(values);
            } else {
                setSelectedOptions(fieldValue ? [fieldValue] : []);
            }
        } else {
            setSelectedOptions([]);
        }
    }, [fieldValue, multiple]);

    // Normalize options to consistent format
    const normalizeOptions = (opts) => {
        return opts.map(option => {
            if (typeof option === 'string') {
                return { value: option, label: option };
            }
            return {
                value: option.value,
                label: option.label || option.value,
                group: option.group,
                disabled: option.disabled,
                description: option.description
            };
        });
    };

    // Filter options based on search term
    useEffect(() => {
        const normalized = normalizeOptions(options);
        if (!searchTerm) {
            setFilteredOptions(normalized);
        } else {
            const filtered = normalized.filter(option =>
                option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                option.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (option.description && option.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredOptions(filtered);
        }
    }, [options, searchTerm]);

    // Group options if groupBy is specified
    const getGroupedOptions = () => {
        if (!groupBy) return { '': filteredOptions };

        const grouped = filteredOptions.reduce((acc, option) => {
            const group = option[groupBy] || 'Other';
            if (!acc[group]) acc[group] = [];
            acc[group].push(option);
            return acc;
        }, {});

        return grouped;
    };

    // Validate selected values
    const validateSelection = (selection) => {
        const errors = [];

        // Required validation
        if (required && (!selection || selection.length === 0)) {
            errors.push('This field is required');
        }

        // Max selections validation
        if (maxSelections && selection.length > maxSelections) {
            errors.push(`Maximum ${maxSelections} selection${maxSelections > 1 ? 's' : ''} allowed`);
        }

        // Custom validation
        if (validation.custom && typeof validation.custom === 'function') {
            const customError = validation.custom(selection);
            if (customError) {
                errors.push(customError);
            }
        }

        return errors;
    };

    // Handle option selection
    const handleOptionSelect = (option) => {
        let newSelection;

        if (multiple) {
            const isSelected = selectedOptions.includes(option.value);
            if (isSelected) {
                newSelection = selectedOptions.filter(val => val !== option.value);
            } else {
                newSelection = [...selectedOptions, option.value];
            }
        } else {
            newSelection = [option.value];
            setIsOpen(false);
        }

        setSelectedOptions(newSelection);

        // Validate and update
        const errors = validateSelection(newSelection);
        setValidationMessage(errors[0] || '');

        // Call onChange with appropriate format
        const outputValue = multiple ? newSelection : (newSelection[0] || null);
        onChange?.(outputValue);
        formField?.onChange?.(outputValue);

        // Clear search term
        setSearchTerm('');
    };

    // Handle custom option addition
    const handleCustomOptionAdd = () => {
        if (!customOption.trim() || !allowCustom) return;

        const newOption = {
            value: customOption.trim(),
            label: customOption.trim()
        };

        // Add to options temporarily
        setFilteredOptions(prev => [...prev, newOption]);

        // Select the new option
        handleOptionSelect(newOption);

        setCustomOption('');
    };

    // Handle option removal (for multi-select)
    const handleOptionRemove = (valueToRemove) => {
        const newSelection = selectedOptions.filter(val => val !== valueToRemove);
        setSelectedOptions(newSelection);

        const errors = validateSelection(newSelection);
        setValidationMessage(errors[0] || '');

        const outputValue = multiple ? newSelection : null;
        onChange?.(outputValue);
        formField?.onChange?.(outputValue);
    };

    // Get display value for selected options
    const getDisplayValue = () => {
        if (selectedOptions.length === 0) return placeholder;

        if (multiple) {
            return `${selectedOptions.length} selected`;
        } else {
            const option = normalizeOptions(options).find(opt => opt.value === selectedOptions[0]);
            return option ? option.label : selectedOptions[0];
        }
    };

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
            setSearchTerm('');
        } else if (e.key === 'Enter' && customOption && allowCustom) {
            e.preventDefault();
            handleCustomOptionAdd();
        }
    };

    const groupedOptions = getGroupedOptions();

    return (
        <FieldWrapper
            id={id}
            label={label}
            required={required}
            error={fieldError || validationMessage}
            context={context}
        >
            <div className="relative" ref={dropdownRef}>
                {/* Selected values display (for multi-select) */}
                {multiple && selectedOptions.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1">
                        {selectedOptions.map(selectedValue => {
                            const option = normalizeOptions(options).find(opt => opt.value === selectedValue);
                            const displayLabel = option ? option.label : selectedValue;

                            return (
                                <span
                                    key={selectedValue}
                                    className="inline-flex items-center px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded"
                                >
                                    {displayLabel}
                                    {!readOnly && !disabled && (
                                        <button
                                            type="button"
                                            onClick={() => handleOptionRemove(selectedValue)}
                                            className="ml-1 text-blue-600 hover:text-blue-800"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </span>
                            );
                        })}
                    </div>
                )}

                {/* Main select button */}
                <button
                    type="button"
                    ref={selectRef}
                    onClick={() => !readOnly && !disabled && setIsOpen(!isOpen)}
                    className={`w-full px-3 py-2 text-left border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${(fieldError || validationMessage) ? 'border-red-500' : 'border-gray-300'
                        } ${disabled || readOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer hover:border-gray-400'} ${className}`}
                    style={style}
                    disabled={disabled}
                    {...props}
                >
                    <div className="flex items-center justify-between">
                        <span className={selectedOptions.length === 0 ? 'text-gray-500' : 'text-gray-900'}>
                            {getDisplayValue()}
                        </span>
                        {!readOnly && !disabled && (
                            <ChevronDown className={`h-4 w-4 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''
                                }`} />
                        )}
                    </div>
                </button>

                {/* Dropdown */}
                {isOpen && !readOnly && !disabled && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {/* Search input */}
                        {searchable && (
                            <div className="p-2 border-b border-gray-200">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search options..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Custom option input */}
                        {allowCustom && (
                            <div className="p-2 border-b border-gray-200">
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        placeholder="Add custom option..."
                                        value={customOption}
                                        onChange={(e) => setCustomOption(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleCustomOptionAdd}
                                        disabled={!customOption.trim()}
                                        className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Options list */}
                        <div className="py-1">
                            {Object.keys(groupedOptions).length === 0 ? (
                                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                                    No options available
                                </div>
                            ) : (
                                Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
                                    <div key={groupName}>
                                        {groupName && (
                                            <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase bg-gray-50">
                                                {groupName}
                                            </div>
                                        )}
                                        {groupOptions.map(option => {
                                            const isSelected = selectedOptions.includes(option.value);
                                            const isDisabled = option.disabled;

                                            return (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() => !isDisabled && handleOptionSelect(option)}
                                                    disabled={isDisabled}
                                                    className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-gray-100 ${isSelected ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                                                        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                >
                                                    <div>
                                                        <div className="font-medium">{option.label}</div>
                                                        {option.description && (
                                                            <div className="text-xs text-gray-500">
                                                                {option.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {isSelected && (
                                                        <Check className="h-4 w-4 text-blue-600" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </FieldWrapper>
    );
};

SelectInput.propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number]))
    ]),
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
    onFocus: PropTypes.func,
    options: PropTypes.arrayOf(
        PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({
                value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
                label: PropTypes.string,
                group: PropTypes.string,
                disabled: PropTypes.bool,
                description: PropTypes.string
            })
        ])
    ),
    required: PropTypes.bool,
    readOnly: PropTypes.bool,
    disabled: PropTypes.bool,
    placeholder: PropTypes.string,
    multiple: PropTypes.bool,
    searchable: PropTypes.bool,
    allowCustom: PropTypes.bool,
    maxSelections: PropTypes.number,
    groupBy: PropTypes.string,
    context: PropTypes.oneOf(['general', 'study', 'template', 'patient']),
    validation: PropTypes.object,
    className: PropTypes.string,
    style: PropTypes.object
};

export default SelectInput;