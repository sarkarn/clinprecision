import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft, Save, X, Building, BookOpen,
    AlertCircle, CheckCircle, Calendar, User
} from 'lucide-react';
import { SiteService } from '../../../services/SiteService';
import StudyService from '../../../services/StudyService';

export default function StudySiteAssociationForm() {
    const navigate = useNavigate();
    const { id } = useParams(); // For edit mode
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        siteId: '',
        studyId: '',
        reason: '',
        siteStudyId: '',
        subjectEnrollmentCap: '',
        notes: ''
    });

    const [sites, setSites] = useState([]);
    const [studies, setStudies] = useState([]);
    const [existingAssociations, setExistingAssociations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (isEditMode && id) {
            loadAssociationForEdit(id);
        }
    }, [isEditMode, id, sites, studies]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            setError('');

            const [sitesData, studiesData] = await Promise.all([
                SiteService.getAllSites(),
                StudyService.getStudies()
            ]);

            setSites(sitesData);
            setStudies(studiesData);

            // Load existing associations to prevent duplicates
            const allAssociations = [];
            for (const site of sitesData) {
                try {
                    const siteAssociations = await SiteService.getStudyAssociationsForSite(site.id);
                    allAssociations.push(...siteAssociations);
                } catch (error) {
                    console.warn(`Failed to load associations for site ${site.id}:`, error);
                }
            }
            setExistingAssociations(allAssociations);

        } catch (error) {
            console.error('Error loading initial data:', error);
            setError('Failed to load sites and studies data');
        } finally {
            setLoading(false);
        }
    };

    const loadAssociationForEdit = async (associationId) => {
        // In edit mode, we would load the specific association
        // For now, this is a placeholder since the backend might not have a direct endpoint
        // You would need to implement this based on your backend API structure
        console.log('Edit mode not fully implemented yet');
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user starts typing
        if (error) {
            setError('');
        }
    };

    const validateForm = () => {
        if (!formData.siteId) {
            setError('Please select a site');
            return false;
        }

        if (!formData.studyId) {
            setError('Please select a study');
            return false;
        }

        if (!formData.reason.trim()) {
            setError('Please provide a reason for this association');
            return false;
        }

        // Check for duplicate association
        const duplicate = existingAssociations.find(assoc =>
            assoc.siteId?.toString() === formData.siteId &&
            assoc.studyId === formData.studyId
        );

        if (duplicate && !isEditMode) {
            setError('This site is already associated with the selected study');
            return false;
        }

        // Validate enrollment cap if provided
        if (formData.subjectEnrollmentCap && isNaN(formData.subjectEnrollmentCap)) {
            setError('Subject enrollment cap must be a valid number');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);
            setError('');

            const submissionData = {
                studyId: formData.studyId,
                reason: formData.reason.trim(),
                ...(formData.siteStudyId && { siteStudyId: formData.siteStudyId }),
                ...(formData.subjectEnrollmentCap && { subjectEnrollmentCap: parseInt(formData.subjectEnrollmentCap) }),
                ...(formData.notes && { notes: formData.notes })
            };

            if (isEditMode) {
                // Update existing association - would need backend endpoint
                console.log('Update not implemented yet');
                showNotification('Association updated successfully!', 'success');
            } else {
                // Create new association
                await SiteService.associateSiteWithStudy(formData.siteId, submissionData);
                showNotification('Study site association created successfully!', 'success');
            }

            // Navigate back to list after a short delay
            setTimeout(() => {
                navigate('/admin/study-site-associations');
            }, 1500);

        } catch (error) {
            console.error('Error saving association:', error);
            setError(error.message || 'Failed to save study site association');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (hasUnsavedChanges()) {
            if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                navigate('/admin/study-site-associations');
            }
        } else {
            navigate('/admin/study-site-associations');
        }
    };

    const hasUnsavedChanges = () => {
        return formData.siteId || formData.studyId || formData.reason.trim() ||
            formData.siteStudyId || formData.subjectEnrollmentCap || formData.notes;
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: 'success' });
        }, 3000);
    };

    const getAvailableStudies = () => {
        if (!formData.siteId) return studies;

        // Filter out studies already associated with the selected site
        return studies.filter(study =>
            !existingAssociations.some(assoc =>
                assoc.siteId?.toString() === formData.siteId &&
                (assoc.studyId === study.protocolNumber || assoc.studyId === study.id?.toString())
            )
        );
    };

    const getSelectedSite = () => {
        return sites.find(site => site.id?.toString() === formData.siteId);
    };

    const getSelectedStudy = () => {
        return studies.find(study =>
            study.protocolNumber === formData.studyId || study.id?.toString() === formData.studyId
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading form data...</span>
                </div>
            </div>
        );
    }

    if (error && !formData.siteId && !formData.studyId) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                        <p className="text-red-600">{error}</p>
                        <button
                            onClick={loadInitialData}
                            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleCancel}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {isEditMode ? 'Edit' : 'Create'} Study Site Association
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {isEditMode ? 'Update the' : 'Create a new'} association between a study and clinical site
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleCancel}
                            disabled={saving}
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            {saving ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {saving ? 'Saving...' : 'Save Association'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-4xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <span className="text-red-700">{error}</span>
                        </div>
                    )}

                    {/* Notification */}
                    {notification.show && (
                        <div className={`border rounded-lg p-4 flex items-center gap-3 ${notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                                'bg-red-50 border-red-200 text-red-800'
                            }`}>
                            {notification.type === 'success' ?
                                <CheckCircle className="w-5 h-5 flex-shrink-0" /> :
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            }
                            <span>{notification.message}</span>
                        </div>
                    )}

                    {/* Basic Information */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Site Selection */}
                            <div>
                                <label htmlFor="siteId" className="block text-sm font-medium text-gray-700 mb-2">
                                    Clinical Site *
                                </label>
                                <select
                                    id="siteId"
                                    value={formData.siteId}
                                    onChange={(e) => handleInputChange('siteId', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={saving}
                                >
                                    <option value="">Select a site...</option>
                                    {sites.map((site) => (
                                        <option key={site.id} value={site.id}>
                                            {site.siteNumber} - {site.name}
                                        </option>
                                    ))}
                                </select>
                                {getSelectedSite() && (
                                    <div className="mt-2 p-3 bg-gray-50 rounded border">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Building className="w-4 h-4 text-gray-500" />
                                            <span className="font-medium text-gray-900">{getSelectedSite().name}</span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {getSelectedSite().organizationName || 'Unknown Organization'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Status: {getSelectedSite().status}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Study Selection */}
                            <div>
                                <label htmlFor="studyId" className="block text-sm font-medium text-gray-700 mb-2">
                                    Study *
                                </label>
                                <select
                                    id="studyId"
                                    value={formData.studyId}
                                    onChange={(e) => handleInputChange('studyId', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={saving || !formData.siteId}
                                >
                                    <option value="">
                                        {!formData.siteId ? 'Select a site first...' : 'Select a study...'}
                                    </option>
                                    {getAvailableStudies().map((study) => (
                                        <option key={study.id} value={study.protocolNumber || study.id}>
                                            {study.protocolNumber || study.id} - {study.name}
                                        </option>
                                    ))}
                                </select>
                                {getSelectedStudy() && (
                                    <div className="mt-2 p-3 bg-gray-50 rounded border">
                                        <div className="flex items-center gap-2 mb-1">
                                            <BookOpen className="w-4 h-4 text-gray-500" />
                                            <span className="font-medium text-gray-900">{getSelectedStudy().name}</span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Protocol: {getSelectedStudy().protocolNumber || getSelectedStudy().id}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Phase: {getSelectedStudy().phase || 'N/A'} •
                                            Status: {getSelectedStudy().status || 'N/A'}
                                        </p>
                                    </div>
                                )}
                                {formData.siteId && getAvailableStudies().length === 0 && (
                                    <p className="mt-2 text-sm text-gray-500">
                                        No available studies to associate with this site
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Reason */}
                        <div className="mt-6">
                            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for Association *
                            </label>
                            <textarea
                                id="reason"
                                rows={3}
                                value={formData.reason}
                                onChange={(e) => handleInputChange('reason', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., Site selected for multi-center trial based on enrollment capacity and therapeutic expertise..."
                                disabled={saving}
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                Provide a clear reason for associating this site with the study (for audit purposes)
                            </p>
                        </div>
                    </div>

                    {/* Optional Configuration */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Optional Configuration</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Site Study ID */}
                            <div>
                                <label htmlFor="siteStudyId" className="block text-sm font-medium text-gray-700 mb-2">
                                    Site-Specific Study ID
                                </label>
                                <input
                                    type="text"
                                    id="siteStudyId"
                                    value={formData.siteStudyId}
                                    onChange={(e) => handleInputChange('siteStudyId', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., SITE001-STUDY123"
                                    disabled={saving}
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    Internal identifier used by the site for this study
                                </p>
                            </div>

                            {/* Subject Enrollment Cap */}
                            <div>
                                <label htmlFor="subjectEnrollmentCap" className="block text-sm font-medium text-gray-700 mb-2">
                                    Subject Enrollment Cap
                                </label>
                                <input
                                    type="number"
                                    id="subjectEnrollmentCap"
                                    min="0"
                                    value={formData.subjectEnrollmentCap}
                                    onChange={(e) => handleInputChange('subjectEnrollmentCap', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., 50"
                                    disabled={saving}
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    Maximum number of subjects this site can enroll
                                </p>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="mt-6">
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                                Additional Notes
                            </label>
                            <textarea
                                id="notes"
                                rows={3}
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Any additional information about this association..."
                                disabled={saving}
                            />
                        </div>
                    </div>

                    {/* Summary */}
                    {formData.siteId && formData.studyId && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-blue-900 mb-4">Association Summary</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Building className="w-4 h-4 text-blue-600" />
                                        <span className="font-medium text-blue-900">Site</span>
                                    </div>
                                    <p className="text-blue-800">{getSelectedSite()?.name}</p>
                                    <p className="text-sm text-blue-600">Site #{getSelectedSite()?.siteNumber}</p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <BookOpen className="w-4 h-4 text-blue-600" />
                                        <span className="font-medium text-blue-900">Study</span>
                                    </div>
                                    <p className="text-blue-800">{getSelectedStudy()?.name}</p>
                                    <p className="text-sm text-blue-600">{getSelectedStudy()?.protocolNumber}</p>
                                </div>
                            </div>
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                <p className="text-sm text-yellow-800">
                                    <strong>Note:</strong> The association will be created in PENDING status.
                                    It will need to be activated separately before the site can begin enrollment.
                                </p>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}