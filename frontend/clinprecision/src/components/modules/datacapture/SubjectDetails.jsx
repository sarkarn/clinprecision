import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getSubjectById, updateSubjectStatus } from '../../../services/SubjectService';
import { getPatientVisits } from '../../../services/VisitService';
import { startVisit } from '../../../services/DataEntryService';
import PatientStatusBadge from '../subjectmanagement/components/PatientStatusBadge';
import StatusChangeModal from '../subjectmanagement/components/StatusChangeModal';
import StatusHistoryTimeline from '../subjectmanagement/components/StatusHistoryTimeline';
import UnscheduledVisitModal from '../subjectmanagement/components/UnscheduledVisitModal';

/**
 * Normalize backend visit status to frontend format
 * Backend: COMPLETED, IN_PROGRESS, SCHEDULED
 * Frontend: complete, incomplete, not_started
 */
const normalizeVisitStatus = (backendStatus) => {
    if (!backendStatus) return 'not_started';

    const statusMap = {
        'COMPLETED': 'complete',
        'IN_PROGRESS': 'incomplete',
        'SCHEDULED': 'not_started'
    };

    return statusMap[backendStatus.toUpperCase()] || backendStatus.toLowerCase();
};

/**
 * Get compliance badge styling based on compliance status
 * Returns Tailwind CSS classes for badge display
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

export default function SubjectDetails() {
    console.log('[SUBJECT DETAILS] Component mounted/rendering');
    const { subjectId } = useParams();
    console.log('[SUBJECT DETAILS] subjectId from useParams:', subjectId);
    const [subject, setSubject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showVisitModal, setShowVisitModal] = useState(false);
    const [visitType, setVisitType] = useState(null);
    const [visits, setVisits] = useState([]);
    const [visitsLoading, setVisitsLoading] = useState(false);
    const [complianceFilter, setComplianceFilter] = useState('all'); // 'all', 'overdue', 'upcoming', 'compliant'
    const navigate = useNavigate();

    useEffect(() => {
        fetchSubjectDetails();
    }, [subjectId]);

    useEffect(() => {
        if (subject?.id) {
            fetchVisits();
        }
    }, [subject?.id]);

    const fetchSubjectDetails = async () => {
        console.log('[SUBJECT DETAILS] Fetching details for subjectId:', subjectId);
        setLoading(true);
        try {
            const subjectData = await getSubjectById(subjectId);
            console.log('[SUBJECT DETAILS] Received data:', subjectData);
            setSubject(subjectData);
        } catch (error) {
            console.error('[SUBJECT DETAILS] Error fetching subject details:', error);
            console.error('[SUBJECT DETAILS] Error details:', {
                message: error.message,
                response: error.response,
                status: error.response?.status
            });
            setError(`Failed to load subject details: ${error.message || 'Please try again later.'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChanged = (result) => {
        console.log('[SUBJECT DETAILS] Status changed successfully, result:', result);

        // Close status modal first
        setShowStatusModal(false);

        // Check if user wants to create a visit
        if (result?.createVisit && result?.visitType) {
            console.log('[SUBJECT DETAILS] Opening visit modal for type:', result.visitType);
            setVisitType(result.visitType);
            setShowVisitModal(true);
        } else {
            console.log('[SUBJECT DETAILS] No visit creation requested, refreshing data');
            // Refresh both subject data AND visits (protocol visits may have been created)
            fetchSubjectDetails();
            // Small delay to allow backend event processing to complete
            setTimeout(() => {
                fetchVisits();
            }, 500);
        }
    };

    const fetchVisits = async () => {
        if (!subject?.id) return;

        setVisitsLoading(true);
        try {
            console.log('[SUBJECT DETAILS] Fetching visits for patient:', subject.id);
            const visitsData = await getPatientVisits(subject.id);
            console.log('[SUBJECT DETAILS] Visits loaded:', visitsData);

            // Normalize backend status values to frontend format
            // Backend: COMPLETED, IN_PROGRESS, SCHEDULED
            // Frontend: complete, incomplete, not_started
            const normalizedVisits = (visitsData || []).map(visit => ({
                ...visit,
                status: normalizeVisitStatus(visit.status)
            }));

            setVisits(normalizedVisits);
        } catch (error) {
            console.error('[SUBJECT DETAILS] Error fetching visits:', error);
            setVisits([]);
        } finally {
            setVisitsLoading(false);
        }
    }; const handleVisitCreated = (visit) => {
        console.log('[SUBJECT DETAILS] Visit created successfully:', visit);
        setShowVisitModal(false);
        // Refresh visits after creation
        fetchVisits();
        // Also refresh subject data
        fetchSubjectDetails();
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <svg className="animate-spin h-8 w-8 mx-auto text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-2">Loading subject details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>{error}</p>
                <button
                    onClick={() => navigate('/datacapture-management')}
                    className="mt-3 text-blue-600 hover:underline"
                >
                    Return to Subject List
                </button>
            </div>
        );
    }

    if (!subject) {
        return (
            <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-gray-700">Subject not found</p>
                <button
                    onClick={() => navigate('/subject-management')}
                    className="mt-3 text-blue-600 hover:underline"
                >
                    Return to Subject Management
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-6">
                <Link to="/subject-management" className="text-blue-600 hover:underline">
                    &larr; Back to Subject Management
                </Link>
                <div className="flex justify-between items-center mt-4">
                    <h3 className="text-xl font-bold">Subject Details: {subject.subjectId}</h3>
                    <div className="flex items-center gap-3">
                        <PatientStatusBadge status={subject.status} size="lg" />
                        <button
                            onClick={() => setShowStatusModal(true)}
                            className="border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Change Status
                        </button>
                        <button
                            onClick={() => setShowHistory(true)}
                            className="border border-blue-500 text-blue-600 rounded-md px-4 py-2 text-sm font-medium hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            View History
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject Name
                    </label>
                    <div className="bg-gray-50 border border-gray-300 rounded-md p-2">
                        {subject.firstName && subject.lastName ?
                            `${subject.firstName} ${subject.lastName}` :
                            'N/A'
                        }
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <div className="bg-gray-50 border border-gray-300 rounded-md p-2">
                        {subject.email || 'N/A'}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                    </label>
                    <div className="bg-gray-50 border border-gray-300 rounded-md p-2">
                        {subject.phone || 'N/A'}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Study Name
                    </label>
                    <div className="bg-gray-50 border border-gray-300 rounded-md p-2">
                        {subject.studyName || (subject.studyId ? `Study ID: ${subject.studyId}` : 'Not Enrolled')}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Treatment Arm
                    </label>
                    <div className="bg-gray-50 border border-gray-300 rounded-md p-2">
                        {subject.treatmentArmName || 'Not Assigned'}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Enrollment Date
                    </label>
                    <div className="bg-gray-50 border border-gray-300 rounded-md p-2">
                        {new Date(subject.enrollmentDate).toLocaleDateString()}
                    </div>
                </div>
            </div>

            {subject.aggregateUuid && (
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        System Details
                    </label>
                    <div className="bg-gray-50 border border-gray-300 rounded-md p-2 text-xs text-gray-600">
                        <p><strong>Aggregate ID:</strong> {subject.aggregateUuid}</p>
                        {subject.createdAt && <p><strong>Created:</strong> {new Date(subject.createdAt).toLocaleString()}</p>}
                        {subject.lastModifiedAt && <p><strong>Last Modified:</strong> {new Date(subject.lastModifiedAt).toLocaleString()}</p>}
                    </div>
                </div>
            )}

            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Visits</h4>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setVisitType('SCREENING'); // Default to SCREENING
                                setShowVisitModal(true);
                            }}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            + Create Visit
                        </button>
                        <Link
                            to={`/datacapture-management/subjects/${subjectId}/visits`}
                            className="text-blue-600 hover:underline text-sm"
                        >
                            View All Visits
                        </Link>
                    </div>
                </div>

                {/* Visit Progress Summary */}
                {visits && visits.length > 0 && !visitsLoading && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div>
                                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Total Visits</p>
                                    <p className="text-2xl font-bold text-gray-900">{visits.length}</p>
                                </div>
                                <div className="h-12 w-px bg-gray-300"></div>
                                <div>
                                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Completed</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {visits.filter(v => v.status === 'complete').length}
                                    </p>
                                </div>
                                <div className="h-12 w-px bg-gray-300"></div>
                                <div>
                                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">In Progress</p>
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {visits.filter(v => v.status === 'incomplete').length}
                                    </p>
                                </div>
                                <div className="h-12 w-px bg-gray-300"></div>
                                <div>
                                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Not Started</p>
                                    <p className="text-2xl font-bold text-gray-600">
                                        {visits.filter(v => v.status === 'not_started').length}
                                    </p>
                                </div>
                                <div className="h-12 w-px bg-gray-300"></div>
                                <div>
                                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">⚠️ Overdue</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {visits.filter(v => v.complianceStatus === 'OVERDUE' || v.complianceStatus === 'PROTOCOL_VIOLATION').length}
                                    </p>
                                </div>
                            </div>
                            <div className="flex-1 max-w-md ml-6">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium text-gray-600">Overall Progress</span>
                                    <span className="text-sm font-bold text-gray-900">
                                        {Math.round((visits.filter(v => v.status === 'complete').length / visits.length) * 100)}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                                        style={{
                                            width: `${(visits.filter(v => v.status === 'complete').length / visits.length) * 100}%`
                                        }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {visits.filter(v => v.status === 'complete').length} of {visits.length} visits completed
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Compliance Filter */}
                {visits && visits.length > 0 && !visitsLoading && (
                    <div className="flex gap-2 mb-3">
                        <button
                            onClick={() => setComplianceFilter('all')}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${complianceFilter === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            All Visits ({visits.length})
                        </button>
                        <button
                            onClick={() => setComplianceFilter('overdue')}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${complianceFilter === 'overdue'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            ⚠️ Overdue ({visits.filter(v => v.complianceStatus === 'OVERDUE' || v.complianceStatus === 'PROTOCOL_VIOLATION').length})
                        </button>
                        <button
                            onClick={() => setComplianceFilter('upcoming')}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${complianceFilter === 'upcoming'
                                    ? 'bg-yellow-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Due Soon ({visits.filter(v => v.complianceStatus === 'APPROACHING').length})
                        </button>
                        <button
                            onClick={() => setComplianceFilter('compliant')}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${complianceFilter === 'compliant'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            ✓ Compliant ({visits.filter(v => v.complianceStatus === 'COMPLIANT').length})
                        </button>
                    </div>
                )}

                {visitsLoading ? (
                    <div className="text-center py-4 bg-gray-50 border border-gray-200 rounded-md">
                        <p className="text-gray-500">Loading visits...</p>
                    </div>
                ) : visits && visits.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-md">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visit Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visit Window</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compliance</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {visits
                                .filter(visit => {
                                    if (complianceFilter === 'all') return true;
                                    if (complianceFilter === 'overdue') return visit.complianceStatus === 'OVERDUE' || visit.complianceStatus === 'PROTOCOL_VIOLATION';
                                    if (complianceFilter === 'upcoming') return visit.complianceStatus === 'APPROACHING';
                                    if (complianceFilter === 'compliant') return visit.complianceStatus === 'COMPLIANT';
                                    return true;
                                })
                                .map(visit => (
                                    <tr key={visit.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900">{visit.visitName}</div>
                                            {visit.daysOverdue > 0 && (
                                                <div className="text-xs text-red-600 mt-1">
                                                    {visit.daysOverdue} day{visit.daysOverdue !== 1 ? 's' : ''} overdue
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm">
                                                {visit.visitWindowStart && visit.visitWindowEnd ? (
                                                    <>
                                                        <div className="text-gray-900">
                                                            {new Date(visit.visitWindowStart).toLocaleDateString()} - {new Date(visit.visitWindowEnd).toLocaleDateString()}
                                                        </div>
                                                        {visit.actualVisitDate && (
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                Actual: {new Date(visit.actualVisitDate).toLocaleDateString()}
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400">No window defined</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {visit.completionPercentage !== undefined ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[80px]">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-300 ${visit.completionPercentage === 100 ? 'bg-green-600' :
                                                                visit.completionPercentage > 0 ? 'bg-yellow-500' :
                                                                    'bg-gray-400'
                                                                }`}
                                                            style={{ width: `${visit.completionPercentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs text-gray-600 whitespace-nowrap">
                                                        {Math.round(visit.completionPercentage)}%
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${visit.status === 'complete' ? 'bg-green-100 text-green-800' :
                                                    visit.status === 'incomplete' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'}`}>
                                                {visit.status === 'complete' ? 'Complete' :
                                                    visit.status === 'incomplete' ? 'Incomplete' : 'Not Started'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {visit.complianceStatus ? (
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getComplianceBadgeClass(visit.complianceStatus)}`}>
                                                    {getComplianceLabel(visit.complianceStatus)}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {visit.status === 'complete' ? (
                                                <Link
                                                    to={`/datacapture-management/subjects/${subjectId}/visits/${visit.id}`}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    View
                                                </Link>
                                            ) : visit.status === 'incomplete' ? (
                                                <Link
                                                    to={`/datacapture-management/subjects/${subjectId}/visits/${visit.id}`}
                                                    className="text-yellow-600 hover:text-yellow-800 font-medium"
                                                >
                                                    Continue Visit
                                                </Link>
                                            ) : (
                                                <button
                                                    onClick={async () => {
                                                        console.log('Starting visit:', visit.id);
                                                        // Call API to update visit status
                                                        const result = await startVisit(visit.id, 1); // TODO: Get real user ID
                                                        if (result.success) {
                                                            console.log('Visit started successfully, navigating...');
                                                            // Navigate to visit details
                                                            navigate(`/datacapture-management/subjects/${subjectId}/visits/${visit.id}`);
                                                        } else {
                                                            console.error('Failed to start visit:', result.error);
                                                            alert('Failed to start visit. Please try again.');
                                                        }
                                                    }}
                                                    className="text-green-600 hover:text-green-800 font-medium hover:underline"
                                                >
                                                    Start Visit
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center py-4 bg-gray-50 border border-gray-200 rounded-md">
                        <p className="text-gray-500">No visits scheduled for this subject.</p>
                    </div>
                )}
            </div>

            {/* Status Change Modal */}
            {showStatusModal && (
                <StatusChangeModal
                    isOpen={showStatusModal}
                    onClose={() => setShowStatusModal(false)}
                    patientId={subject.id}
                    patientName={`${subject.firstName || ''} ${subject.lastName || ''}`.trim() || subject.subjectId}
                    currentStatus={subject.status?.toUpperCase() || 'REGISTERED'}
                    onStatusChanged={handleStatusChanged}
                />
            )}

            {/* Status History Modal */}
            {showHistory && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowHistory(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        Status History - {subject.subjectId}
                                    </h3>
                                    <button
                                        onClick={() => setShowHistory(false)}
                                        className="text-gray-400 hover:text-gray-500"
                                    >
                                        <span className="sr-only">Close</span>
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="mt-4">
                                    <StatusHistoryTimeline
                                        patientId={subject.id}
                                        onClose={() => setShowHistory(false)}
                                    />
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={() => setShowHistory(false)}
                                    className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Unscheduled Visit Modal */}
            {showVisitModal && subject && (
                <UnscheduledVisitModal
                    isOpen={showVisitModal}
                    onClose={() => setShowVisitModal(false)}
                    patientId={subject.id}
                    patientName={`${subject.firstName || ''} ${subject.lastName || ''}`.trim() || subject.subjectId}
                    studyId={subject.studyId}
                    siteId={subject.siteId || 1}
                    visitType={visitType}
                    onVisitCreated={handleVisitCreated}
                />
            )}
        </div>
    );
}