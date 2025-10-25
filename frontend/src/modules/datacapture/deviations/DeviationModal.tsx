// DeviationModal.tsx - Protocol Deviation Recording
import React, { useState, useEffect } from 'react';
import ProtocolDeviationService from '../../../services/quality/ProtocolDeviationService';

// Type definitions
interface DeviationContext {
    patientId?: number;
    studySiteId?: number;
    visitId?: number;
    patientName?: string;
    studyName?: string;
    visitName?: string;
    reportedBy?: string;
}

interface DeviationFormData {
    deviationType: string;
    severity: string;
    title: string;
    description: string;
    protocolSection: string;
    expectedProcedure: string;
    actualProcedure: string;
    rootCause: string;
    immediateAction: string;
    correctiveAction: string;
    requiresReporting: boolean;
}

interface FormErrors {
    [key: string]: string | null;
}

interface DeviationModalProps {
    isOpen: boolean;
    onClose: () => void;
    context?: DeviationContext;
    onDeviationCreated?: (deviation: any) => void;
}

/**
 * Modal for recording protocol deviations
 * 
 * Features:
 * - Create new deviations with comprehensive details
 * - Auto-populate patient/visit/study context
 * - Dropdown for deviation types (9 options)
 * - Severity selection (MINOR/MAJOR/CRITICAL)
 * - Rich text fields for root cause analysis
 * - Validation before submission
 */
const DeviationModal: React.FC<DeviationModalProps> = ({
    isOpen,
    onClose,
    context = {},
    onDeviationCreated
}) => {
    const [formData, setFormData] = useState<DeviationFormData>({
        deviationType: '',
        severity: '',
        title: '',
        description: '',
        protocolSection: '',
        expectedProcedure: '',
        actualProcedure: '',
        rootCause: '',
        immediateAction: '',
        correctiveAction: '',
        requiresReporting: false
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                deviationType: '',
                severity: '',
                title: '',
                description: '',
                protocolSection: '',
                expectedProcedure: '',
                actualProcedure: '',
                rootCause: '',
                immediateAction: '',
                correctiveAction: '',
                requiresReporting: false
            });
            setErrors({});
            setSubmitError(null);
        }
    }, [isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.deviationType) {
            newErrors.deviationType = 'Deviation type is required';
        }
        if (!formData.severity) {
            newErrors.severity = 'Severity is required';
        }
        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);
        setSubmitError(null);

        try {
            const deviationData = {
                patientId: context.patientId,
                studySiteId: context.studySiteId,
                visitId: context.visitId || null,
                deviationType: formData.deviationType,
                severity: formData.severity,
                title: formData.title.trim(),
                description: formData.description.trim(),
                protocolSection: formData.protocolSection.trim() || null,
                expectedProcedure: formData.expectedProcedure.trim() || null,
                actualProcedure: formData.actualProcedure.trim() || null,
                rootCause: formData.rootCause.trim() || null,
                immediateAction: formData.immediateAction.trim() || null,
                correctiveAction: formData.correctiveAction.trim() || null,
                requiresReporting: formData.requiresReporting,
                reportedBy: context.reportedBy || 'System'
            };

            console.log('[DEVIATION_MODAL] Submitting deviation:', deviationData);

            const result = await ProtocolDeviationService.createDeviation(deviationData as any);

            console.log('[DEVIATION_MODAL] Deviation created successfully:', result);

            // Notify parent component
            if (onDeviationCreated) {
                onDeviationCreated(result);
            }

            // Close modal
            onClose();
        } catch (error: any) {
            console.error('[DEVIATION_MODAL] Error creating deviation:', error);
            setSubmitError(error.message || 'Failed to create deviation. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const deviationTypes = ProtocolDeviationService.getDeviationTypes();
    const severityLevels = ProtocolDeviationService.getSeverityLevels();

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    aria-hidden="true"
                    onClick={onClose}
                ></div>

                {/* Center modal */}
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                {/* Modal panel */}
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-white" id="modal-title">
                                    Report Protocol Deviation
                                </h3>
                                <p className="text-sm text-red-100 mt-1">
                                    {context.patientName && `Patient: ${context.patientName}`}
                                    {context.studyName && ` • Study: ${context.studyName}`}
                                    {context.visitName && ` • Visit: ${context.visitName}`}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-white hover:text-gray-200 focus:outline-none"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Body */}
                        <div className="bg-white px-6 py-4 max-h-[70vh] overflow-y-auto">
                            {submitError && (
                                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">{submitError}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-5">
                                {/* Deviation Type & Severity Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Deviation Type <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="deviationType"
                                            value={formData.deviationType}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${errors.deviationType ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                }`}
                                        >
                                            <option value="">Select type...</option>
                                            {deviationTypes.map((type: any) => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.deviationType && (
                                            <p className="mt-1 text-sm text-red-600">{errors.deviationType}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Severity <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="severity"
                                            value={formData.severity}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${errors.severity ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                }`}
                                        >
                                            <option value="">Select severity...</option>
                                            {severityLevels.map((level: any) => (
                                                <option key={level.value} value={level.value}>
                                                    {level.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.severity && (
                                            <p className="mt-1 text-sm text-red-600">{errors.severity}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="Brief summary of the deviation"
                                        maxLength={200}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.title && (
                                        <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Detailed description of what occurred"
                                        rows={4}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                    )}
                                </div>

                                {/* Protocol Section */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Protocol Section Reference
                                    </label>
                                    <input
                                        type="text"
                                        name="protocolSection"
                                        value={formData.protocolSection}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Section 5.2 - Visit Window"
                                        maxLength={100}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                </div>

                                {/* Expected vs Actual Procedures */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Expected Procedure
                                        </label>
                                        <textarea
                                            name="expectedProcedure"
                                            value={formData.expectedProcedure}
                                            onChange={handleInputChange}
                                            placeholder="What should have happened per protocol"
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Actual Procedure
                                        </label>
                                        <textarea
                                            name="actualProcedure"
                                            value={formData.actualProcedure}
                                            onChange={handleInputChange}
                                            placeholder="What actually occurred"
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                        />
                                    </div>
                                </div>

                                {/* Root Cause Analysis */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Root Cause Analysis
                                    </label>
                                    <textarea
                                        name="rootCause"
                                        value={formData.rootCause}
                                        onChange={handleInputChange}
                                        placeholder="Why did this deviation occur?"
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                </div>

                                {/* Corrective Actions */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Immediate Action Taken
                                        </label>
                                        <textarea
                                            name="immediateAction"
                                            value={formData.immediateAction}
                                            onChange={handleInputChange}
                                            placeholder="What was done immediately to address the deviation?"
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Corrective Action Plan
                                        </label>
                                        <textarea
                                            name="correctiveAction"
                                            value={formData.correctiveAction}
                                            onChange={handleInputChange}
                                            placeholder="What will be done to prevent recurrence?"
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                        />
                                    </div>
                                </div>

                                {/* Requires Reporting Checkbox */}
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            type="checkbox"
                                            name="requiresReporting"
                                            checked={formData.requiresReporting}
                                            onChange={handleInputChange}
                                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="requiresReporting" className="font-medium text-gray-700">
                                            Requires Sponsor/IRB Reporting
                                        </label>
                                        <p className="text-gray-500">Check if this deviation requires reporting to sponsor or IRB</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={submitting}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Recording...
                                    </span>
                                ) : (
                                    'Record Deviation'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DeviationModal;
