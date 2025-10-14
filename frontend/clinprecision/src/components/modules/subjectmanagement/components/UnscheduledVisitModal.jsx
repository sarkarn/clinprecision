// src/components/modules/subjectmanagement/components/UnscheduledVisitModal.jsx
import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle2, Calendar, FileText } from 'lucide-react';
import VisitService, { getVisitTypeLabel, VISIT_TYPES } from '../../../../services/VisitService';

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
 * 
 * Usage:
 * After patient status change, prompt user:
 * "Status changed successfully. Would you like to create a [visit type] visit?"
 * If yes, show this modal
 * 
 * @param {boolean} isOpen - Modal visibility
 * @param {function} onClose - Close handler
 * @param {number} patientId - Patient database ID
 * @param {string} patientName - Patient full name for display
 * @param {number} studyId - Study ID
 * @param {number} siteId - Site ID
 * @param {string} visitType - Pre-selected visit type (SCREENING, ENROLLMENT, etc.)
 * @param {function} onVisitCreated - Callback after successful visit creation (receives visit response)
 */
const UnscheduledVisitModal = ({
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
    const [formData, setFormData] = useState({
        visitType: visitType,
        visitDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD
        notes: '',
        createdBy: '' // TODO: Get from auth context
    });

    // UI state
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [createdVisit, setCreatedVisit] = useState(null);

    /**
     * Initialize form when modal opens
     */
    useEffect(() => {
        if (isOpen) {
            setFormData({
                visitType: visitType,
                visitDate: new Date().toISOString().split('T')[0],
                notes: '',
                createdBy: 'system' // TODO: Replace with authenticated user
            });
            setShowSuccess(false);
            setShowError(false);
            setErrors({});
        }
    }, [isOpen, visitType]);

    /**
     * Handle input changes
     */
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear field error when user types
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    /**
     * Validate form data
     */
    const validateForm = () => {
        const newErrors = {};

        if (!formData.visitType) {
            newErrors.visitType = 'Visit type is required';
        }

        if (!formData.visitDate) {
            newErrors.visitDate = 'Visit date is required';
        } else {
            // Check if date is in future (more than 7 days ahead)
            const selectedDate = new Date(formData.visitDate);
            const today = new Date();
            const sevenDaysFromNow = new Date();
            sevenDaysFromNow.setDate(today.getDate() + 7);

            if (selectedDate > sevenDaysFromNow) {
                newErrors.visitDate = 'Visit date cannot be more than 7 days in the future';
            }
        }

        if (!formData.createdBy || formData.createdBy.trim().length === 0) {
            newErrors.createdBy = 'User identifier is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Handle form submission
     * Creates unscheduled visit via API
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);
        setShowError(false);
        setErrorMessage('');

        try {
            // Prepare visit data
            const visitData = {
                patientId: patientId,
                studyId: studyId,
                siteId: siteId,
                visitType: formData.visitType,
                visitDate: formData.visitDate,
                createdBy: formData.createdBy.trim(),
                notes: formData.notes.trim() || null
            };

            console.log('[VISIT MODAL] Creating visit:', visitData);

            // Call API to create visit
            const result = await VisitService.createUnscheduledVisit(visitData);

            console.log('[VISIT MODAL] Visit created successfully:', result);

            setCreatedVisit(result);
            setShowSuccess(true);

            // Notify parent component
            if (onVisitCreated) {
                onVisitCreated(result);
            }

            // Auto-close after 2 seconds
            setTimeout(() => {
                handleClose();
            }, 2000);

        } catch (error) {
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
            setFormData({
                visitType: visitType,
                visitDate: new Date().toISOString().split('T')[0],
                notes: '',
                createdBy: 'system'
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
                            disabled={submitting || showSuccess}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.visitType ? 'border-red-500' : 'border-gray-300'
                                } ${submitting || showSuccess ? 'bg-gray-100' : ''}`}
                        >
                            <option value={VISIT_TYPES.SCREENING}>{getVisitTypeLabel(VISIT_TYPES.SCREENING)}</option>
                            <option value={VISIT_TYPES.ENROLLMENT}>{getVisitTypeLabel(VISIT_TYPES.ENROLLMENT)}</option>
                            <option value={VISIT_TYPES.DISCONTINUATION}>{getVisitTypeLabel(VISIT_TYPES.DISCONTINUATION)}</option>
                            <option value={VISIT_TYPES.ADVERSE_EVENT}>{getVisitTypeLabel(VISIT_TYPES.ADVERSE_EVENT)}</option>
                        </select>
                        {errors.visitType && (
                            <p className="mt-1 text-sm text-red-600">{errors.visitType}</p>
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
