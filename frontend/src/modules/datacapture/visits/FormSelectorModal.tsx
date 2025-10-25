// FormSelectorModal.tsx
import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle2, Search, Plus, FileText } from 'lucide-react';
import { addMultipleFormsToVisit, STANDARD_FORM_SETS } from '../../../utils/visitFormHelpers';
import FormService from '../../../services/FormService';

// Type definitions
interface Form {
    id: number;
    name: string;
    formType?: string;
    description?: string;
}

interface FormSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    studyId?: number;
    visitInstanceId: number;
    visitType?: string;
    onFormsAdded?: (formIds: number[]) => void;
}

/**
 * Modal for selecting and assigning forms to an unscheduled visit
 * 
 * Features:
 * - Load available forms from study
 * - Quick "Use Standard Forms" buttons for common visit types
 * - Search/filter forms
 * - Multi-select forms with checkboxes
 * - Assign selected forms to visit
 * - Success/error feedback
 */
const FormSelectorModal: React.FC<FormSelectorModalProps> = ({
    isOpen,
    onClose,
    studyId,
    visitInstanceId,
    visitType,
    onFormsAdded
}) => {
    // Form state
    const [availableForms, setAvailableForms] = useState<Form[]>([]);
    const [selectedFormIds, setSelectedFormIds] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');

    // UI state
    const [loadingForms, setLoadingForms] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [showSuccess, setShowSuccess] = useState<boolean>(false);
    const [showError, setShowError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    /**
     * Fetch available forms for the study
     */
    useEffect(() => {
        if (isOpen && studyId) {
            loadAvailableForms();
        }
    }, [isOpen, studyId]);

    const loadAvailableForms = async () => {
        setLoadingForms(true);
        try {
            // Fetch forms from study using FormService
            console.log('[FORM SELECTOR] Loading forms for study:', studyId);
            const formsData = await FormService.getFormsByStudy(studyId!) as any;
            console.log('[FORM SELECTOR] Loaded forms:', formsData);
            setAvailableForms(formsData || []);
        } catch (error: any) {
            console.error('[FORM SELECTOR] Error loading forms:', error);
            setErrorMessage('Failed to load forms: ' + (error.response?.data?.error || error.message));
            setShowError(true);
        } finally {
            setLoadingForms(false);
        }
    };

    /**
     * Toggle form selection
     */
    const toggleFormSelection = (formId: number) => {
        setSelectedFormIds(prev => {
            if (prev.includes(formId)) {
                return prev.filter(id => id !== formId);
            } else {
                return [...prev, formId];
            }
        });
    };

    /**
     * Use standard forms for visit type
     */
    const useStandardForms = () => {
        const standardFormNames = (STANDARD_FORM_SETS as any)[visitType!] || [];

        // Find matching forms by name
        const matchingFormIds = availableForms
            .filter(form => standardFormNames.some((name: string) =>
                form.name?.toLowerCase().includes(name.toLowerCase()) ||
                form.formType?.toLowerCase().includes(name.toLowerCase())
            ))
            .map(form => form.id);

        if (matchingFormIds.length > 0) {
            setSelectedFormIds(matchingFormIds);
            console.log('[FORM SELECTOR] Selected standard forms:', matchingFormIds);
        } else {
            setErrorMessage(`No standard forms found for ${visitType}. Please select forms manually.`);
            setShowError(true);
            setTimeout(() => setShowError(false), 3000);
        }
    };

    /**
     * Filter forms by search query
     */
    const filteredForms = availableForms.filter(form => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            form.name?.toLowerCase().includes(query) ||
            form.formType?.toLowerCase().includes(query) ||
            form.description?.toLowerCase().includes(query)
        );
    });

    /**
     * Submit selected forms
     */
    const handleSubmit = async () => {
        if (selectedFormIds.length === 0) {
            setErrorMessage('Please select at least one form');
            setShowError(true);
            setTimeout(() => setShowError(false), 3000);
            return;
        }

        setSubmitting(true);
        setShowError(false);
        setErrorMessage('');

        try {
            console.log('[FORM SELECTOR] Assigning forms:', {
                visitInstanceId,
                formIds: selectedFormIds
            });

            // Use helper utility to assign forms
            await addMultipleFormsToVisit(visitInstanceId, selectedFormIds);

            console.log('[FORM SELECTOR] Forms assigned successfully');
            setShowSuccess(true);

            // Notify parent
            if (onFormsAdded) {
                onFormsAdded(selectedFormIds);
            }

            // Auto-close after 1.5 seconds
            setTimeout(() => {
                handleClose();
            }, 1500);

        } catch (error: any) {
            console.error('[FORM SELECTOR] Error assigning forms:', error);
            setErrorMessage(
                error.response?.data?.error ||
                error.message ||
                'Failed to assign forms'
            );
            setShowError(true);
        } finally {
            setSubmitting(false);
        }
    };

    /**
     * Handle modal close
     */
    const handleClose = () => {
        if (!submitting) {
            setSelectedFormIds([]);
            setSearchQuery('');
            setShowSuccess(false);
            setShowError(false);
            setErrorMessage('');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            Add Forms to Visit
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Select forms to assign to this unscheduled visit
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={submitting}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Success Message */}
                {showSuccess && (
                    <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-green-900">
                                Forms Added Successfully!
                            </p>
                            <p className="text-sm text-green-700 mt-1">
                                {selectedFormIds.length} form{selectedFormIds.length !== 1 ? 's' : ''} assigned to visit
                            </p>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {showError && (
                    <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-red-900">
                                Error
                            </p>
                            <p className="text-sm text-red-700 mt-1">
                                {errorMessage}
                            </p>
                        </div>
                    </div>
                )}

                <div className="p-6">
                    {/* Quick Actions */}
                    {visitType && (STANDARD_FORM_SETS as any)[visitType] && (
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-blue-900">
                                        Quick Select
                                    </h3>
                                    <p className="text-xs text-blue-700 mt-1">
                                        Use standard forms for {visitType} visits
                                    </p>
                                </div>
                                <button
                                    onClick={useStandardForms}
                                    disabled={submitting || showSuccess || loadingForms}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center text-sm"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Use Standard Forms
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Search */}
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search forms by name or code..."
                                disabled={submitting || showSuccess}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Selection Summary */}
                    {selectedFormIds.length > 0 && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                            <p className="text-sm text-green-800">
                                <span className="font-semibold">{selectedFormIds.length}</span> form{selectedFormIds.length !== 1 ? 's' : ''} selected
                            </p>
                            <button
                                onClick={() => setSelectedFormIds([])}
                                disabled={submitting || showSuccess}
                                className="text-sm text-green-700 hover:text-green-900 underline"
                            >
                                Clear all
                            </button>
                        </div>
                    )}

                    {/* Forms List */}
                    <div className="border border-gray-200 rounded-lg">
                        {loadingForms ? (
                            <div className="p-8 text-center text-gray-500">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                Loading forms...
                            </div>
                        ) : filteredForms.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                <p>No forms found</p>
                                {searchQuery && (
                                    <p className="text-sm mt-1">Try a different search term</p>
                                )}
                            </div>
                        ) : (
                            <div className="max-h-96 overflow-y-auto">
                                {filteredForms.map((form, index) => (
                                    <label
                                        key={form.id}
                                        className={`flex items-start p-4 hover:bg-gray-50 cursor-pointer transition-colors ${index !== filteredForms.length - 1 ? 'border-b border-gray-200' : ''
                                            } ${selectedFormIds.includes(form.id) ? 'bg-blue-50' : ''}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedFormIds.includes(form.id)}
                                            onChange={() => toggleFormSelection(form.id)}
                                            disabled={submitting || showSuccess}
                                            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <div className="ml-3 flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {form.name}
                                                </p>
                                                {form.formType && (
                                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded ml-2">
                                                        {form.formType}
                                                    </span>
                                                )}
                                            </div>
                                            {form.description && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {form.description}
                                                </p>
                                            )}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t bg-gray-50 sticky bottom-0">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={submitting}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting || showSuccess || selectedFormIds.length === 0}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                    >
                        {submitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Adding Forms...
                            </>
                        ) : showSuccess ? (
                            <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Added
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4 mr-2" />
                                Add {selectedFormIds.length > 0 ? selectedFormIds.length : ''} Form{selectedFormIds.length !== 1 ? 's' : ''}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FormSelectorModal;
