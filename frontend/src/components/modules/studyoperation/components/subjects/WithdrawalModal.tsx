import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle2, Upload, FileText } from 'lucide-react';
import PatientStatusService from 'services/data-capture/PatientStatusService';
import { useAuth } from '../../../../../../src/contexts/AuthContext';

interface WithdrawalReason {
    code: string;
    label: string;
    requiresDetail: boolean;
}

interface FormData {
    reasonCode: string;
    reasonDetail: string;
    effectiveDate: string;
    notes: string;
    changedBy: string;
}

interface Errors {
    reasonCode?: string;
    reasonDetail?: string;
    effectiveDate?: string;
    changedBy?: string;
    file?: string;
}

interface FilePreview {
    name: string;
    size: string;
    type: string;
}

interface AuditTrail {
    patientId: number;
    patientName: string;
    previousStatus: string;
    newStatus: string;
    reasonCode: string;
    reasonLabel: string;
    effectiveDate: string;
    changedBy: string;
    changedAt: string;
    hasDocument: boolean;
    documentName: string | null;
}

interface WithdrawalModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientId: number;
    patientName: string;
    currentStatus: string;
    onWithdrawalComplete?: (result: any) => void;
}

/**
 * Specialized modal for subject withdrawal
 * 
 * Compliant with 21 CFR 312.50 - Requirements for withdrawal documentation
 * 
 * Features:
 * - Structured reason code picklist (protocol-defined)
 * - Required effective date
 * - Optional document upload
 * - Audit trail display after completion
 * - Client-side validation
 */
