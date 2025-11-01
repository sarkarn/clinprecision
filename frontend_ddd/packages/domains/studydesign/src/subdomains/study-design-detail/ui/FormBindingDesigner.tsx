import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Eye, Link, Unlink, Settings, Search, Filter } from 'lucide-react';
import { Alert, Button } from '../components/UIComponents';
import VisitDefinitionService, { VisitDefinition, VisitFormBinding, VisitFormBindingCreateData } from 'services/VisitDefinitionService';
import StudyService from 'services/StudyService';
import StudyFormService from 'services/data-capture/StudyFormService';
import StudyDesignService from 'services/StudyDesignService';
import type { Study } from '../../../types';
import type { StudyFormDefinition } from '../../../types/domain/DataEntry.types';

// ============================================================================
// Type Definitions
// ============================================================================

interface TransformedVisit {
    id: string;
    visitId?: string;
    studyId?: number;
    studyDesignUuid?: string;
    armId?: string | null;
    visitName: string;
    visitCode?: string;
    visitType?: string;
    dayOffset?: number;
    windowBefore?: number;
    windowAfter?: number;
    sequence?: number;
    isRequired?: boolean;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
    name: string;
    type: string;
    sequenceNumber?: number;
}

interface FormBindingWithMetadata extends VisitFormBinding {
    id: number;
    visitId?: string;
    formId?: string;
    timing?: string;
    conditions?: any[];
    reminders?: {
        enabled: boolean;
        days: number[];
    };
}

interface FormVisitMatrixProps {
    visits: TransformedVisit[];
    forms: StudyFormDefinition[];
    bindings: FormBindingWithMetadata[];
    getBinding: (visitId: string, formId: number | string) => FormBindingWithMetadata | undefined;
    onCreateBinding: (visitId: string, formId: number | string) => void;
    onRemoveBinding: (bindingId: number) => void;
    onSelectBinding: (binding: FormBindingWithMetadata) => void;
    selectedBinding: FormBindingWithMetadata | null;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    filterCategory: string;
    onFilterChange: (category: string) => void;
    formCategories: string[];
}

interface MatrixCellProps {
    visit: TransformedVisit;
    form: StudyFormDefinition;
    binding: FormBindingWithMetadata | undefined;
    isSelected: boolean;
    onCreateBinding: () => void;
    onRemoveBinding: () => void;
    onSelectBinding: () => void;
}

interface BindingDetailsPanelProps {
    binding: FormBindingWithMetadata;
    visits: TransformedVisit[];
    forms: StudyFormDefinition[];
    onUpdate: (updates: Partial<FormBindingWithMetadata>) => void;
    onRemove: () => void;
}

interface FormPreviewPanelProps {
    form: StudyFormDefinition | undefined;
    visit: TransformedVisit | undefined;
    binding: FormBindingWithMetadata | null;
}

interface TimingOption {
    value: string;
    label: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

// Helper function to get field count from form
const getFieldCount = (form: StudyFormDefinition): number => {
    if (typeof form.fields === 'number') {
        return form.fields; // Mock data format
    }
    if (typeof form.fields === 'string') {
        try {
            const parsedFields = JSON.parse(form.fields);
            return Array.isArray(parsedFields) ? parsedFields.length : 0;
        } catch {
            return 0;
        }
    }
    return 0;
};

// Helper function to transform visit response to ensure visitId is present
const transformVisitResponse = (visit: VisitDefinition | null): TransformedVisit | null => {
    if (!visit) {
        return null;
    }

    const visitId = visit.visitId || visit.id || null;

    return {
        ...visit,
        id: visitId ? String(visitId) : String(visit.id || ''),
        name: visit.visitName || `Visit ${visit.sequence || ''}`,
        type: (visit.visitType || 'REGULAR').toUpperCase(),
        sequenceNumber: visit.sequence
    };
};

const transformVisitCollection = (visits: VisitDefinition[] = []): TransformedVisit[] =>
    visits.map(transformVisitResponse).filter((v): v is TransformedVisit => v !== null);

/**
 * Form Binding Designer Component
 * Manages binding of forms to visits and configures form rules
 */
const FormBindingDesigner: React.FC = () => {
    const { studyId } = useParams<{ studyId: string }>();
    const navigate = useNavigate();

    // State management
    const [study, setStudy] = useState<Study | null>(null);
    const [visits, setVisits] = useState<TransformedVisit[]>([]);
    const [forms, setForms] = useState<StudyFormDefinition[]>([]);
    const [bindings, setBindings] = useState<FormBindingWithMetadata[]>([]);
    const [selectedBinding, setSelectedBinding] = useState<FormBindingWithMetadata | null>(null);
    const [selectedForm, setSelectedForm] = useState<StudyFormDefinition | null>(null);
    const [selectedVisit, setSelectedVisit] = useState<TransformedVisit | null>(null);
    const [filterCategory, setFilterCategory] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [errors, setErrors] = useState<string[]>([]);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isDirty, setIsDirty] = useState<boolean>(false);

