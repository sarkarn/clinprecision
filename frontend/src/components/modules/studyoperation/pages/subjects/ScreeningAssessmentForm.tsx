// ScreeningAssessmentForm.tsx - Quick screening assessment for status change
import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface Assessment {
    meetsAgeRequirement: string | null;
    hasRequiredDiagnosis: string | null;
    noExclusionCriteria: string | null;
    informedConsentObtained: string | null;
    screenId: string;
    screeningDate: string;
    assessedBy: string;
    notes: string;
}

interface AssessmentResult extends Assessment {
    isEligible: boolean;
    eligibilityStatus: string;
}

interface ScreeningAssessmentFormProps {
    onComplete: (data: AssessmentResult) => void;
    onCancel: () => void;
    patientId: string | number;
    patientName?: string;
}

interface Errors {
    [key: string]: string;
}

/**
 * Screening Assessment Form
 * Shown when changing patient status to SCREENING
 * Captures basic eligibility criteria
 */
const ScreeningAssessmentForm: React.FC<ScreeningAssessmentFormProps> = ({
    onComplete,
    onCancel,
    patientId,
    patientName
}) => {
    const [assessment, setAssessment] = useState<Assessment>({
        // Basic eligibility checks
        meetsAgeRequirement: null,
        hasRequiredDiagnosis: null,
        noExclusionCriteria: null,
        informedConsentObtained: null,

        // Additional info
        screenId: '', // Screening ID/Number
        screeningDate: new Date().toISOString().split('T')[0],
        assessedBy: '', // TODO: Get from auth
        notes: ''
    });

    const [errors, setErrors] = useState<Errors>({});

    const handleChange = (field: keyof Assessment, value: string | null) => {
        setAssessment(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Errors = {};

        // All eligibility questions must be answered
        if (assessment.meetsAgeRequirement === null) {
            newErrors.meetsAgeRequirement = 'Required';
        }
        if (assessment.hasRequiredDiagnosis === null) {
            newErrors.hasRequiredDiagnosis = 'Required';
        }
        if (assessment.noExclusionCriteria === null) {
            newErrors.noExclusionCriteria = 'Required';
        }
        if (assessment.informedConsentObtained === null) {
            newErrors.informedConsentObtained = 'Required';
        }

        if (!assessment.screenId.trim()) {
            newErrors.screenId = 'Screen ID is required';
        }

        if (!assessment.assessedBy.trim()) {
            newErrors.assessedBy = 'Assessor name is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) {
            return;
        }

        // Check if all criteria are met
        const isEligible =
            assessment.meetsAgeRequirement === 'yes' &&
            assessment.hasRequiredDiagnosis === 'yes' &&
            assessment.noExclusionCriteria === 'yes' &&
            assessment.informedConsentObtained === 'yes';

        onComplete({
            ...assessment,
            isEligible,
            eligibilityStatus: isEligible ? 'ELIGIBLE' : 'NOT_ELIGIBLE'
        });
    };

    const renderYesNoField = (field: keyof Assessment, label: string, error?: string) => (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label} <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-4">
                <label className="flex items-center">
                    <input
                        type="radio"
                        name={field}
                        value="yes"
                        checked={assessment[field] === 'yes'}
                        onChange={(e) => handleChange(field, e.target.value)}
                        className="mr-2"
                    />
                    <CheckCircle2 className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-sm">Yes</span>
                </label>
                <label className="flex items-center">
                    <input
                        type="radio"
                        name={field}
                        value="no"
                        checked={assessment[field] === 'no'}
                        onChange={(e) => handleChange(field, e.target.value)}
                        className="mr-2"
                    />
                    <XCircle className="w-4 h-4 text-red-600 mr-1" />
                    <span className="text-sm">No</span>
                </label>
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );

    // Calculate eligibility status for preview
    const getEligibilityPreview = (): boolean | null => {
        if (assessment.meetsAgeRequirement === null ||
            assessment.hasRequiredDiagnosis === null ||
            assessment.noExclusionCriteria === null ||
            assessment.informedConsentObtained === null) {
            return null;
        }

        const isEligible =
            assessment.meetsAgeRequirement === 'yes' &&
            assessment.hasRequiredDiagnosis === 'yes' &&
            assessment.noExclusionCriteria === 'yes' &&
            assessment.informedConsentObtained === 'yes';

        return isEligible;
    };

    const eligibilityPreview = getEligibilityPreview();

    return (
        <div className="bg-white">
            {/* Header */}
            <div className="bg-blue-50 border-b border-blue-200 p-4 mb-4">
                <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Screening Assessment
                        </h3>
                        <p className="text-sm text-gray-600">
                            Patient: {patientName || `ID: ${patientId}`}
                        </p>
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Complete this screening assessment before proceeding.
                    All criteria must be met for the patient to be eligible for enrollment.
                </p>
            </div>

            {/* Assessment Form */}
            <div className="space-y-4 mb-6">
                {renderYesNoField(
                    'meetsAgeRequirement',
                    'Does the patient meet the age requirement (≥18 years)?',
                    errors.meetsAgeRequirement
                )}

                {renderYesNoField(
                    'hasRequiredDiagnosis',
                    'Does the patient have the required diagnosis/condition?',
                    errors.hasRequiredDiagnosis
                )}

                {renderYesNoField(
                    'noExclusionCriteria',
                    'Is the patient free of all exclusion criteria?',
                    errors.noExclusionCriteria
                )}

                {renderYesNoField(
                    'informedConsentObtained',
                    'Has informed consent been obtained and documented?',
                    errors.informedConsentObtained
                )}

                {/* Screen ID */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Screen ID <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={assessment.screenId}
                        onChange={(e) => handleChange('screenId', e.target.value)}
                        placeholder="Enter screening ID/number (e.g., SCR-001)"
                        className="border border-gray-300 rounded-md w-full px-3 py-2"
                    />
                    {errors.screenId && (
                        <p className="text-red-500 text-xs mt-1">{errors.screenId}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                        Unique identifier for this screening visit
                    </p>
                </div>

                {/* Screening Date */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Screening Date <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        value={assessment.screeningDate}
                        onChange={(e) => handleChange('screeningDate', e.target.value)}
                        className="border border-gray-300 rounded-md w-full px-3 py-2"
                        max={new Date().toISOString().split('T')[0]}
                    />
                </div>

                {/* Assessed By */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assessed By <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={assessment.assessedBy}
                        onChange={(e) => handleChange('assessedBy', e.target.value)}
                        placeholder="Enter your name"
                        className="border border-gray-300 rounded-md w-full px-3 py-2"
                    />
                    {errors.assessedBy && (
                        <p className="text-red-500 text-xs mt-1">{errors.assessedBy}</p>
                    )}
                </div>

                {/* Notes */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Notes
                    </label>
                    <textarea
                        value={assessment.notes}
                        onChange={(e) => handleChange('notes', e.target.value)}
                        placeholder="Enter any additional observations or notes..."
                        rows={3}
                        className="border border-gray-300 rounded-md w-full px-3 py-2"
                    />
                </div>
            </div>

            {/* Eligibility Preview */}
            {eligibilityPreview !== null && (
                <div className={`rounded-lg p-4 mb-4 ${eligibilityPreview
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                    }`}>
                    <div className="flex items-center">
                        {eligibilityPreview ? (
                            <>
                                <CheckCircle2 className="w-6 h-6 text-green-600 mr-2" />
                                <div>
                                    <h4 className="font-semibold text-green-900">Patient is Eligible</h4>
                                    <p className="text-sm text-green-700">
                                        All screening criteria have been met. Patient can proceed to enrollment.
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <XCircle className="w-6 h-6 text-red-600 mr-2" />
                                <div>
                                    <h4 className="font-semibold text-red-900">Patient is Not Eligible</h4>
                                    <p className="text-sm text-red-700">
                                        One or more screening criteria were not met. Patient cannot be enrolled.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Complete Assessment & Change Status
                </button>
            </div>
        </div>
    );
};

export default ScreeningAssessmentForm;
