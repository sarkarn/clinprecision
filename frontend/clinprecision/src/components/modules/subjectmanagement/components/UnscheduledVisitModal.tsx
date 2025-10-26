import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle2, Calendar, FileText } from 'lucide-react';
import VisitService, { getVisitTypeLabel, VISIT_TYPES } from 'services/VisitService';

interface VisitType {
    id: number;
    visitCode: string;
    name: string;
}

interface FormData {
    visitType: string;
    visitDate: string;
    notes: string;
    createdBy: string;
}

interface Errors {
    visitType?: string;
    visitDate?: string;
    createdBy?: string;
}

interface CreatedVisit {
    visitId: number;
    [key: string]: any;
}

interface UnscheduledVisitModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientId: number;
    patientName: string;
    studyId: number;
    siteId: number;
    visitType?: string;
    onVisitCreated?: (visit: CreatedVisit) => void;
}

/**
 * Modal for creating unscheduled visits
 * 
 * Features:
 * - Visit type selection (SCREENING, ENROLLMENT, DISCONTINUATION, ADVERSE_EVENT)
 * - Visit date picker (defaults to today)
 * - Optional notes field
 * - Client-side validation
 * - Success/error feedback
 * - Auto-closes on success
 * - Optional callback to trigger form collection
 */
