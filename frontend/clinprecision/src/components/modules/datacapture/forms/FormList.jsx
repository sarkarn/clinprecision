import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getVisitDetails } from '../../../../services/data-capture/DataEntryService';

export default function FormList() {
    const { subjectId, visitId } = useParams();
    const [visitDetails, setVisitDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchVisitDetails = async () => {
            setLoading(true);
            try {
                const details = await getVisitDetails(subjectId, visitId);
                setVisitDetails(details);
            } catch (error) {
                console.error('Error fetching visit details:', error);
                setError('Failed to load forms. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchVisitDetails();
    }, [subjectId, visitId]);

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'complete':
                return 'bg-green-100 text-green-800';
            case 'incomplete':
                return 'bg-yellow-100 text-yellow-800';
            case 'not_started':
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
            default:
                return 'Not Started';
        }
    };

    const getCompletionPercentage = () => {
        if (!visitDetails?.forms || visitDetails.forms.length === 0) {
            return 0;
        }

        const completedForms = visitDetails.forms.filter(form => form.status === 'complete').length;
        return Math.round((completedForms / visitDetails.forms.length) * 100);
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <svg className="animate-spin h-8 w-8 mx-auto text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-2">Loading forms...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>{error}</p>
                <button
                    onClick={() => navigate(`/datacapture-management/subjects/${subjectId}`)}
                    className="mt-3 text-blue-600 hover:underline"
                >
                    Return to Subject Details
                </button>
            </div>
        );
    }

    if (!visitDetails) {
        return (
            <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-gray-700">Visit not found</p>
                <button
                    onClick={() => navigate(`/datacapture-management/subjects/${subjectId}`)}
                    className="mt-3 text-blue-600 hover:underline"
                >
                    Return to Subject Details
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-6">
                <Link to={`/datacapture-management/subjects/${subjectId}`} className="text-blue-600 hover:underline">
                    &larr; Back to Subject
                </Link>
                <h3 className="text-xl font-bold mt-2">
                    Forms for {visitDetails.visitName} - Subject {visitDetails.subjectId}
                </h3>
                <div className="flex items-center mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-md">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${getCompletionPercentage()}%` }}
                        ></div>
                    </div>
                    <span className="text-sm text-gray-600">{getCompletionPercentage()}% Complete</span>
                </div>
            </div>

            <div className="mb-6">
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
                </div>
            </div>

            <div className="mb-6">
                <h4 className="font-medium mb-2">Available Forms</h4>

                {visitDetails.forms.length === 0 ? (
                    <div className="text-center py-4 bg-gray-50 border border-gray-200 rounded-md">
                        <p className="text-gray-500">No forms assigned to this visit.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {visitDetails.forms.map(form => (
                            <div key={form.id} className="border border-gray-200 rounded-md overflow-hidden hover:shadow-md transition-shadow">
                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                                    <h5 className="font-medium">{form.name}</h5>
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(form.status)}`}>
                                        {getStatusLabel(form.status)}
                                    </span>
                                </div>
                                <div className="p-4">
                                    {form.lastUpdated ? (
                                        <p className="text-sm text-gray-500 mb-4">
                                            Last updated: {new Date(form.lastUpdated).toLocaleString()}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-gray-500 mb-4">
                                            Not started yet
                                        </p>
                                    )}
                                    <div className="flex justify-end">
                                        {form.status === 'complete' ? (
                                            <div className="space-x-2">
                                                <Link to={`/datacapture-management/subjects/${subjectId}/visits/${visitId}/forms/${form.id}/view`} className="text-blue-600 hover:text-blue-800 font-medium">
                                                    View
                                                </Link>
                                                <Link to={`/datacapture-management/subjects/${subjectId}/visits/${visitId}/forms/${form.id}/entry`} className="text-gray-600 hover:text-gray-800">
                                                    Edit
                                                </Link>
                                            </div>
                                        ) : (
                                            <Link to={`/datacapture-management/subjects/${subjectId}/visits/${visitId}/forms/${form.id}/entry`} className="text-green-600 hover:text-green-800 font-medium">
                                                {form.status === 'incomplete' ? 'Continue' : 'Start'}
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}