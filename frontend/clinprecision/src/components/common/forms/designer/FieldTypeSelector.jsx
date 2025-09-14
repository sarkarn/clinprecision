import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Search, Type, Hash, Calendar, Clock, Mail, Phone, Link, File, Image, CheckSquare, Circle, MoreHorizontal, Stethoscope, Beaker, Pill } from 'lucide-react';

/**
 * FieldTypeSelector - Visual field type selector with categories and search
 * Used within FormDesigner for selecting field types when adding new fields
 */
const FieldTypeSelector = ({
    context = 'general',
    onSelect,
    onCancel,
    selectedType = null,
    showClinicalFields = false,
    customFieldTypes = [],
    className = ''
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Define field type configurations with icons and categories
    const fieldTypes = useMemo(() => {
        const baseTypes = [
            // Text Input Types
            {
                value: 'text',
                label: 'Text Input',
                description: 'Single line text input',
                icon: Type,
                category: 'text',
                usage: 'Names, short answers, single words'
            },
            {
                value: 'textarea',
                label: 'Text Area',
                description: 'Multi-line text input',
                icon: Type,
                category: 'text',
                usage: 'Long descriptions, comments, notes'
            },
            {
                value: 'email',
                label: 'Email',
                description: 'Email address input with validation',
                icon: Mail,
                category: 'text',
                usage: 'Email addresses with automatic validation'
            },
            {
                value: 'tel',
                label: 'Phone',
                description: 'Phone number input',
                icon: Phone,
                category: 'text',
                usage: 'Phone numbers with formatting'
            },
            {
                value: 'url',
                label: 'URL',
                description: 'Website URL input',
                icon: Link,
                category: 'text',
                usage: 'Website links and URLs'
            },

            // Number Types
            {
                value: 'number',
                label: 'Number',
                description: 'Numeric input with validation',
                icon: Hash,
                category: 'number',
                usage: 'Ages, quantities, measurements'
            },
            {
                value: 'integer',
                label: 'Integer',
                description: 'Whole numbers only',
                icon: Hash,
                category: 'number',
                usage: 'Counts, IDs, whole number values'
            },
            {
                value: 'float',
                label: 'Decimal',
                description: 'Decimal numbers',
                icon: Hash,
                category: 'number',
                usage: 'Measurements, percentages, precise values'
            },
            {
                value: 'range',
                label: 'Range Slider',
                description: 'Slider for selecting numeric ranges',
                icon: MoreHorizontal,
                category: 'number',
                usage: 'Pain scales, ratings, preferences'
            },

            // Date & Time Types
            {
                value: 'date',
                label: 'Date',
                description: 'Date picker input',
                icon: Calendar,
                category: 'datetime',
                usage: 'Birth dates, visit dates, deadlines'
            },
            {
                value: 'time',
                label: 'Time',
                description: 'Time picker input',
                icon: Clock,
                category: 'datetime',
                usage: 'Appointment times, medication schedules'
            },
            {
                value: 'datetime',
                label: 'Date & Time',
                description: 'Combined date and time picker',
                icon: Calendar,
                category: 'datetime',
                usage: 'Timestamps, scheduled events'
            },

            // Choice Types
            {
                value: 'select',
                label: 'Dropdown',
                description: 'Single selection from dropdown list',
                icon: Circle,
                category: 'choice',
                usage: 'Countries, categories, single choices'
            },
            {
                value: 'multiselect',
                label: 'Multi-Select',
                description: 'Multiple selections from dropdown',
                icon: CheckSquare,
                category: 'choice',
                usage: 'Multiple symptoms, conditions, preferences'
            },
            {
                value: 'radio',
                label: 'Radio Buttons',
                description: 'Single selection from visible options',
                icon: Circle,
                category: 'choice',
                usage: 'Yes/No, gender, single visible choices'
            },
            {
                value: 'checkbox-group',
                label: 'Checkboxes',
                description: 'Multiple selections from visible options',
                icon: CheckSquare,
                category: 'choice',
                usage: 'Multiple symptoms, medical history'
            },
            {
                value: 'checkbox',
                label: 'Single Checkbox',
                description: 'Single true/false checkbox',
                icon: CheckSquare,
                category: 'choice',
                usage: 'Agreements, confirmations, yes/no'
            },

            // File Types
            {
                value: 'file',
                label: 'File Upload',
                description: 'File upload with validation',
                icon: File,
                category: 'file',
                usage: 'Documents, images, attachments'
            },
            {
                value: 'image',
                label: 'Image Upload',
                description: 'Image-specific file upload',
                icon: Image,
                category: 'file',
                usage: 'Photos, scans, visual documentation'
            }
        ];

        // Add clinical field types if enabled
        const clinicalTypes = showClinicalFields || context === 'study' || context === 'patient' ? [
            {
                value: 'vital-sign',
                label: 'Vital Sign',
                description: 'Standardized vital sign measurement',
                icon: Stethoscope,
                category: 'clinical',
                usage: 'Blood pressure, heart rate, temperature'
            },
            {
                value: 'lab-value',
                label: 'Lab Value',
                description: 'Laboratory test result',
                icon: Beaker,
                category: 'clinical',
                usage: 'Blood tests, urinalysis, cultures'
            },
            {
                value: 'medication',
                label: 'Medication',
                description: 'Medication with dosage and schedule',
                icon: Pill,
                category: 'clinical',
                usage: 'Prescriptions, dosing, drug interactions'
            },
            {
                value: 'diagnosis-code',
                label: 'Diagnosis Code',
                description: 'ICD-10 or other diagnostic codes',
                icon: Stethoscope,
                category: 'clinical',
                usage: 'Primary diagnoses, comorbidities'
            },
            {
                value: 'procedure-code',
                label: 'Procedure Code',
                description: 'CPT or other procedure codes',
                icon: Stethoscope,
                category: 'clinical',
                usage: 'Medical procedures, treatments'
            }
        ] : [];

        // Add custom field types
        const allTypes = [...baseTypes, ...clinicalTypes, ...customFieldTypes];

        return allTypes;
    }, [showClinicalFields, context, customFieldTypes]);

    // Define categories
    const categories = [
        { id: 'all', label: 'All Fields', count: fieldTypes.length },
        { id: 'text', label: 'Text & Input', count: fieldTypes.filter(t => t.category === 'text').length },
        { id: 'number', label: 'Numbers', count: fieldTypes.filter(t => t.category === 'number').length },
        { id: 'datetime', label: 'Date & Time', count: fieldTypes.filter(t => t.category === 'datetime').length },
        { id: 'choice', label: 'Choices', count: fieldTypes.filter(t => t.category === 'choice').length },
        { id: 'file', label: 'Files', count: fieldTypes.filter(t => t.category === 'file').length }
    ];

    // Add clinical category if applicable
    if (showClinicalFields || context === 'study' || context === 'patient') {
        categories.push({
            id: 'clinical',
            label: 'Clinical',
            count: fieldTypes.filter(t => t.category === 'clinical').length
        });
    }

    // Filter field types based on search and category
    const filteredFieldTypes = useMemo(() => {
        return fieldTypes.filter(fieldType => {
            // Category filter
            if (selectedCategory !== 'all' && fieldType.category !== selectedCategory) {
                return false;
            }

            // Search filter
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                return (
                    fieldType.label.toLowerCase().includes(searchLower) ||
                    fieldType.description.toLowerCase().includes(searchLower) ||
                    fieldType.usage.toLowerCase().includes(searchLower) ||
                    fieldType.value.toLowerCase().includes(searchLower)
                );
            }

            return true;
        });
    }, [fieldTypes, selectedCategory, searchTerm]);

    // Handle field type selection
    const handleSelect = (fieldType) => {
        onSelect(fieldType);
    };

    // Get category color
    const getCategoryColor = (category) => {
        const colors = {
            text: 'text-blue-600 bg-blue-100',
            number: 'text-green-600 bg-green-100',
            datetime: 'text-purple-600 bg-purple-100',
            choice: 'text-orange-600 bg-orange-100',
            file: 'text-gray-600 bg-gray-100',
            clinical: 'text-red-600 bg-red-100'
        };
        return colors[category] || 'text-gray-600 bg-gray-100';
    };

    return (
        <div className={`field-type-selector bg-white border rounded-lg shadow-sm ${className}`}>
            {/* Header */}
            <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                        Select Field Type
                    </h3>
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ×
                        </button>
                    )}
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search field types..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Categories */}
            <div className="px-4 py-3 border-b bg-gray-50">
                <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                        <button
                            key={category.id}
                            type="button"
                            onClick={() => setSelectedCategory(category.id)}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${selectedCategory === category.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            {category.label}
                            <span className="ml-1 text-xs opacity-75">
                                ({category.count})
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Field Types Grid */}
            <div className="p-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {filteredFieldTypes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg">No field types found</p>
                        <p className="text-sm">Try adjusting your search or category filter</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredFieldTypes.map(fieldType => {
                            const Icon = fieldType.icon;
                            const isSelected = selectedType === fieldType.value;

                            return (
                                <button
                                    key={fieldType.value}
                                    type="button"
                                    onClick={() => handleSelect(fieldType)}
                                    className={`p-4 border rounded-lg text-left transition-all hover:shadow-md ${isSelected
                                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className={`p-2 rounded-lg ${getCategoryColor(fieldType.category)}`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-gray-900 truncate">
                                                {fieldType.label}
                                            </h4>
                                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                {fieldType.description}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-2 italic">
                                                {fieldType.usage}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Category Badge */}
                                    <div className="flex items-center justify-between mt-3">
                                        <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(fieldType.category)}`}>
                                            {fieldType.category}
                                        </span>
                                        {isSelected && (
                                            <div className="flex items-center text-blue-600">
                                                <CheckSquare className="h-4 w-4" />
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Context Info */}
            {(context === 'study' || context === 'patient') && (
                <div className="px-4 py-3 bg-blue-50 border-t">
                    <div className="flex items-center space-x-2">
                        <Stethoscope className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-800">
                            <strong>Clinical Context:</strong> Additional clinical field types are available for {context} forms
                        </span>
                    </div>
                </div>
            )}

            {/* Footer */}
            {onCancel && (
                <div className="flex justify-end p-4 border-t bg-gray-50">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

FieldTypeSelector.propTypes = {
    context: PropTypes.oneOf(['general', 'study', 'template', 'patient']),
    onSelect: PropTypes.func.isRequired,
    onCancel: PropTypes.func,
    selectedType: PropTypes.string,
    showClinicalFields: PropTypes.bool,
    customFieldTypes: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        icon: PropTypes.elementType.isRequired,
        category: PropTypes.string.isRequired,
        usage: PropTypes.string.isRequired
    })),
    className: PropTypes.string
};

FieldTypeSelector.defaultProps = {
    showClinicalFields: false,
    customFieldTypes: []
};

export default FieldTypeSelector;