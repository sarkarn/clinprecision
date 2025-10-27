import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSubjectById } from '../../../services/SubjectService';

// Interface definitions
interface Visit {
    id: number;
    visitName: string;
    timepoint: number;
    visitDate?: string;
    status: 'complete' | 'incomplete' | 'not_started' | 'scheduled' | 'missed';
}

interface Subject {
    subjectId: string;
    studyName?: string;
    armName?: string;
    visits?: Visit[];
}

const VisitList: React.FC = () => {
    const { subjectId } = useParams<{ subjectId: string }>();
    const [subject, setSubject] = useState<Subject | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSubjectData = async () => {
            setLoading(true);
            try {
                const subjectData = await getSubjectById(subjectId!) as any;
                setSubject(subjectData);
            } catch (error) {
                console.error('Error fetching subject data:', error);
                setError('Failed to load subject information.');
            } finally {
                setLoading(false);
            }
        };

        fetchSubjectData();
    }, [subjectId]);

    const getStatusBadgeClass = (status: string): string => {
        switch (status) {
            case 'complete':
                return 'bg-green-100 text-green-800';
            case 'incomplete':
                return 'bg-yellow-100 text-yellow-800';
            case 'not_started':
            case 'scheduled':
                return 'bg-gray-100 text-gray-800';
            case 'missed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string): string => {
        switch (status) {
            case 'complete':
                return 'Complete';
            case 'incomplete':
                return 'In Progress';
            case 'not_started':
                return 'Not Started';
            case 'scheduled':
                return 'Scheduled';
            case 'missed':
                return 'Missed';
            default:
                return 'Unknown';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading visits...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p>{error}</p>
                <button
                    onClick={() => navigate('/datacapture-management')}
                    className="mt-2 text-sm underline"
                >
                    Return to subject list
                </button>
            </div>
        );
    }

    if (!subject) {
        return (
            <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                <p>Subject not found.</p>
                <button
                    onClick={() => navigate('/datacapture-management')}
                    className="mt-2 text-sm underline"
                >
                    Return to subject list
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-6">
                <Link
                    to={`/datacapture-management/subjects/${subjectId}`}
                    className="text-blue-600 hover:underline"
                >
                    &larr; Back to Subject Details
                </Link>
                <h3 className="text-xl font-bold mt-2">
                    Visits for Subject {subject.subjectId}
                </h3>
                <div className="flex items-center mt-1">
                    <span className="text-gray-500">Study: </span>
                    <span className="ml-1 font-medium">{subject.studyName || 'Unknown Study'}</span>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="text-gray-500">Arm: </span>
                    <span className="ml-1 font-medium">{subject.armName || 'Unknown Arm'}</span>
                </div>
            </div>

            {!subject.visits || subject.visits.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
                    <p className="text-gray-500">No visits scheduled for this subject yet.</p>
                </div>
            ) : (
                <div className="overflow-hidden border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Visit Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Timepoint
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Scheduled Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {subject.visits.map((visit: Visit) => (
                                <tr key={visit.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                                        {visit.visitName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {visit.timepoint >= 0 ? `Day ${visit.timepoint}` : `Day ${Math.abs(visit.timepoint)} (Pre-baseline)`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {visit.visitDate ? new Date(visit.visitDate).toLocaleDateString() : 'Not scheduled'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(visit.status)}`}>
                                            {getStatusLabel(visit.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <Link
                                            to={`/datacapture-management/subjects/${subjectId}/visits/${visit.id}`}
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                        >
                                            View Details
                                        </Link>
                                        {visit.status === 'not_started' && (
                                            <button
                                                onClick={() => navigate(`/datacapture-management/subjects/${subjectId}/visits/${visit.id}`)}
                                                className="text-green-600 hover:text-green-900"
                                            >
                                                Start Visit
                                            </button>
                                        )}
                                        {visit.status === 'incomplete' && (
                                            <button
                                                onClick={() => navigate(`/datacapture-management/subjects/${subjectId}/visits/${visit.id}`)}
                                                className="text-yellow-600 hover:text-yellow-900"
                                            >
                                                Continue
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="mt-6">
                <h4 className="font-medium mb-3">Visit Schedule Overview</h4>
                <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex flex-wrap gap-2">
                        {subject.visits && subject.visits.map((visit: Visit) => (
                            <div
                                key={visit.id}
                                className={`px-3 py-2 rounded-md border ${visit.status === 'complete' ? 'bg-green-50 border-green-200' :
                                        visit.status === 'incomplete' ? 'bg-yellow-50 border-yellow-200' :
                                            visit.status === 'missed' ? 'bg-red-50 border-red-200' :
                                                'bg-gray-50 border-gray-200'
                                    }`}
                            >
                                <div className="text-sm font-medium">{visit.visitName}</div>
                                <div className="text-xs text-gray-500">
                                    Day {visit.timepoint}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VisitList;