    // Load study data
    useEffect(() => {
        loadStudyData();
    }, [studyId]);

    const loadStudyData = async () => {
        if (!studyId) return;

        try {
            setLoading(true);

            // Load actual data from backend APIs
            const [studyData, visitsData, bindingsData, formsData] = await Promise.all([
                StudyService.getStudyById(studyId),
                VisitDefinitionService.getVisitsByStudy(studyId),
                VisitDefinitionService.getVisitFormBindings(studyId), // Load visit-form bindings
                StudyFormService.getFormsByStudy(Number(studyId)) // Load study-specific forms
            ]);

            console.log('Raw visits data:', visitsData);
            const transformedVisits = transformVisitCollection(visitsData);
            console.log('Transformed visits:', transformedVisits);

            setStudy(studyData);
            setVisits(transformedVisits);
            setBindings((bindingsData || []) as FormBindingWithMetadata[]);
            setForms(formsData || []);

            setLoading(false);
        } catch (error) {
            console.error('Error loading form bindings:', error);
            setErrors(['Failed to load form binding data']);
            setLoading(false);
        }
    };

    // Create new binding
    const handleCreateBinding = async (visitId: string, formId: number | string) => {
        if (!studyId) return;

        try {
            console.log('Creating binding with:', { visitId, formId, studyId });

            // Check if binding already exists
            const existingBinding = bindings.find(b =>
                (b.visitDefinitionId === visitId || b.visitId === visitId) &&
                (b.formDefinitionId === formId || b.formId === String(formId))
            );
            if (existingBinding) {
                alert('This form is already bound to this visit');
                return;
            }

            const newBinding: VisitFormBindingCreateData = {
                studyId,
                visitDefinitionId: visitId,
                formDefinitionId: formId,
                isRequired: true,
                sequence: bindings.length + 1
            };

            console.log('New binding data:', newBinding);

            const createdBinding = await VisitDefinitionService.createVisitFormBinding(newBinding);
            const bindingWithMetadata: FormBindingWithMetadata = {
                ...createdBinding,
                id: createdBinding.id || 0,
                timing: 'ANY_TIME',
                conditions: [],
                reminders: { enabled: true, days: [1] }
            };
            const updatedBindings = [...bindings, bindingWithMetadata];
            setBindings(updatedBindings);
            setSelectedBinding(bindingWithMetadata);
            setIsDirty(true);
        } catch (error) {
            console.error('Error creating binding:', error);
            setErrors(['Failed to create form binding']);
        }
    };

    // Remove binding
    const handleRemoveBinding = async (bindingId: number) => {
        if (window.confirm('Are you sure you want to remove this form binding?')) {
            try {
                await VisitDefinitionService.deleteVisitFormBinding(String(bindingId));
                const updatedBindings = bindings.filter(b => b.id !== bindingId);
                setBindings(updatedBindings);
                if (selectedBinding && selectedBinding.id === bindingId) {
                    setSelectedBinding(null);
                }
                setIsDirty(true);
            } catch (error) {
                console.error('Error removing binding:', error);
                setErrors(['Failed to remove form binding']);
            }
        }
    };

    // Update binding
    const handleUpdateBinding = async (bindingId: number, updates: Partial<FormBindingWithMetadata>) => {
        try {
            const updatedBinding = await VisitDefinitionService.updateVisitFormBinding(String(bindingId), updates);
            const bindingWithMetadata: FormBindingWithMetadata = {
                ...updatedBinding,
                id: updatedBinding.id || 0,
                timing: (updates as any).timing || 'ANY_TIME',
                conditions: (updates as any).conditions || [],
                reminders: (updates as any).reminders || { enabled: true, days: [1] }
            };
            const updatedBindings = bindings.map(binding =>
                binding.id === bindingId ? bindingWithMetadata : binding
            );
            setBindings(updatedBindings);
            if (selectedBinding && selectedBinding.id === bindingId) {
                setSelectedBinding(bindingWithMetadata);
            }
            setIsDirty(true);
        } catch (error) {
            console.error('Error updating binding:', error);
            setErrors(['Failed to update form binding']);
        }
    };

