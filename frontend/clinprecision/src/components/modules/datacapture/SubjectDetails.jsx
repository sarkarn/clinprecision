import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getSubjectById, updateSubjectStatus } from '../../../services/SubjectService';
import { getPatientVisits } from '../../../services/VisitService';
import PatientStatusBadge from '../subjectmanagement/components/PatientStatusBadge';
import StatusChangeModal from '../subjectmanagement/components/StatusChangeModal';
import StatusHistoryTimeline from '../subjectmanagement/components/StatusHistoryTimeline';
import UnscheduledVisitModal from '../subjectmanagement/components/UnscheduledVisitModal';

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
            // Refresh subject data if no visit creation
            fetchSubjectDetails();
        }
    };

    const fetchVisits = async () => {
        if (!subject?.id) return;

        setVisitsLoading(true);
        try {
            console.log('[SUBJECT DETAILS] Fetching visits for patient:', subject.id);
            const visitsData = await getPatientVisits(subject.id);
            console.log('[SUBJECT DETAILS] Visits loaded:', visitsData);
            setVisits(visitsData || []);
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
                        Study
                    </label>
                    <div className="bg-gray-50 border border-gray-300 rounded-md p-2">
                        {subject.studyName || `Study ID: ${subject.studyId}`}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Study Arm
                    </label>
                    <div className="bg-gray-50 border border-gray-300 rounded-md p-2">
                        {subject.armName || 'Not Assigned'}
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
                    <Link
                        to={`/datacapture-management/subjects/${subjectId}/visits`}
                        className="text-blue-600 hover:underline text-sm"
                    >
                        View All Visits
                    </Link>
                </div>

                {visitsLoading ? (
                    <div className="text-center py-4 bg-gray-50 border border-gray-200 rounded-md">
                        <p className="text-gray-500">Loading visits...</p>
                    </div>
                ) : visits && visits.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-md">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visit Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {visits.map(visit => (
                                <tr key={visit.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">{visit.visitName}</td>
                                    <td className="px-4 py-3">{new Date(visit.visitDate).toLocaleDateString()}</td>
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
                                        <Link to={`/datacapture-management/subjects/${subjectId}/visits/${visit.id}`} className="text-blue-600 hover:text-blue-800">
                                            View Details
                                        </Link>
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