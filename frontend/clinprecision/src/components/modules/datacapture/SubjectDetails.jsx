import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getSubjectById, updateSubjectStatus } from '../../../services/SubjectService';

export default function SubjectDetails() {
    const { subjectId } = useParams();
    const [subject, setSubject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSubjectDetails = async () => {
            setLoading(true);
            try {
                const subjectData = await getSubjectById(subjectId);
                setSubject(subjectData);
            } catch (error) {
                console.error('Error fetching subject details:', error);
                setError('Failed to load subject details. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchSubjectDetails();
    }, [subjectId]);

    const handleStatusChange = async (newStatus) => {
        if (!window.confirm(`Are you sure you want to change the subject status to ${newStatus}?`)) {
            return;
        }

        setStatusUpdateLoading(true);
        try {
            const updatedSubject = await updateSubjectStatus(subjectId, newStatus);
            setSubject(updatedSubject);
        } catch (error) {
            console.error('Error updating subject status:', error);
            alert('Failed to update subject status. Please try again.');
        } finally {
            setStatusUpdateLoading(false);
        }
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
                <div className="flex justify-between items-center mt-2">
                    <h3 className="text-xl font-bold">Subject Details: {subject.subjectId}</h3>
                    <div className="flex items-center">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full mr-2 
              ${subject.status === 'Active' ? 'bg-green-100 text-green-800' :
                                subject.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                    subject.status === 'Withdrawn' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'}`}>
                            {subject.status}
                        </span>
                        <div className="relative">
                            <button
                                className="border border-gray-300 rounded-md px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                                onClick={() => document.getElementById('statusMenu').classList.toggle('hidden')}
                                disabled={statusUpdateLoading}
                            >
                                {statusUpdateLoading ? 'Updating...' : 'Change Status'}
                            </button>
                            <div id="statusMenu" className="hidden absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                <div className="py-1" role="menu" aria-orientation="vertical">
                                    {['Active', 'Screening', 'Screen Failed', 'Completed', 'Withdrawn'].map(status => (
                                        <button
                                            key={status}
                                            className={`block w-full text-left px-4 py-2 text-sm ${status === subject.status ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'}`}
                                            onClick={() => {
                                                document.getElementById('statusMenu').classList.add('hidden');
                                                if (status !== subject.status) handleStatusChange(status);
                                            }}
                                            disabled={status === subject.status}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
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

                {subject.visits && subject.visits.length > 0 ? (
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
                            {subject.visits.map(visit => (
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
        </div>
    );
}