const UnscheduledVisitModal: React.FC<UnscheduledVisitModalProps> = ({
    isOpen,
    onClose,
    patientId,
    patientName,
    studyId,
    siteId,
    visitType = VISIT_TYPES.SCREENING,
    onVisitCreated
}) => {
    // Form state
    const [formData, setFormData] = useState<FormData>({
        visitType: visitType,
        visitDate: new Date().toISOString().split('T')[0],
        notes: '',
        createdBy: ''
    });

    // UI state
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Errors>({});
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [createdVisit, setCreatedVisit] = useState<CreatedVisit | null>(null);

    // Dynamic visit types from backend
    const [visitTypes, setVisitTypes] = useState<VisitType[]>([]);
    const [loadingVisitTypes, setLoadingVisitTypes] = useState(false);

    /**
     * Fetch unscheduled visit types for the study
     */
    useEffect(() => {
        if (isOpen && studyId) {
            setLoadingVisitTypes(true);
            VisitService.getUnscheduledVisitTypes(studyId)
                .then((types: any) => {
                    console.log('Loaded visit types:', types);
                    setVisitTypes(types);
                })
                .catch((error: any) => {
                    console.error('Failed to load visit types:', error);
                    setErrorMessage('Failed to load visit types: ' + error.message);
                    setShowError(true);
                })
                .finally(() => {
                    setLoadingVisitTypes(false);
                });
        }
    }, [isOpen, studyId]);

    /**
     * Initialize form when modal opens
     */
    useEffect(() => {
        if (isOpen) {
            const userId = localStorage.getItem('userId') || '1';

            setFormData({
                visitType: visitType,
                visitDate: new Date().toISOString().split('T')[0],
                notes: '',
                createdBy: userId
            });
            setShowSuccess(false);
            setShowError(false);
            setErrors({});
        }
    }, [isOpen, visitType]);

    /**
     * Handle input changes
     */
    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (errors[field as keyof Errors]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    /**
     * Validate form data
     */
    const validateForm = (): boolean => {
        const newErrors: Errors = {};

        if (!formData.visitType) {
            newErrors.visitType = 'Visit type is required';
        }

        if (!formData.visitDate) {
            newErrors.visitDate = 'Visit date is required';
        } else {
            const selectedDate = new Date(formData.visitDate);
            const today = new Date();
            const sevenDaysFromNow = new Date();
            sevenDaysFromNow.setDate(today.getDate() + 7);

            if (selectedDate > sevenDaysFromNow) {
                newErrors.visitDate = 'Visit date cannot be more than 7 days in the future';
            }
        }

        if (!formData.createdBy) {
            newErrors.createdBy = 'User ID is required (not logged in?)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Handle form submission
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);
        setShowError(false);
        setErrorMessage('');

        try {
            const visitData = {
                patientId: patientId,
                studyId: studyId,
                siteId: siteId,
                visitType: formData.visitType,
                visitDate: formData.visitDate,
                createdBy: formData.createdBy,
                notes: formData.notes.trim() || null
            } as any;

            console.log('[VISIT MODAL] Creating visit:', visitData);

            const result = await VisitService.createUnscheduledVisit(visitData) as any;

            console.log('[VISIT MODAL] Visit created successfully:', result);

            setCreatedVisit(result);
            setShowSuccess(true);

            if (onVisitCreated) {
                onVisitCreated(result);
            }

            setTimeout(() => {
                handleClose();
            }, 2000);

        } catch (error: any) {
            console.error('[VISIT MODAL] Error creating visit:', error);
            setErrorMessage(
                error.response?.data?.error ||
                error.message ||
                'Failed to create visit'
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
            const userId = localStorage.getItem('userId') || '1';
            setFormData({
                visitType: visitType,
                visitDate: new Date().toISOString().split('T')[0],
                notes: '',
                createdBy: userId
            });
            setErrors({});
            setShowSuccess(false);
            setShowError(false);
            setCreatedVisit(null);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            Create Unscheduled Visit
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Patient: {patientName} (ID: {patientId})
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
                                Visit Created Successfully!
                            </p>
                            <p className="text-sm text-green-700 mt-1">
                                {getVisitTypeLabel(formData.visitType)} created for {formData.visitDate}
                            </p>
                            {createdVisit && (
                                <p className="text-xs text-green-600 mt-1">
                                    Visit ID: {createdVisit.visitId}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {showError && (
                    <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-red-900">
                                Failed to Create Visit
                            </p>
                            <p className="text-sm text-red-700 mt-1">
                                {errorMessage}
                            </p>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Visit Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Visit Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.visitType}
                            onChange={(e) => handleInputChange('visitType', e.target.value)}
                            disabled={submitting || showSuccess || loadingVisitTypes}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.visitType ? 'border-red-500' : 'border-gray-300'
                                } ${submitting || showSuccess || loadingVisitTypes ? 'bg-gray-100' : ''}`}
                        >
                            {(() => {
                                console.log('[VISIT MODAL RENDER] Rendering select. visitTypes.length:', visitTypes.length);
                                console.log('[VISIT MODAL RENDER] visitTypes:', visitTypes);

                                if (loadingVisitTypes) {
                                    return <option value="">Loading visit types...</option>;
                                } else if (visitTypes.length > 0) {
                                    return (
                                        <>
                                            <option value="">Select visit type</option>
                                            {visitTypes.map((vt, index) => {
                                                console.log(`[VISIT MODAL RENDER] Rendering option ${index}:`, vt);
                                                return (
                                                    <option key={vt.id} value={vt.visitCode}>
                                                        {vt.name}
                                                    </option>
                                                );
                                            })}
                                        </>
                                    );
                                } else {
                                    return <option value="">No visit types available</option>;
                                }
                            })()}
                        </select>
                        {errors.visitType && (
                            <p className="mt-1 text-sm text-red-600">{errors.visitType}</p>
                        )}
                        {loadingVisitTypes && (
                            <p className="mt-1 text-sm text-gray-500">Loading available visit types...</p>
                        )}
                    </div>

                    {/* Visit Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Visit Date <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="date"
                                value={formData.visitDate}
                                onChange={(e) => handleInputChange('visitDate', e.target.value)}
                                disabled={submitting || showSuccess}
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.visitDate ? 'border-red-500' : 'border-gray-300'
                                    } ${submitting || showSuccess ? 'bg-gray-100' : ''}`}
                            />
                        </div>
                        {errors.visitDate && (
                            <p className="mt-1 text-sm text-red-600">{errors.visitDate}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Select the date when this visit will occur or has occurred
                        </p>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes
                        </label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <textarea
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                disabled={submitting || showSuccess}
                                rows={4}
                                placeholder="Optional notes about this visit..."
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${submitting || showSuccess ? 'bg-gray-100' : 'border-gray-300'
                                    }`}
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            Add any additional information about this visit
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={submitting}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={submitting || showSuccess}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                        >
                            {submitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating...
                                </>
                            ) : showSuccess ? (
                                <>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Created
                                </>
                            ) : (
                                'Create Visit'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UnscheduledVisitModal;
