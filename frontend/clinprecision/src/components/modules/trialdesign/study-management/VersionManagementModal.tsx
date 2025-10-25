import React, { useState, useEffect } from 'react';
import { useStudyVersioning, StudyVersion } from '../hooks/useStudyVersioning';
import {
    X,
    GitBranch,
    AlertTriangle,
    Clock,
    User,
    Calendar,
    FileText,
    CheckCircle2,
    AlertCircle,
    Info
} from 'lucide-react';

interface Study {
    id: number;
    title: string;
    version: string | number;
}

interface FormData {
    amendmentType: string;
    reason: string;
    description: string;
    effectiveDate: string;
    notifyStakeholders: boolean;
    requiresRegulatory: boolean;
    notes: string;
}

interface FormErrors {
    amendmentType?: string;
    reason?: string;
    description?: string;
    effectiveDate?: string;
    submit?: string;
}

interface VersionManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    study: Study;
    onVersionCreated?: (version: StudyVersion) => void;
}

/**
 * Modal for creating new study versions and managing amendments
 */
const VersionManagementModal: React.FC<VersionManagementModalProps> = ({
    isOpen,
    onClose,
    study,
    onVersionCreated
}) => {
    const [formData, setFormData] = useState<FormData>({
        amendmentType: '',
        reason: '',
        description: '',
        effectiveDate: '',
        notifyStakeholders: true,
        requiresRegulatory: false,
        notes: ''
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [versionHistory, setVersionHistory] = useState<StudyVersion[]>([]);

    const {
        loadStudyVersions,
        createVersion,
        getVersionHistory,
        AMENDMENT_TYPES,
        VERSION_STATUS
    } = useStudyVersioning();

    useEffect(() => {
        if (isOpen && study) {
            loadVersionHistory();
            resetForm();
        }
    }, [isOpen, study]);

    const loadVersionHistory = async (): Promise<void> => {
        try {
            const history = await getVersionHistory(study.id);
            setVersionHistory(history);
        } catch (error) {
            console.error('Error loading version history:', error);
        }
    };

    const resetForm = (): void => {
        setFormData({
            amendmentType: '',
            reason: '',
            description: '',
            effectiveDate: '',
            notifyStakeholders: true,
            requiresRegulatory: false,
            notes: ''
        });
        setErrors({});
    };

    const handleInputChange = (field: keyof FormData, value: string | boolean): void => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.amendmentType) {
            newErrors.amendmentType = 'Amendment type is required';
        }

        if (!formData.reason.trim()) {
            newErrors.reason = 'Reason for amendment is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        if (!formData.effectiveDate) {
            newErrors.effectiveDate = 'Effective date is required';
        } else {
            const selectedDate = new Date(formData.effectiveDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                newErrors.effectiveDate = 'Effective date cannot be in the past';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const newVersion = await createVersion(study.id, {
                amendmentType: formData.amendmentType,
                reason: formData.reason,
                description: formData.description,
                effectiveDate: formData.effectiveDate,
                notifyStakeholders: formData.notifyStakeholders,
                requiresRegulatory: formData.requiresRegulatory,
                notes: formData.notes
            });

            onVersionCreated?.(newVersion);
            onClose();
        } catch (error) {
            console.error('Error creating version:', error);
            setErrors({ submit: 'Failed to create new version. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const getAmendmentTypeIcon = (type: string): React.ReactElement => {
        switch (type) {
            case 'MAJOR': return <AlertTriangle className="w-4 h-4 text-red-500" />;
            case 'MINOR': return <Info className="w-4 h-4 text-blue-500" />;
            case 'SAFETY': return <AlertCircle className="w-4 h-4 text-orange-500" />;
            case 'ADMINISTRATIVE': return <FileText className="w-4 h-4 text-gray-500" />;
            default: return <FileText className="w-4 h-4 text-gray-500" />;
        }
    };

    const getVersionStatusBadge = (status: string): React.ReactElement => {
        const configs: Record<string, { color: string; text: string }> = {
            [VERSION_STATUS.DRAFT.value]: { color: 'bg-gray-100 text-gray-700', text: VERSION_STATUS.DRAFT.label },
            [VERSION_STATUS.PROTOCOL_REVIEW.value]: { color: 'bg-yellow-100 text-yellow-700', text: VERSION_STATUS.PROTOCOL_REVIEW.label },
            [VERSION_STATUS.SUBMITTED.value]: { color: 'bg-blue-100 text-blue-700', text: VERSION_STATUS.SUBMITTED.label },
            [VERSION_STATUS.APPROVED.value]: { color: 'bg-green-100 text-green-700', text: VERSION_STATUS.APPROVED.label },
            [VERSION_STATUS.ACTIVE.value]: { color: 'bg-green-100 text-green-700', text: VERSION_STATUS.ACTIVE.label },
            [VERSION_STATUS.SUPERSEDED.value]: { color: 'bg-orange-100 text-orange-700', text: VERSION_STATUS.SUPERSEDED.label },
            [VERSION_STATUS.WITHDRAWN.value]: { color: 'bg-red-100 text-red-700', text: VERSION_STATUS.WITHDRAWN.label }
        };

        const config = configs[status] || configs[VERSION_STATUS.DRAFT.value];

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.text}
            </span>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                        <GitBranch className="w-6 h-6 text-blue-600 mr-2" />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Create New Version</h3>
                            <p className="text-sm text-gray-600">
                                {study?.title} (Current: v{study?.version})
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex gap-6">
                    {/* Form Section */}
                    <div className="flex-1">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Amendment Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Amendment Type *
                                </label>
                                <select
                                    value={formData.amendmentType}
                                    onChange={(e) => handleInputChange('amendmentType', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.amendmentType ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                >
                                    <option value="">Select Amendment Type</option>
                                    {Object.entries(AMENDMENT_TYPES).map(([key, value]: [string, any]) => (
                                        <option key={key} value={key}>
                                            {value.label} - {value.description}
                                        </option>
                                    ))}
                                </select>
                                {errors.amendmentType && (
                                    <p className="mt-1 text-sm text-red-600">{errors.amendmentType}</p>
                                )}
                            </div>

                            {/* Reason */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Reason for Amendment *
                                </label>
                                <input
                                    type="text"
                                    value={formData.reason}
                                    onChange={(e) => handleInputChange('reason', e.target.value)}
                                    placeholder="Brief reason for this amendment"
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.reason ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                />
                                {errors.reason && (
                                    <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Detailed Description *
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    placeholder="Provide detailed description of changes being made"
                                    rows={4}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.description ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                )}
                            </div>

                            {/* Effective Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Effective Date *
                                </label>
                                <input
                                    type="date"
                                    value={formData.effectiveDate}
                                    onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.effectiveDate ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                />
                                {errors.effectiveDate && (
                                    <p className="mt-1 text-sm text-red-600">{errors.effectiveDate}</p>
                                )}
                            </div>

                            {/* Options */}
                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="notifyStakeholders"
                                        checked={formData.notifyStakeholders}
                                        onChange={(e) => handleInputChange('notifyStakeholders', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    />
                                    <label htmlFor="notifyStakeholders" className="ml-2 text-sm text-gray-700">
                                        Notify stakeholders about this amendment
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="requiresRegulatory"
                                        checked={formData.requiresRegulatory}
                                        onChange={(e) => handleInputChange('requiresRegulatory', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    />
                                    <label htmlFor="requiresRegulatory" className="ml-2 text-sm text-gray-700">
                                        Requires regulatory approval
                                    </label>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Additional Notes
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => handleInputChange('notes', e.target.value)}
                                    placeholder="Any additional notes or comments"
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Error Message */}
                            {errors.submit && (
                                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                    <p className="text-sm text-red-600">{errors.submit}</p>
                                </div>
                            )}

                            {/* Form Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? 'Creating...' : 'Create Version'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Version History Sidebar */}
                    <div className="w-80 border-l border-gray-200 pl-6">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Version History</h4>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {versionHistory.map((version, index) => (
                                <div key={version.id} className="border border-gray-200 rounded-lg p-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center">
                                            <span className="text-sm font-medium">v{version.version}</span>
                                            {index === 0 && (
                                                <span className="ml-2 text-xs text-green-600 font-medium">Current</span>
                                            )}
                                        </div>
                                        {getVersionStatusBadge(version.status)}
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center text-xs text-gray-600">
                                            {getAmendmentTypeIcon(version.amendmentType || '')}
                                            <span className="ml-1">{AMENDMENT_TYPES[version.amendmentType as keyof typeof AMENDMENT_TYPES]?.label}</span>
                                        </div>

                                        <p className="text-xs text-gray-800">{version.amendmentReason || version.description || 'No description'}</p>

                                        <div className="flex items-center text-xs text-gray-500">
                                            <User className="w-3 h-3 mr-1" />
                                            {version.createdBy || 'Unknown'}
                                        </div>

                                        <div className="flex items-center text-xs text-gray-500">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {version.createdDate ? new Date(version.createdDate).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {versionHistory.length === 0 && (
                                <p className="text-sm text-gray-500 text-center py-4">
                                    No version history available
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VersionManagementModal;