    // Save changes
    const handleSave = async () => {
        if (!studyId) return;

        try {
            // Clear previous messages
            setErrors([]);
            setSuccessMessage(null);

            // Validate data
            const validationErrors = validateBindingsData();
            if (validationErrors.length > 0) {
                setErrors(validationErrors);
                return;
            }

            // Mock save - replace with actual API call
            console.log('Saving form bindings:', { studyId, bindings });

            // Update design progress to indicate forms phase is completed
            await StudyDesignService.updateDesignProgress(studyId, {
                phase: 'forms',
                isComplete: true,
                percentageComplete: 100
            });

            setIsDirty(false);

            // Show success message
            setSuccessMessage(`Form bindings saved successfully! ${bindings.length} binding(s) configured.`);

            // Auto-dismiss after 5 seconds
            setTimeout(() => {
                setSuccessMessage(null);
            }, 5000);

        } catch (error) {
            console.error('Error saving form bindings:', error);
            setErrors(['Failed to save form bindings']);
            setSuccessMessage(null);
        }
    };

    // Validate bindings data
    const validateBindingsData = (): string[] => {
        const errors: string[] = [];

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
            (form.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !filterCategory || form.formType === filterCategory;
        return matchesSearch && matchesCategory;
    });

    // Get form categories
    const formCategories = [...new Set(forms.map(f => f.formType).filter(Boolean) as string[])];

    // Get binding for visit and form
    const getBinding = (visitId: string, formId: number | string): FormBindingWithMetadata | undefined => {
        return bindings.find(b =>
            (b.visitDefinitionId === visitId || b.visitId === visitId) &&
            (b.formDefinitionId === formId || b.formId === String(formId))
        );
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
                        <Button
                            variant="outline"
                            onClick={() => navigate(`/study-design/study/${studyId}/forms`)}
                        >
                            Manage Study Forms
                        </Button>
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

            {/* Fixed Position Success Toast */}
            {successMessage && (
                <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
                    <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 min-w-[320px]">
                        <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                            <p className="font-semibold">Success!</p>
                            <p className="text-sm text-green-100">{successMessage}</p>
                        </div>
                        <button
                            onClick={() => setSuccessMessage(null)}
                            className="text-white hover:text-green-100 flex-shrink-0"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Errors */}
            {errors.length > 0 && (
                <Alert
                    type="error"
                    title="Validation Errors"
                    message={errors.join('; ')}
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
                    form={forms.find(f => f.id === (selectedForm?.id || Number(selectedBinding.formId)))}
                    visit={visits.find(v => v.id === selectedBinding?.visitId)}
                    binding={selectedBinding}
                />
            )}
        </div>
    );
};

// Form-Visit Matrix Component
const FormVisitMatrix: React.FC<FormVisitMatrixProps> = ({
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
                                <th key={visit.id || `visit-${visit.sequenceNumber}`} className="px-3 py-3 text-center text-sm font-medium text-gray-900 min-w-32">
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
                                        <div className="text-sm text-gray-500">{form.formType}</div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            {getFieldCount(form)} fields • v{form.version}
                                        </div>
                                    </div>
                                </td>
                                {visits.map(visit => {
                                    const binding = getBinding(visit.id, form.id);
                                    const cellKey = `${visit.id || `v-${visit.sequenceNumber}`}-${form.id}`;
                                    return (
                                        <td key={cellKey} className="px-3 py-3 text-center">
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
const MatrixCell: React.FC<MatrixCellProps> = ({
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
const BindingDetailsPanel: React.FC<BindingDetailsPanelProps> = ({ binding, visits, forms, onUpdate, onRemove }) => {
    const visit = visits.find(v => v.id === binding.visitId);
    const form = forms.find(f => f.id === Number(binding.formId));

    const timingOptions: TimingOption[] = [
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
                                                        enabled: binding.reminders?.enabled || true,
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
                            <span className="ml-2 text-gray-600">~{(form as any)?.estimatedTime || 10} minutes</span>
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
const FormPreviewPanel: React.FC<FormPreviewPanelProps> = ({ form, visit, binding }) => {
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
                            <div>{form.formType}</div>
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
                                    Timing: {binding.timing?.replace('_', ' ').toLowerCase()}
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
                        {form.formType === 'Demographics' && (
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

                        {form.formType === 'Vital Signs' && (
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
                        {!['Demographics', 'Vital Signs'].includes(form.formType || '') && (
                            <div className="text-gray-500 text-center py-4">
                                <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                <p>Form contains {getFieldCount(form)} fields</p>
                                <p className="text-sm">Version: {form.version}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormBindingDesigner;