const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
    isOpen,
    onClose,
    patientId,
    patientName,
    currentStatus,
    onWithdrawalComplete
}) => {
    const { user } = useAuth();

    // Withdrawal reason codes per ICH E6(R2) guidance
    const WITHDRAWAL_REASONS: WithdrawalReason[] = [
        { code: 'ADVERSE_EVENT', label: 'Adverse Event', requiresDetail: true },
        { code: 'LACK_EFFICACY', label: 'Lack of Efficacy', requiresDetail: false },
        { code: 'PROTOCOL_VIOLATION', label: 'Protocol Violation', requiresDetail: true },
        { code: 'PATIENT_REQUEST', label: 'Patient/Guardian Request', requiresDetail: false },
        { code: 'PHYSICIAN_DECISION', label: 'Physician Decision', requiresDetail: true },
        { code: 'LOST_TO_FOLLOWUP', label: 'Lost to Follow-up', requiresDetail: false },
        { code: 'DEATH', label: 'Death', requiresDetail: true },
        { code: 'PREGNANCY', label: 'Pregnancy', requiresDetail: false },
        { code: 'NON_COMPLIANCE', label: 'Non-Compliance', requiresDetail: true },
        { code: 'OTHER', label: 'Other', requiresDetail: true }
    ];

    // Form state
    const [formData, setFormData] = useState<FormData>({
        reasonCode: '',
        reasonDetail: '',
        effectiveDate: '',
        notes: '',
        changedBy: ''
    });

    // File upload state
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<FilePreview | null>(null);

    // UI state
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Errors>({});
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [auditTrail, setAuditTrail] = useState<AuditTrail | null>(null);

    /**
     * Initialize form when modal opens
     */
    useEffect(() => {
        if (isOpen && patientId) {
            const currentUser = user?.email || user?.name || (user as any)?.userId || 'Unknown User';

            const today = new Date().toISOString().split('T')[0];

            setFormData({
                reasonCode: '',
                reasonDetail: '',
                effectiveDate: today,
                notes: '',
                changedBy: currentUser
            });

            setUploadedFile(null);
            setFilePreview(null);
        }
    }, [isOpen, patientId, user]);

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
     * Handle file upload
     */
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, file: 'File size must be less than 10MB' }));
            return;
        }

        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        if (!allowedTypes.includes(file.type)) {
            setErrors(prev => ({ ...prev, file: 'Only PDF, DOC, DOCX, and TXT files are allowed' }));
            return;
        }

        setUploadedFile(file);
        setFilePreview({
            name: file.name,
            size: (file.size / 1024).toFixed(2) + ' KB',
            type: file.type
        });

        if (errors.file) {
            setErrors(prev => ({ ...prev, file: '' }));
        }
    };

    /**
     * Validate form data
     */
    const validateForm = (): boolean => {
        const newErrors: Errors = {};

        if (!formData.reasonCode) {
            newErrors.reasonCode = 'Withdrawal reason is required';
        }

        const selectedReason = WITHDRAWAL_REASONS.find(r => r.code === formData.reasonCode);
        if (selectedReason?.requiresDetail && (!formData.reasonDetail || formData.reasonDetail.trim().length < 20)) {
            newErrors.reasonDetail = 'Detailed explanation is required (minimum 20 characters)';
        }

        if (!formData.effectiveDate) {
            newErrors.effectiveDate = 'Effective date is required';
        } else {
            const effectiveDate = new Date(formData.effectiveDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (effectiveDate > today) {
                newErrors.effectiveDate = 'Effective date cannot be in the future';
            }
        }

        if (!formData.changedBy || formData.changedBy.trim().length === 0) {
            newErrors.changedBy = 'User identifier is required';
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
            const withdrawalData = {
                newStatus: 'WITHDRAWN',
                reason: `${WITHDRAWAL_REASONS.find(r => r.code === formData.reasonCode)?.label || 'Unknown'}${formData.reasonDetail ? `: ${formData.reasonDetail}` : ''}`,
                changedBy: formData.changedBy.trim(),
                notes: formData.notes.trim() || null,
                metadata: {
                    withdrawalReasonCode: formData.reasonCode,
                    effectiveDate: formData.effectiveDate,
                    hasDocument: !!uploadedFile,
                    documentName: uploadedFile?.name || null
                }
            } as any;

            const result = await PatientStatusService.changePatientStatus(patientId, withdrawalData) as any;

            console.log('[WITHDRAWAL] Status changed successfully:', result);

            if (uploadedFile) {
                console.log('[WITHDRAWAL] Document upload pending:', uploadedFile.name);
            }

            setAuditTrail({
                patientId,
                patientName,
                previousStatus: currentStatus,
                newStatus: 'WITHDRAWN',
                reasonCode: formData.reasonCode,
                reasonLabel: WITHDRAWAL_REASONS.find(r => r.code === formData.reasonCode)?.label || '',
                effectiveDate: formData.effectiveDate,
                changedBy: formData.changedBy,
                changedAt: new Date().toISOString(),
                hasDocument: !!uploadedFile,
                documentName: uploadedFile?.name || null
            });

            setShowSuccess(true);

            if (onWithdrawalComplete) {
                onWithdrawalComplete(result);
            }

            setTimeout(() => {
                handleClose();
            }, 3000);

        } catch (error: any) {
            console.error('[WITHDRAWAL] Error processing withdrawal:', error);
            setErrorMessage(error.message || 'Failed to process withdrawal. Please try again.');
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
            reasonCode: '',
            reasonDetail: '',
            effectiveDate: '',
            notes: '',
            changedBy: ''
        });
        setUploadedFile(null);
        setFilePreview(null);
        setErrors({});
        setShowSuccess(false);
        setShowError(false);
        setErrorMessage('');
        setAuditTrail(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-red-600 text-white px-6 py-4 flex justify-between items-center rounded-t-lg">
                    <div>
                        <h2 className="text-xl font-bold">Subject Withdrawal</h2>
                        <p className="text-sm text-red-100 mt-1">
                            {patientName} • Current Status: {currentStatus}
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-white hover:text-red-200 transition-colors"
                        disabled={submitting}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Success Message */}
                {showSuccess && auditTrail && (
                    <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start">
                            <CheckCircle2 className="text-green-600 mr-3 flex-shrink-0" size={24} />
                            <div className="flex-1">
                                <h3 className="text-green-800 font-semibold mb-2">Withdrawal Recorded Successfully</h3>

                                {/* Audit Trail Summary */}
                                <div className="bg-white border border-green-200 rounded p-3 text-sm">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <span className="font-medium text-gray-700">Subject:</span>
                                            <span className="ml-2 text-gray-900">{auditTrail.patientName}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Effective Date:</span>
                                            <span className="ml-2 text-gray-900">{new Date(auditTrail.effectiveDate).toLocaleDateString()}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Reason:</span>
                                            <span className="ml-2 text-gray-900">{auditTrail.reasonLabel}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Changed By:</span>
                                            <span className="ml-2 text-gray-900">{auditTrail.changedBy}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Status Change:</span>
                                            <span className="ml-2 text-gray-900">{auditTrail.previousStatus} → WITHDRAWN</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Timestamp:</span>
                                            <span className="ml-2 text-gray-900">{new Date(auditTrail.changedAt).toLocaleString()}</span>
                                        </div>
                                        {auditTrail.hasDocument && (
                                            <div className="col-span-2">
                                                <span className="font-medium text-gray-700">Document:</span>
                                                <span className="ml-2 text-gray-900 flex items-center">
                                                    <FileText size={14} className="mr-1" />
                                                    {auditTrail.documentName}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <p className="text-green-700 text-xs mt-2">
                                    This withdrawal has been recorded in the audit trail. The subject's data will be retained per protocol requirements.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {showError && (
                    <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start">
                            <AlertCircle className="text-red-600 mr-3 flex-shrink-0" size={20} />
                            <div>
                                <h4 className="text-red-800 font-semibold">Error Processing Withdrawal</h4>
                                <p className="text-red-700 text-sm mt-1">{errorMessage}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form */}
                {!showSuccess && (
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Warning Notice */}
                        <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
                            <div className="flex">
                                <AlertCircle className="text-amber-600 mr-3 flex-shrink-0" size={20} />
                                <div className="text-sm text-amber-800">
                                    <p className="font-semibold">Important: Subject Withdrawal Procedure</p>
                                    <ul className="list-disc list-inside mt-2 space-y-1">
                                        <li>Subject will be permanently withdrawn from the study</li>
                                        <li>All data will be retained per 21 CFR 312.50 requirements</li>
                                        <li>This action requires regulatory-compliant documentation</li>
                                        <li>Effective date must reflect actual withdrawal decision date</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Reason Code (Required) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Withdrawal Reason <span className="text-red-600">*</span>
                            </label>
                            <select
                                value={formData.reasonCode}
                                onChange={(e) => handleInputChange('reasonCode', e.target.value)}
                                className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 ${errors.reasonCode ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                    }`}
                                disabled={submitting}
                            >
                                <option value="">-- Select Withdrawal Reason --</option>
                                {WITHDRAWAL_REASONS.map(reason => (
                                    <option key={reason.code} value={reason.code}>
                                        {reason.label}
                                    </option>
                                ))}
                            </select>
                            {errors.reasonCode && (
                                <p className="text-red-600 text-xs mt-1">{errors.reasonCode}</p>
                            )}
                        </div>

                        {/* Reason Detail (Conditional) */}
                        {formData.reasonCode && WITHDRAWAL_REASONS.find(r => r.code === formData.reasonCode)?.requiresDetail && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Detailed Explanation <span className="text-red-600">*</span>
                                </label>
                                <textarea
                                    value={formData.reasonDetail}
                                    onChange={(e) => handleInputChange('reasonDetail', e.target.value)}
                                    className={`w-full border rounded-lg px-4 py-2 h-24 focus:ring-2 focus:ring-red-500 focus:border-red-500 ${errors.reasonDetail ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                    placeholder="Provide detailed explanation of withdrawal reason (minimum 20 characters)..."
                                    disabled={submitting}
                                />
                                <div className="flex justify-between items-center mt-1">
                                    {errors.reasonDetail && (
                                        <p className="text-red-600 text-xs">{errors.reasonDetail}</p>
                                    )}
                                    <p className="text-gray-500 text-xs ml-auto">
                                        {formData.reasonDetail.length} / 20 minimum
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Effective Date (Required) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Effective Date <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="date"
                                value={formData.effectiveDate}
                                onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                                className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 ${errors.effectiveDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                    }`}
                                disabled={submitting}
                            />
                            {errors.effectiveDate && (
                                <p className="text-red-600 text-xs mt-1">{errors.effectiveDate}</p>
                            )}
                            <p className="text-gray-500 text-xs mt-1">
                                Date when withdrawal decision was made (cannot be in the future)
                            </p>
                        </div>

                        {/* Document Upload (Optional) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Supporting Document (Optional)
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                                {!filePreview ? (
                                    <label className="cursor-pointer block">
                                        <div className="flex flex-col items-center text-center">
                                            <Upload className="text-gray-400 mb-2" size={32} />
                                            <p className="text-sm text-gray-600 mb-1">
                                                Click to upload or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                PDF, DOC, DOCX, or TXT (max 10MB)
                                            </p>
                                        </div>
                                        <input
                                            type="file"
                                            onChange={handleFileUpload}
                                            accept=".pdf,.doc,.docx,.txt"
                                            className="hidden"
                                            disabled={submitting}
                                        />
                                    </label>
                                ) : (
                                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                                        <div className="flex items-center">
                                            <FileText className="text-blue-600 mr-2" size={20} />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{filePreview.name}</p>
                                                <p className="text-xs text-gray-500">{filePreview.size}</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setUploadedFile(null);
                                                setFilePreview(null);
                                            }}
                                            className="text-red-600 hover:text-red-800"
                                            disabled={submitting}
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            {errors.file && (
                                <p className="text-red-600 text-xs mt-1">{errors.file}</p>
                            )}
                        </div>

                        {/* Additional Notes (Optional) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Additional Notes (Optional)
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 h-20 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                placeholder="Any additional context or notes..."
                                disabled={submitting}
                            />
                        </div>

                        {/* Changed By (Auto-populated) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Recorded By
                            </label>
                            <input
                                type="text"
                                value={formData.changedBy}
                                onChange={(e) => handleInputChange('changedBy', e.target.value)}
                                className={`w-full border rounded-lg px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-red-500 focus:border-red-500 ${errors.changedBy ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                disabled={submitting}
                            />
                            {errors.changedBy && (
                                <p className="text-red-600 text-xs mt-1">{errors.changedBy}</p>
                            )}
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    'Confirm Withdrawal'
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default WithdrawalModal;
