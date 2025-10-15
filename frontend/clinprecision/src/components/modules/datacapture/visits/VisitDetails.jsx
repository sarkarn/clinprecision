// VisitDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getVisitDetails } from '../../../../services/DataEntryService';

export default function VisitDetails() {
    const { subjectId, visitId } = useParams();
    const [visitDetails, setVisitDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchVisitDetails = async () => {
            setLoading(true);
            try {
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
                    <p className="text-gray-500">No forms assigned to this visit.</p>
                ) : (
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
                )}
            </div>
        </div>
    );
}