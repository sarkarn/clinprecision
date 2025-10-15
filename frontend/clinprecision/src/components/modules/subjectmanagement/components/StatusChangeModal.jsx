// src/components/modules/subjectmanagement/components/StatusChangeModal.jsx
import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import PatientStatusService from '../../../../services/PatientStatusService';

/**
 * Modal for changing patient status
 * 
 * Features:
 * - Fetches valid transitions from API
 * - Dynamic dropdown with only allowed statuses
 * - Required reason field (min 10 characters)
 * - Optional notes field
 * - Client-side validation
 * - Success/error feedback
 * - Auto-closes on success
 * 
 * @param {boolean} isOpen - Modal visibility
 * @param {function} onClose - Close handler
 * @param {number} patientId - Patient database ID
 * @param {string} patientName - Patient full name for display
 * @param {string} currentStatus - Current patient status
 * @param {function} onStatusChanged - Callback after successful status change
 */
const StatusChangeModal = ({
    isOpen,
    onClose,
    patientId,
    patientName,
    currentStatus,
    preselectedStatus,
    onStatusChanged
}) => {
    // Form state
    const [formData, setFormData] = useState({
        newStatus: preselectedStatus || '',
        reason: '',
        notes: '',
        changedBy: '' // TODO: Get from auth context
    });

    // UI state
    const [validTransitions, setValidTransitions] = useState([]);
    const [loadingTransitions, setLoadingTransitions] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    /**
     * Load valid status transitions when modal opens
     */
    useEffect(() => {
        if (isOpen && patientId) {
            loadValidTransitions();
            // Get current user from localStorage or default to 'admin'
            // TODO: Replace with proper authentication context
            const currentUser = localStorage.getItem('currentUser') ||
                localStorage.getItem('username') ||
                'admin';

            setFormData(prev => ({
                ...prev,
                changedBy: currentUser,
                newStatus: preselectedStatus || prev.newStatus
            }));
        }
    }, [isOpen, patientId, preselectedStatus]);

    /**
     * Fetch valid transitions from API
     */
    const loadValidTransitions = async () => {
        setLoadingTransitions(true);
        try {
            const transitions = await PatientStatusService.getValidStatusTransitions(patientId);
            setValidTransitions(transitions);

            // Auto-select first transition if only one option
            if (transitions.length === 1) {
                setFormData(prev => ({ ...prev, newStatus: transitions[0] }));
            }
        } catch (error) {
            console.error('Error loading valid transitions:', error);
            setErrorMessage('Failed to load available status options');
            setShowError(true);
        } finally {
            setLoadingTransitions(false);
        }
    };

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

        if (!formData.newStatus) {
            newErrors.newStatus = 'Please select a new status';
        }

        if (!formData.reason || formData.reason.trim().length === 0) {
            newErrors.reason = 'Reason is required';
        } else if (formData.reason.trim().length < 10) {
            newErrors.reason = 'Reason must be at least 10 characters';
        }

        if (!formData.changedBy || formData.changedBy.trim().length === 0) {
            newErrors.changedBy = 'User identifier is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Handle form submission
     * Simple status change - no form data collection
     * Forms will be collected via unscheduled visits
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
            // Prepare status change data
            const statusChangeData = {
                newStatus: formData.newStatus,
                reason: formData.reason.trim(),
                changedBy: formData.changedBy.trim(),
                notes: formData.notes.trim() || null
            };

            // Call API to change status
            const result = await PatientStatusService.changePatientStatus(patientId, statusChangeData);

            console.log('Status changed successfully:', result);

            // Show success message
            setShowSuccess(true);

            // Call success callback
            if (onStatusChanged) {
                onStatusChanged(result);
            }

            // Close modal after 2 seconds
            setTimeout(() => {
                handleClose();
            }, 2000);

        } catch (error) {
            console.error('Error changing status:', error);
            setErrorMessage(error.message || 'Failed to change patient status. Please try again.');
            setShowError(true);
        } finally {
            setSubmitting(false);
        }
    };

    /**
     * Reset form and close modal
     */
    const handleClose = () => {
        setFormData({
            newStatus: '',
            reason: '',
            notes: '',
            changedBy: ''
        });
        setErrors({});
        setShowSuccess(false);
        setShowError(false);
        setErrorMessage('');
        onClose();
    };

    /**
     * Get status badge color class
     */
    const getStatusColorClass = (status) => {
        const colorMap = {
            'REGISTERED': 'bg-blue-100 text-blue-800',
            'SCREENING': 'bg-yellow-100 text-yellow-800',
            'ENROLLED': 'bg-green-100 text-green-800',
            'ACTIVE': 'bg-violet-100 text-violet-800',
            'COMPLETED': 'bg-gray-100 text-gray-800',
            'WITHDRAWN': 'bg-red-100 text-red-800'
        };
        return colorMap[status] || 'bg-gray-100 text-gray-800';
    };

    /**
     * Format status for display
     */
    const formatStatus = (status) => {
        if (!status) return '';
        return status.charAt(0) + status.slice(1).toLowerCase();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 max-w-2xl shadow-lg rounded-md bg-white">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                        <RefreshCw className="w-6 h-6 text-blue-600 mr-2" />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Change Patient Status</h3>
                            <p className="text-sm text-gray-600">
                                Update status for {patientName}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600"
                        disabled={submitting}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Current Status */}
                <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Current Status</p>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColorClass(currentStatus)}`}>
                                {formatStatus(currentStatus)}
                            </span>
                        </div>
                        {loadingTransitions && (
                            <div className="flex items-center text-sm text-gray-500">
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Loading options...
                            </div>
                        )}
                    </div>
                </div>

                {/* Success Alert */}
                {showSuccess && (
                    <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
                        <div className="flex">
                            <CheckCircle2 className="h-5 w-5 text-green-400" />
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800">
                                    Status Changed Successfully!
                                </h3>
                                <p className="mt-2 text-sm text-green-700">
                                    Patient status has been updated. Closing modal...
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Alert */}
                {showError && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Status Change Failed
                                </h3>
                                <p className="mt-2 text-sm text-red-700">
                                    {errorMessage}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowError(false)}
                                className="ml-auto text-red-400 hover:text-red-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Status Change Form */}
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* New Status Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Status *
                        </label>
                        <select
                            value={formData.newStatus}
                            onChange={(e) => handleInputChange('newStatus', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.newStatus ? 'border-red-300' : 'border-gray-300'
                                }`}
                            disabled={submitting || loadingTransitions || validTransitions.length === 0}
                        >
                            <option value="">
                                {loadingTransitions ? 'Loading...' :
                                    validTransitions.length === 0 ? 'No valid transitions available' :
                                        'Select new status'}
                            </option>
                            {validTransitions.map((status) => (
                                <option key={status} value={status}>
                                    {formatStatus(status)}
                                </option>
                            ))}
                        </select>
                        {errors.newStatus && (
                            <p className="mt-1 text-sm text-red-600">{errors.newStatus}</p>
                        )}
                        {validTransitions.length === 0 && !loadingTransitions && (
                            <p className="mt-1 text-sm text-gray-500">
                                No valid status transitions available from {formatStatus(currentStatus)}
                            </p>
                        )}
                    </div>

                    {/* Reason Textarea */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reason for Status Change *
                        </label>
                        <textarea
                            value={formData.reason}
                            onChange={(e) => handleInputChange('reason', e.target.value)}
                            placeholder="Enter the reason for this status change (min 10 characters)"
                            rows={3}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.reason ? 'border-red-300' : 'border-gray-300'
                                }`}
                            disabled={submitting}
                        />
                        {errors.reason && (
                            <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
                        )}
                        <p className="mt-1 text-sm text-gray-500">
                            {formData.reason.trim().length}/10 characters minimum
                        </p>
                    </div>

                    {/* Notes Textarea (Optional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Additional Notes (Optional)
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            placeholder="Enter any additional context or notes"
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={submitting}
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            Provide extra details if needed
                        </p>
                    </div>

                    {/* Changed By (Hidden for now - TODO: get from auth) */}
                    <input type="hidden" value={formData.changedBy} />

                    {/* Info Message */}
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <p className="text-sm text-blue-700">
                            <strong>Important:</strong> This status change will be recorded in the patient's audit trail with timestamp and user information. Make sure to provide a clear reason for compliance purposes.
                        </p>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={submitting || validTransitions.length === 0 || loadingTransitions}
                        >
                            {submitting ? (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin inline" />
                                    Changing Status...
                                </>
                            ) : (
                                'Change Status'
                            )}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default StatusChangeModal;
