import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info, Calendar, FileText, Users } from 'lucide-react';

/**
 * Protocol Version Form Component
 * Handles creation and editing of protocol versions
 */
const ProtocolVersionForm = ({
    mode = 'create', // 'create' | 'edit'
    initialData = {},
    onSubmit,
    onCancel,
    suggestedVersionNumber = '1.0',
    amendmentTypes = [],
    loading = false,
    isInitialVersion = false
}) => {
    const [formData, setFormData] = useState({
        versionNumber: '',
        description: '',
        amendmentType: isInitialVersion ? 'INITIAL' : '',
        amendmentReason: '',
        changesSummary: '',
        impactAssessment: '',
        effectiveDate: '',
        requiresRegulatoryApproval: false,
        notifyStakeholders: true,
        additionalNotes: ''
    });

    const [errors, setErrors] = useState({});
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Initialize form data
    useEffect(() => {
        if (mode === 'edit' && initialData) {
            setFormData({
                versionNumber: initialData.versionNumber || '',
                description: initialData.description || '',
                amendmentType: initialData.amendmentType || (isInitialVersion ? 'INITIAL' : ''),
                amendmentReason: initialData.amendmentReason || '',
                changesSummary: initialData.changesSummary || '',
                impactAssessment: initialData.impactAssessment || '',
                effectiveDate: initialData.effectiveDate || '',
                requiresRegulatoryApproval: initialData.requiresRegulatoryApproval || false,
                notifyStakeholders: initialData.notifyStakeholders !== false,
                additionalNotes: initialData.additionalNotes || ''
            });
        } else if (mode === 'create') {
            setFormData(prev => ({
                ...prev,
                versionNumber: suggestedVersionNumber,
                amendmentType: isInitialVersion ? 'INITIAL' : prev.amendmentType
            }));
        }
    }, [mode, initialData, suggestedVersionNumber, isInitialVersion]);

    // Handle input changes
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        // Version number validation
        if (!formData.versionNumber.trim()) {
            newErrors.versionNumber = 'Version number is required';
        } else if (!/^\d+\.\d+(\.\d+)?$/.test(formData.versionNumber)) {
            newErrors.versionNumber = 'Version number must be in format X.Y or X.Y.Z (e.g., 1.0, 2.1.3)';
        }

        // Description validation
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (formData.description.length < 10) {
            newErrors.description = 'Description must be at least 10 characters';
        }

        // Amendment type validation
        if (!isInitialVersion && !formData.amendmentType) {
            newErrors.amendmentType = 'Amendment type is required';
        }

        // Amendment reason validation for amendments
        if (!isInitialVersion && ['MAJOR', 'SAFETY'].includes(formData.amendmentType)) {
            if (!formData.amendmentReason.trim()) {
                newErrors.amendmentReason = 'Amendment reason is required for major and safety amendments';
            }
            if (!formData.changesSummary.trim()) {
                newErrors.changesSummary = 'Changes summary is required for major and safety amendments';
            }
        }

        // Effective date validation
        if (formData.effectiveDate) {
            const effectiveDate = new Date(formData.effectiveDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (effectiveDate < today) {
                newErrors.effectiveDate = 'Effective date cannot be in the past';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        onSubmit(formData);
    };

    // Get amendment type options
    const getAmendmentTypeOptions = () => {
        if (isInitialVersion) {
            return [{ value: 'INITIAL', label: 'Initial Protocol', description: 'Initial protocol version' }];
        }

        return amendmentTypes.map(type => ({
            value: type.value,
            label: type.label,
            description: type.description
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                        {mode === 'create' ? 'Create Protocol Version' : 'Edit Protocol Version'}
                    </h3>
                </div>

                {/* Version Number */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Version Number *
                    </label>
                    <input
                        type="text"
                        value={formData.versionNumber}
                        onChange={(e) => handleInputChange('versionNumber', e.target.value)}
                        placeholder="e.g., 1.0, 2.1, 1.0.1"
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.versionNumber ? 'border-red-500' : 'border-gray-300'
                            }`}
                        disabled={mode === 'edit'}
                    />
                    {errors.versionNumber && (
                        <p className="mt-1 text-sm text-red-600">{errors.versionNumber}</p>
                    )}
                    {mode === 'create' && (
                        <p className="mt-1 text-sm text-gray-500">
                            Suggested: {suggestedVersionNumber}
                        </p>
                    )}
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Describe the purpose and content of this protocol version..."
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.description ? 'border-red-500' : 'border-gray-300'
                            }`}
                    />
                    {errors.description && (
                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                    <p className="mt-1 text-sm text-gray-500">
                        {formData.description.length}/500 characters
                    </p>
                </div>

                {/* Amendment Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isInitialVersion ? 'Protocol Type' : 'Amendment Type *'}
                    </label>
                    <select
                        value={formData.amendmentType}
                        onChange={(e) => handleInputChange('amendmentType', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.amendmentType ? 'border-red-500' : 'border-gray-300'
                            }`}
                        disabled={isInitialVersion}
                    >
                        <option value="">Select amendment type...</option>
                        {getAmendmentTypeOptions().map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {errors.amendmentType && (
                        <p className="mt-1 text-sm text-red-600">{errors.amendmentType}</p>
                    )}
                    {formData.amendmentType && (
                        <p className="mt-1 text-sm text-gray-500">
                            {getAmendmentTypeOptions().find(opt => opt.value === formData.amendmentType)?.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Amendment Details Section (for non-initial versions) */}
            {!isInitialVersion && formData.amendmentType && (
                <div className="space-y-4 border-t pt-6">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        <h4 className="text-md font-semibold text-gray-900">Amendment Details</h4>
                    </div>

                    {/* Amendment Reason */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Amendment Reason {['MAJOR', 'SAFETY'].includes(formData.amendmentType) && '*'}
                        </label>
                        <textarea
                            value={formData.amendmentReason}
                            onChange={(e) => handleInputChange('amendmentReason', e.target.value)}
                            placeholder="Explain why this amendment is necessary..."
                            rows={2}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.amendmentReason ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.amendmentReason && (
                            <p className="mt-1 text-sm text-red-600">{errors.amendmentReason}</p>
                        )}
                    </div>

                    {/* Changes Summary */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Changes Summary {['MAJOR', 'SAFETY'].includes(formData.amendmentType) && '*'}
                        </label>
                        <textarea
                            value={formData.changesSummary}
                            onChange={(e) => handleInputChange('changesSummary', e.target.value)}
                            placeholder="Summarize the key changes in this version..."
                            rows={3}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.changesSummary ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.changesSummary && (
                            <p className="mt-1 text-sm text-red-600">{errors.changesSummary}</p>
                        )}
                    </div>
                </div>
            )}

            {/* Advanced Options Section */}
            <div className="border-t pt-6">
                <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mb-4"
                >
                    <Info className="h-4 w-4" />
                    {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                </button>

                {showAdvanced && (
                    <div className="space-y-4">
                        {/* Effective Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar className="inline h-4 w-4 mr-1" />
                                Effective Date
                            </label>
                            <input
                                type="date"
                                value={formData.effectiveDate}
                                onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.effectiveDate ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.effectiveDate && (
                                <p className="mt-1 text-sm text-red-600">{errors.effectiveDate}</p>
                            )}
                            <p className="mt-1 text-sm text-gray-500">
                                When this protocol version should take effect
                            </p>
                        </div>

                        {/* Impact Assessment */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Impact Assessment
                            </label>
                            <textarea
                                value={formData.impactAssessment}
                                onChange={(e) => handleInputChange('impactAssessment', e.target.value)}
                                placeholder="Assess the impact of these changes on the study..."
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Additional Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Additional Notes
                            </label>
                            <textarea
                                value={formData.additionalNotes}
                                onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                                placeholder="Any additional notes or comments..."
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Checkboxes */}
                        <div className="space-y-3">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.requiresRegulatoryApproval}
                                    onChange={(e) => handleInputChange('requiresRegulatoryApproval', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                    Requires regulatory approval
                                </span>
                            </label>

                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.notifyStakeholders}
                                    onChange={(e) => handleInputChange('notifyStakeholders', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                    <Users className="inline h-4 w-4 mr-1" />
                                    Notify stakeholders
                                </span>
                            </label>
                        </div>
                    </div>
                )}
            </div>

            {/* Form Actions */}
            <div className="border-t pt-6 flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Saving...' : (mode === 'create' ? 'Create Version' : 'Update Version')}
                </button>
            </div>
        </form>
    );
};

export default ProtocolVersionForm;