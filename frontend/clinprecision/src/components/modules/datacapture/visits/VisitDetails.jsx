// VisitDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getVisitDetails } from '../../../../services/DataEntryService';
import FormSelectorModal from './FormSelectorModal';
import ApiService from '../../../../services/ApiService';

export default function VisitDetails() {
    const { subjectId, visitId } = useParams();
    const [visitDetails, setVisitDetails] = useState(null);
    const [visitMetadata, setVisitMetadata] = useState(null); // Study ID, UUID, etc.
    const [loading, setLoading] = useState(true);
    const [showFormSelector, setShowFormSelector] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchVisitDetails = async () => {
            setLoading(true);
            try {
                // First, fetch visit metadata (studyId, visitUuid, etc.)
                const metadataResponse = await ApiService.get(`/clinops-ws/api/v1/visits/${visitId}`);
                console.log('[VISIT DETAILS] Visit metadata:', metadataResponse.data);
                setVisitMetadata(metadataResponse.data);

                // Then fetch form details
                const details = await getVisitDetails(subjectId, visitId);
                setVisitDetails(details);
            } catch (error) {
                console.error('Error fetching visit details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchVisitDetails();
    }, [subjectId, visitId]);

    /**
     * Reload visit details after forms are added
     */
    const handleFormsAdded = () => {
        console.log('[VISIT DETAILS] Forms added, reloading visit details...');
        // Reload visit details to show newly added forms
        const fetchVisitDetails = async () => {
            try {
                // Fetch updated metadata
                const metadataResponse = await ApiService.get(`/clinops-ws/api/v1/visits/${visitId}`);
                setVisitMetadata(metadataResponse.data);

                // Fetch updated form details
                const details = await getVisitDetails(subjectId, visitId);
                setVisitDetails(details);
            } catch (error) {
                console.error('Error reloading visit details:', error);
            }
        };
        fetchVisitDetails();
    };

    /**
     * Get compliance badge styling based on compliance status
     */
    const getComplianceBadgeClass = (complianceStatus) => {
        if (!complianceStatus) return 'bg-gray-100 text-gray-700';

        const statusClasses = {
            'COMPLIANT': 'bg-green-100 text-green-800',
            'UPCOMING': 'bg-blue-100 text-blue-800',
            'APPROACHING': 'bg-yellow-100 text-yellow-800',
            'OVERDUE': 'bg-red-100 text-red-800',
            'PROTOCOL_VIOLATION': 'bg-red-100 text-red-900 border border-red-300'
        };

        return statusClasses[complianceStatus] || 'bg-gray-100 text-gray-700';
    };

    /**
     * Get human-readable compliance status label
     */
    const getComplianceLabel = (complianceStatus) => {
        if (!complianceStatus) return 'N/A';

        const labels = {
            'COMPLIANT': 'Compliant',
            'UPCOMING': 'Upcoming',
            'APPROACHING': 'Due Soon',
            'OVERDUE': 'Overdue',
            'PROTOCOL_VIOLATION': 'Protocol Violation'
        };

        return labels[complianceStatus] || complianceStatus;
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'complete':
                return 'bg-green-100 text-green-800';
            case 'incomplete':
                return 'bg-yellow-100 text-yellow-800';
            case 'not_started':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'complete':
                return 'Complete';
            case 'incomplete':
                return 'Incomplete';
            case 'not_started':
                return 'Not Started';
            default:
                return 'Unknown';
        }
    };

    if (loading) return <div className="text-center py-4">Loading visit details...</div>;
    if (!visitDetails) return <div className="text-center py-4">Visit not found</div>;

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-6">
                <Link to={`/datacapture-management/subjects/${subjectId}`} className="text-blue-600 hover:underline">
                    &larr; Back to Subject
                </Link>
                <h3 className="text-xl font-bold mt-2">
                    {visitDetails.visitName} - Subject {visitDetails.subjectId}
                </h3>
                <p className="text-gray-600">{visitDetails.description}</p>
            </div>

            {/* Visit Window Compliance Panel */}
            {visitDetails.visitWindowStart && visitDetails.visitWindowEnd && (
                <div className={`mb-6 rounded-lg border-2 p-5 ${visitDetails.complianceStatus === 'PROTOCOL_VIOLATION' ? 'border-red-500 bg-red-50' :
                    visitDetails.complianceStatus === 'OVERDUE' ? 'border-red-400 bg-red-50' :
                        visitDetails.complianceStatus === 'APPROACHING' ? 'border-yellow-400 bg-yellow-50' :
                            visitDetails.complianceStatus === 'COMPLIANT' ? 'border-green-400 bg-green-50' :
                                'border-blue-400 bg-blue-50'
                    }`}>
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                Visit Window Compliance
                                <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getComplianceBadgeClass(visitDetails.complianceStatus)}`}>
                                    {getComplianceLabel(visitDetails.complianceStatus)}
                                </span>
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                                Protocol compliance status for this visit
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Window Start */}
                        <div className="bg-white rounded-md border border-gray-200 p-3">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                Window Opens
                            </p>
                            <p className="text-lg font-semibold text-gray-900">
                                {new Date(visitDetails.visitWindowStart).toLocaleDateString()}
                            </p>
                            {visitDetails.windowDaysBefore && (
                                <p className="text-xs text-gray-500 mt-1">
                                    {visitDetails.windowDaysBefore} days before target
                                </p>
                            )}
                        </div>

                        {/* Window End */}
                        <div className="bg-white rounded-md border border-gray-200 p-3">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                Window Closes
                            </p>
                            <p className="text-lg font-semibold text-gray-900">
                                {new Date(visitDetails.visitWindowEnd).toLocaleDateString()}
                            </p>
                            {visitDetails.windowDaysAfter && (
                                <p className="text-xs text-gray-500 mt-1">
                                    {visitDetails.windowDaysAfter} days after target
                                </p>
                            )}
                        </div>

                        {/* Actual Visit Date or Status */}
                        <div className="bg-white rounded-md border border-gray-200 p-3">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                {visitDetails.actualVisitDate ? 'Actual Visit Date' : 'Target Date'}
                            </p>
                            <p className="text-lg font-semibold text-gray-900">
                                {visitDetails.actualVisitDate
                                    ? new Date(visitDetails.actualVisitDate).toLocaleDateString()
                                    : new Date(visitDetails.visitDate).toLocaleDateString()
                                }
                            </p>
                            {visitDetails.daysOverdue > 0 && (
                                <p className="text-xs text-red-600 font-semibold mt-1">
                                    ⚠️ {visitDetails.daysOverdue} day{visitDetails.daysOverdue !== 1 ? 's' : ''} overdue
                                </p>
                            )}
                            {visitDetails.daysOverdue < 0 && Math.abs(visitDetails.daysOverdue) <= 7 && (
                                <p className="text-xs text-yellow-600 font-semibold mt-1">
                                    ⏰ Due in {Math.abs(visitDetails.daysOverdue)} day{Math.abs(visitDetails.daysOverdue) !== 1 ? 's' : ''}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Protocol Violation Warning */}
                    {visitDetails.complianceStatus === 'PROTOCOL_VIOLATION' && (
                        <div className="mt-4 bg-red-100 border-l-4 border-red-500 p-4 rounded">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-bold text-red-800">Protocol Violation Detected</h3>
                                    <p className="text-sm text-red-700 mt-1">
                                        This visit is significantly outside the allowed window. Please document the reason for this deviation and notify the study coordinator immediately.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Overdue Warning */}
                    {visitDetails.complianceStatus === 'OVERDUE' && (
                        <div className="mt-4 bg-orange-100 border-l-4 border-orange-500 p-4 rounded">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-bold text-orange-800">Visit Overdue</h3>
                                    <p className="text-sm text-orange-700 mt-1">
                                        This visit is past the allowed window. Please complete the visit as soon as possible to maintain protocol compliance.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Approaching Deadline Warning */}
                    {visitDetails.complianceStatus === 'APPROACHING' && (
                        <div className="mt-4 bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-bold text-yellow-800">Window Closing Soon</h3>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        The visit window is approaching its deadline. Please schedule this visit soon to ensure protocol compliance.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Visit Date
                    </label>
                    <div className="bg-gray-50 border border-gray-300 rounded-md p-2">
                        {new Date(visitDetails.visitDate).toLocaleDateString()}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                    </label>
                    <div className="bg-gray-50 border border-gray-300 rounded-md p-2">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(visitDetails.status)}`}>
                            {getStatusLabel(visitDetails.status)}
                        </span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Study Timepoint
                    </label>
                    <div className="bg-gray-50 border border-gray-300 rounded-md p-2">
                        Day {visitDetails.timepoint}
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Forms</h4>
                    {visitDetails.forms.length > 0 && (
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-600">
                                <span className="font-semibold text-green-600">
                                    {visitDetails.forms.filter(f => f.status === 'complete').length}
                                </span>
                                {' of '}
                                <span className="font-semibold">
                                    {visitDetails.forms.length}
                                </span>
                                {' forms completed'}
                            </div>
                            <div className="flex-1 max-w-xs">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                                        style={{
                                            width: `${(visitDetails.forms.filter(f => f.status === 'complete').length / visitDetails.forms.length) * 100}%`
                                        }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 text-center">
                                    {Math.round((visitDetails.forms.filter(f => f.status === 'complete').length / visitDetails.forms.length) * 100)}% complete
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {visitDetails.forms.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">No forms assigned to this visit</p>
                        <p className="mt-1 text-xs text-gray-400">Add forms to begin data collection</p>
                        <button
                            onClick={() => setShowFormSelector(true)}
                            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
                        >
                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Forms
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className="flex justify-end mb-3">
                            <button
                                onClick={() => setShowFormSelector(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
                            >
                                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add More Forms
                            </button>
                        </div>
                        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-md">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Form Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {visitDetails.forms.map(form => (
                                    <tr key={form.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">{form.name}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(form.status)}`}>
                                                {getStatusLabel(form.status)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {form.lastUpdated ? new Date(form.lastUpdated).toLocaleString() : 'Not started'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {form.status === 'complete' ? (
                                                <Link to={`/datacapture-management/subjects/${subjectId}/visits/${visitId}/forms/${form.id}/view`} className="text-blue-600 hover:text-blue-800 mr-3">
                                                    View
                                                </Link>
                                            ) : (
                                                <Link to={`/datacapture-management/subjects/${subjectId}/visits/${visitId}/forms/${form.id}/entry`} className="text-green-600 hover:text-green-800 mr-3">
                                                    {form.status === 'incomplete' ? 'Continue' : 'Start'}
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Form Selector Modal */}
            <FormSelectorModal
                isOpen={showFormSelector}
                onClose={() => setShowFormSelector(false)}
                studyId={visitMetadata?.studyId}
                visitInstanceId={parseInt(visitId)}
                visitType={visitMetadata?.visitType}
                onFormsAdded={handleFormsAdded}
            />
        </div>
    );
}