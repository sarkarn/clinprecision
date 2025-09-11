import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Eye, Link, Unlink, Settings, Search, Filter } from 'lucide-react';
import { Alert, Button } from '../components/UIComponents';

/**
 * Form Binding Designer Component
 * Manages binding of forms to visits and configures form rules
 */
const FormBindingDesigner = () => {
    const { studyId } = useParams();
    const navigate = useNavigate();

    // State management
    const [study, setStudy] = useState(null);
    const [visits, setVisits] = useState([]);
    const [forms, setForms] = useState([]);
    const [bindings, setBindings] = useState([]);
    const [selectedBinding, setSelectedBinding] = useState(null);
    const [selectedForm, setSelectedForm] = useState(null);
    const [selectedVisit, setSelectedVisit] = useState(null);
    const [filterCategory, setFilterCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState([]);
    const [isDirty, setIsDirty] = useState(false);

    // Load study data
    useEffect(() => {
        loadStudyData();
    }, [studyId]);

    const loadStudyData = async () => {
        try {
            setLoading(true);

            // Mock data - replace with actual API call
            const mockData = {
                study: {
                    id: studyId,
                    name: 'Phase III Oncology Trial - Advanced NSCLC',
                    state: 'DESIGN'
                },
                visits: [
                    { id: 'V001', name: 'Screening', type: 'SCREENING' },
                    { id: 'V002', name: 'Baseline/Day 1', type: 'BASELINE' },
                    { id: 'V003', name: 'Week 2', type: 'TREATMENT' },
                    { id: 'V004', name: 'Week 4', type: 'TREATMENT' },
                    { id: 'V005', name: 'Week 8', type: 'TREATMENT' },
                    { id: 'V006', name: 'Week 12', type: 'TREATMENT' },
                    { id: 'V007', name: 'End of Treatment', type: 'END_OF_TREATMENT' },
                    { id: 'V008', name: 'Follow-up 30 days', type: 'FOLLOW_UP' }
                ],
                forms: [
                    {
                        id: 'demographics',
                        name: 'Demographics',
                        category: 'Subject Information',
                        description: 'Basic demographic information',
                        fields: 15,
                        version: '1.0',
                        isRequired: true,
                        estimatedTime: 5
                    },
                    {
                        id: 'medical_history',
                        name: 'Medical History',
                        category: 'Medical Assessment',
                        description: 'Comprehensive medical history',
                        fields: 25,
                        version: '1.2',
                        isRequired: true,
                        estimatedTime: 10
                    },
                    {
                        id: 'inclusion_exclusion',
                        name: 'Inclusion/Exclusion Criteria',
                        category: 'Eligibility',
                        description: 'Study eligibility criteria assessment',
                        fields: 20,
                        version: '1.0',
                        isRequired: true,
                        estimatedTime: 8
                    },
                    {
                        id: 'vital_signs',
                        name: 'Vital Signs',
                        category: 'Clinical Assessment',
                        description: 'Blood pressure, heart rate, temperature',
                        fields: 8,
                        version: '1.1',
                        isRequired: true,
                        estimatedTime: 3
                    },
                    {
                        id: 'laboratory',
                        name: 'Laboratory Results',
                        category: 'Laboratory',
                        description: 'Hematology, chemistry, urinalysis',
                        fields: 45,
                        version: '1.3',
                        isRequired: true,
                        estimatedTime: 15
                    },
                    {
                        id: 'adverse_events',
                        name: 'Adverse Events',
                        category: 'Safety',
                        description: 'Adverse event reporting',
                        fields: 12,
                        version: '1.0',
                        isRequired: false,
                        estimatedTime: 10
                    },
                    {
                        id: 'concomitant_meds',
                        name: 'Concomitant Medications',
                        category: 'Medical Assessment',
                        description: 'Prior and concomitant medications',
                        fields: 18,
                        version: '1.1',
                        isRequired: true,
                        estimatedTime: 7
                    },
                    {
                        id: 'ecg_reading',
                        name: 'ECG Reading',
                        category: 'Cardiac Assessment',
                        description: 'Electrocardiogram interpretation',
                        fields: 10,
                        version: '1.0',
                        isRequired: true,
                        estimatedTime: 5
                    },
                    {
                        id: 'tumor_assessment',
                        name: 'Tumor Assessment (RECIST)',
                        category: 'Efficacy',
                        description: 'RECIST 1.1 tumor measurements',
                        fields: 30,
                        version: '1.0',
                        isRequired: true,
                        estimatedTime: 20
                    },
                    {
                        id: 'quality_of_life',
                        name: 'Quality of Life (EORTC QLQ-C30)',
                        category: 'Patient Reported Outcomes',
                        description: 'EORTC QLQ-C30 questionnaire',
                        fields: 30,
                        version: '1.0',
                        isRequired: false,
                        estimatedTime: 15
                    }
                ],
                bindings: [
                    {
                        id: 'B001',
                        visitId: 'V001',
                        formId: 'demographics',
                        isRequired: true,
                        timing: 'ANY_TIME',
                        conditions: [],
                        reminders: { enabled: true, days: [1, 3] }
                    },
                    {
                        id: 'B002',
                        visitId: 'V001',
                        formId: 'medical_history',
                        isRequired: true,
                        timing: 'ANY_TIME',
                        conditions: [],
                        reminders: { enabled: true, days: [1] }
                    },
                    {
                        id: 'B003',
                        visitId: 'V001',
                        formId: 'inclusion_exclusion',
                        isRequired: true,
                        timing: 'BEFORE_PROCEDURES',
                        conditions: [],
                        reminders: { enabled: true, days: [1] }
                    },
                    {
                        id: 'B004',
                        visitId: 'V002',
                        formId: 'vital_signs',
                        isRequired: true,
                        timing: 'BEFORE_PROCEDURES',
                        conditions: [],
                        reminders: { enabled: true, days: [1] }
                    },
                    {
                        id: 'B005',
                        visitId: 'V002',
                        formId: 'laboratory',
                        isRequired: true,
                        timing: 'ANY_TIME',
                        conditions: [],
                        reminders: { enabled: true, days: [1, 2] }
                    }
                ]
            };

            setStudy(mockData.study);
            setVisits(mockData.visits);
            setForms(mockData.forms);
            setBindings(mockData.bindings);
            setLoading(false);
        } catch (error) {
            console.error('Error loading form bindings:', error);
            setErrors(['Failed to load form binding data']);
            setLoading(false);
        }
    };

    // Create new binding
    const handleCreateBinding = (visitId, formId) => {
        // Check if binding already exists
        const existingBinding = bindings.find(b => b.visitId === visitId && b.formId === formId);
        if (existingBinding) {
            alert('This form is already bound to this visit');
            return;
        }

        const newBinding = {
            id: `B${String(bindings.length + 1).padStart(3, '0')}`,
            visitId,
            formId,
            isRequired: true,
            timing: 'ANY_TIME',
            conditions: [],
            reminders: { enabled: true, days: [1] }
        };

        const updatedBindings = [...bindings, newBinding];
        setBindings(updatedBindings);
        setSelectedBinding(newBinding);
        setIsDirty(true);
    };

    // Remove binding
    const handleRemoveBinding = (bindingId) => {
        if (window.confirm('Are you sure you want to remove this form binding?')) {
            const updatedBindings = bindings.filter(b => b.id !== bindingId);
            setBindings(updatedBindings);
            if (selectedBinding && selectedBinding.id === bindingId) {
                setSelectedBinding(null);
            }
            setIsDirty(true);
        }
    };

    // Update binding
    const handleUpdateBinding = (bindingId, updates) => {
        const updatedBindings = bindings.map(binding =>
            binding.id === bindingId ? { ...binding, ...updates } : binding
        );
        setBindings(updatedBindings);
        if (selectedBinding && selectedBinding.id === bindingId) {
            setSelectedBinding({ ...selectedBinding, ...updates });
        }
        setIsDirty(true);
    };

    // Save changes
    const handleSave = async () => {
        try {
            // Validate data
            const validationErrors = validateBindingsData();
            if (validationErrors.length > 0) {
                setErrors(validationErrors);
                return;
            }

            // Mock save - replace with actual API call
            console.log('Saving form bindings:', { studyId, bindings });
            setIsDirty(false);
            setErrors([]);
        } catch (error) {
            console.error('Error saving form bindings:', error);
            setErrors(['Failed to save form bindings']);
        }
    };

    // Validate bindings data
    const validateBindingsData = () => {
        const errors = [];

        // Check for required forms in baseline visit
        const baselineVisit = visits.find(v => v.type === 'BASELINE');
        if (baselineVisit) {
            const baselineBindings = bindings.filter(b => b.visitId === baselineVisit.id);
            if (baselineBindings.length === 0) {
                errors.push('Baseline visit must have at least one form');
            }
        }

        return errors;
    };

    // Filter forms
    const filteredForms = forms.filter(form => {
        const matchesSearch = form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            form.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !filterCategory || form.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    // Get form categories
    const formCategories = [...new Set(forms.map(f => f.category))];

    // Get binding for visit and form
    const getBinding = (visitId, formId) => {
        return bindings.find(b => b.visitId === visitId && b.formId === formId);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading form bindings...</span>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Form Binding Design</h1>
                        <p className="text-gray-600 mt-1">
                            Bind forms to visits and configure data collection rules for {study?.name}
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <Button variant="outline" onClick={() => navigate(-1)}>
                            Back
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!isDirty}
                            variant="primary"
                        >
                            Save Changes
                        </Button>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <FileText className="h-5 w-5 text-blue-600 mr-2" />
                            <span className="text-sm font-medium text-blue-900">Total Forms</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-900 mt-1">{forms.length}</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <Link className="h-5 w-5 text-green-600 mr-2" />
                            <span className="text-sm font-medium text-green-900">Form Bindings</span>
                        </div>
                        <div className="text-2xl font-bold text-green-900 mt-1">{bindings.length}</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <Settings className="h-5 w-5 text-purple-600 mr-2" />
                            <span className="text-sm font-medium text-purple-900">Required Forms</span>
                        </div>
                        <div className="text-2xl font-bold text-purple-900 mt-1">
                            {bindings.filter(b => b.isRequired).length}
                        </div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <Eye className="h-5 w-5 text-orange-600 mr-2" />
                            <span className="text-sm font-medium text-orange-900">Categories</span>
                        </div>
                        <div className="text-2xl font-bold text-orange-900 mt-1">{formCategories.length}</div>
                    </div>
                </div>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
                <Alert
                    type="error"
                    title="Validation Errors"
                    message={
                        <ul className="list-disc list-inside space-y-1">
                            {errors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    }
                    onClose={() => setErrors([])}
                />
            )}

            {/* Form-Visit Matrix */}
            <FormVisitMatrix
                visits={visits}
                forms={filteredForms}
                bindings={bindings}
                getBinding={getBinding}
                onCreateBinding={handleCreateBinding}
                onRemoveBinding={handleRemoveBinding}
                onSelectBinding={setSelectedBinding}
                selectedBinding={selectedBinding}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filterCategory={filterCategory}
                onFilterChange={setFilterCategory}
                formCategories={formCategories}
            />

            {/* Binding Details */}
            {selectedBinding && (
                <BindingDetailsPanel
                    binding={selectedBinding}
                    visits={visits}
                    forms={forms}
                    onUpdate={(updates) => handleUpdateBinding(selectedBinding.id, updates)}
                    onRemove={() => handleRemoveBinding(selectedBinding.id)}
                />
            )}

            {/* Form Preview */}
            {(selectedForm || (selectedBinding && selectedBinding.formId)) && (
                <FormPreviewPanel
                    form={forms.find(f => f.id === (selectedForm?.id || selectedBinding.formId))}
                    visit={visits.find(v => v.id === selectedBinding?.visitId)}
                    binding={selectedBinding}
                />
            )}
        </div>
    );
};

// Form-Visit Matrix Component
const FormVisitMatrix = ({
    visits,
    forms,
    bindings,
    getBinding,
    onCreateBinding,
    onRemoveBinding,
    onSelectBinding,
    selectedBinding,
    searchTerm,
    onSearchChange,
    filterCategory,
    onFilterChange,
    formCategories
}) => {
    return (
        <div className="bg-white rounded-lg shadow">
            {/* Filter Controls */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search forms..."
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <div className="sm:w-48">
                        <select
                            value={filterCategory}
                            onChange={(e) => onFilterChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Categories</option>
                            {formCategories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Matrix */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left text-sm font-medium text-gray-900 border-r border-gray-200 min-w-64">
                                Forms
                            </th>
                            {visits.map(visit => (
                                <th key={visit.id} className="px-3 py-3 text-center text-sm font-medium text-gray-900 min-w-32">
                                    <div className="transform -rotate-45 origin-center whitespace-nowrap">
                                        {visit.name}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {forms.map(form => (
                            <tr key={form.id} className="hover:bg-gray-50">
                                <td className="sticky left-0 bg-white px-4 py-3 border-r border-gray-200">
                                    <div>
                                        <div className="font-medium text-gray-900">{form.name}</div>
                                        <div className="text-sm text-gray-500">{form.category}</div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            {form.fields} fields • ~{form.estimatedTime}min
                                        </div>
                                    </div>
                                </td>
                                {visits.map(visit => {
                                    const binding = getBinding(visit.id, form.id);
                                    return (
                                        <td key={`${visit.id}-${form.id}`} className="px-3 py-3 text-center">
                                            <MatrixCell
                                                visit={visit}
                                                form={form}
                                                binding={binding}
                                                isSelected={selectedBinding?.id === binding?.id}
                                                onCreateBinding={() => onCreateBinding(visit.id, form.id)}
                                                onRemoveBinding={() => binding && onRemoveBinding(binding.id)}
                                                onSelectBinding={() => binding && onSelectBinding(binding)}
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {forms.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No forms match the current filter criteria
                    </div>
                )}
            </div>
        </div>
    );
};

// Matrix Cell Component
const MatrixCell = ({
    visit,
    form,
    binding,
    isSelected,
    onCreateBinding,
    onRemoveBinding,
    onSelectBinding
}) => {
    if (binding) {
        return (
            <div className="relative group">
                <button
                    onClick={onSelectBinding}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${isSelected
                            ? 'bg-blue-600 border-blue-800 text-white'
                            : binding.isRequired
                                ? 'bg-green-500 border-green-700 text-white hover:bg-green-600'
                                : 'bg-yellow-500 border-yellow-700 text-white hover:bg-yellow-600'
                        }`}
                    title={`${form.name} - ${binding.isRequired ? 'Required' : 'Optional'}`}
                >
                    <FileText className="h-4 w-4" />
                </button>

                {/* Hover actions */}
                <div className="absolute top-0 right-0 -mt-1 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemoveBinding();
                        }}
                        className="w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                        title="Remove binding"
                    >
                        ×
                    </button>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={onCreateBinding}
            className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 text-gray-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 flex items-center justify-center"
            title={`Bind ${form.name} to ${visit.name}`}
        >
            <Link className="h-4 w-4" />
        </button>
    );
};

// Binding Details Panel Component
const BindingDetailsPanel = ({ binding, visits, forms, onUpdate, onRemove }) => {
    const visit = visits.find(v => v.id === binding.visitId);
    const form = forms.find(f => f.id === binding.formId);

    const timingOptions = [
        { value: 'ANY_TIME', label: 'Any time during visit' },
        { value: 'BEFORE_PROCEDURES', label: 'Before procedures' },
        { value: 'AFTER_PROCEDURES', label: 'After procedures' },
        { value: 'SPECIFIC_TIME', label: 'Specific time' }
    ];

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">Binding Details</h3>
                    <p className="text-gray-600 mt-1">
                        {form?.name} → {visit?.name}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onRemove}
                    className="text-red-600 hover:text-red-800"
                >
                    <Unlink className="h-4 w-4 mr-1" />
                    Remove Binding
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Settings */}
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Basic Settings</h4>

                    <div>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={binding.isRequired}
                                onChange={(e) => onUpdate({ isRequired: e.target.checked })}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Required Form</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                            Required forms must be completed for visit to be considered complete
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Data Entry Timing
                        </label>
                        <select
                            value={binding.timing}
                            onChange={(e) => onUpdate({ timing: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {timingOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Reminders */}
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Reminders</h4>

                    <div>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={binding.reminders?.enabled || false}
                                onChange={(e) => onUpdate({
                                    reminders: {
                                        ...binding.reminders,
                                        enabled: e.target.checked,
                                        days: binding.reminders?.days || [1]
                                    }
                                })}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Enable Reminders</span>
                        </label>
                    </div>

                    {binding.reminders?.enabled && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Reminder Schedule (days before visit)
                            </label>
                            <div className="space-y-2">
                                {[1, 2, 3, 7, 14].map(day => (
                                    <label key={day} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={binding.reminders?.days?.includes(day) || false}
                                            onChange={(e) => {
                                                const currentDays = binding.reminders?.days || [];
                                                const newDays = e.target.checked
                                                    ? [...currentDays, day]
                                                    : currentDays.filter(d => d !== day);
                                                onUpdate({
                                                    reminders: {
                                                        ...binding.reminders,
                                                        days: newDays.sort((a, b) => a - b)
                                                    }
                                                });
                                            }}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">
                                            {day} day{day > 1 ? 's' : ''} before
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Form Information */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Form Information</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="font-medium text-gray-700">Fields:</span>
                            <span className="ml-2 text-gray-600">{form?.fields}</span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">Est. Time:</span>
                            <span className="ml-2 text-gray-600">~{form?.estimatedTime} minutes</span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">Version:</span>
                            <span className="ml-2 text-gray-600">{form?.version}</span>
                        </div>
                    </div>
                    <div className="mt-2">
                        <span className="font-medium text-gray-700">Description:</span>
                        <span className="ml-2 text-gray-600">{form?.description}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Form Preview Panel Component
const FormPreviewPanel = ({ form, visit, binding }) => {
    if (!form) return null;

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Form Preview</h3>

            <div className="space-y-4">
                {/* Form Header */}
                <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-medium text-gray-900">{form.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{form.description}</p>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                            <div>Version {form.version}</div>
                            <div>{form.category}</div>
                        </div>
                    </div>

                    {visit && binding && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center space-x-4 text-sm">
                                <span className={`px-2 py-1 rounded-full ${binding.isRequired
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {binding.isRequired ? 'Required' : 'Optional'}
                                </span>
                                <span className="text-gray-600">
                                    Visit: {visit.name}
                                </span>
                                <span className="text-gray-600">
                                    Timing: {binding.timing.replace('_', ' ').toLowerCase()}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mock Form Fields */}
                <div className="border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-3">Form Fields Preview</h5>
                    <div className="space-y-3">
                        {/* Sample fields based on form type */}
                        {form.id === 'demographics' && (
                            <>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                        <input type="date" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" disabled />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                                        <select className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" disabled>
                                            <option>Select...</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Race/Ethnicity</label>
                                    <select className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" disabled>
                                        <option>Select...</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {form.id === 'vital_signs' && (
                            <>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Systolic BP (mmHg)</label>
                                        <input type="number" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" disabled />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Diastolic BP (mmHg)</label>
                                        <input type="number" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" disabled />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Heart Rate (bpm)</label>
                                        <input type="number" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" disabled />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Generic preview for other forms */}
                        {!['demographics', 'vital_signs'].includes(form.id) && (
                            <div className="text-gray-500 text-center py-4">
                                <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                <p>Form contains {form.fields} fields</p>
                                <p className="text-sm">Estimated completion time: ~{form.estimatedTime} minutes</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormBindingDesigner;
