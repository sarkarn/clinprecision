import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStudyById } from '../../../services/StudyService';

const StudyViewPage = () => {
    const { studyId } = useParams();
    const [study, setStudy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('details');

    useEffect(() => {
        const fetchStudy = async () => {
            try {
                const studyData = await getStudyById(studyId);
                setStudy(studyData);
                setLoading(false);
            } catch (err) {
                setError('Failed to load study');
                setLoading(false);
                console.error(err);
            }
        };

        if (studyId) {
            fetchStudy();
        }
    }, [studyId]);

    if (loading) return <div className="text-center py-4">Loading study...</div>;
    if (error) return <div className="text-red-500 py-4">{error}</div>;
    if (!study) return <div className="text-center py-4">Study not found</div>;

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-6">
                <Link to="/study-design/studies" className="text-blue-600 hover:underline">
                    &larr; Back to Studies
                </Link>
                <h2 className="text-2xl font-bold mt-2">View Study: {study.name}</h2>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="flex -mb-px">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'details'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Study Details
                    </button>
                    <button
                        onClick={() => setActiveTab('arms')}
                        className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'arms'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Study Arms & Visits
                    </button>
                </nav>
            </div>

            {/* Study Details Tab */}
            {activeTab === 'details' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Study ID
                        </label>
                        <div className="bg-gray-50 border border-gray-300 rounded-md w-full p-2 text-gray-700">
                            {study.id}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Study Name
                        </label>
                        <div className="bg-gray-50 border border-gray-300 rounded-md w-full p-2 text-gray-700">
                            {study.name}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phase
                        </label>
                        <div className="bg-gray-50 border border-gray-300 rounded-md w-full p-2 text-gray-700">
                            {study.phase}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <div className="bg-gray-50 border border-gray-300 rounded-md w-full p-2 text-gray-700">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${study.status === 'Active' ? 'bg-green-100 text-green-800' :
                                    study.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                        study.status === 'Recruiting' ? 'bg-purple-100 text-purple-800' :
                                            study.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'}`}>
                                {study.status}
                            </span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                        </label>
                        <div className="bg-gray-50 border border-gray-300 rounded-md w-full p-2 text-gray-700">
                            {study.startDate}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date
                        </label>
                        <div className="bg-gray-50 border border-gray-300 rounded-md w-full p-2 text-gray-700">
                            {study.endDate}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sponsor
                        </label>
                        <div className="bg-gray-50 border border-gray-300 rounded-md w-full p-2 text-gray-700">
                            {study.sponsor}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Principal Investigator
                        </label>
                        <div className="bg-gray-50 border border-gray-300 rounded-md w-full p-2 text-gray-700">
                            {study.investigator}
                        </div>
                    </div>
                </div>
            )}

            {/* Study Arms & Visits Tab */}
            {activeTab === 'arms' && (
                <div>
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold">Study Arms</h3>
                    </div>

                    {!study.arms || study.arms.length === 0 ? (
                        <p className="text-gray-500">No arms defined for this study.</p>
                    ) : (
                        <div className="space-y-6">
                            {study.arms.map((arm) => (
                                <div key={arm.id} className="border rounded-lg p-4">
                                    {/* Arm Header */}
                                    <div className="flex justify-between items-center mb-4 bg-gray-50 p-3 rounded">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4">
                                                <div className="font-medium text-gray-800">{arm.name}</div>
                                                <div className="text-gray-600">{arm.description || 'No description'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Visits Section */}
                                    <div className="pl-4 mb-4">
                                        <div className="mb-2">
                                            <h4 className="font-medium text-blue-600">Visits</h4>
                                        </div>

                                        {!arm.visits || arm.visits.length === 0 ? (
                                            <p className="text-gray-500 text-sm ml-4">No visits defined for this arm.</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {arm.visits.map((visit) => (
                                                    <div key={visit.id} className="border-l-2 border-blue-300 pl-4 ml-2">
                                                        {/* Visit Header */}
                                                        <div className="bg-blue-50 p-2 rounded mb-2">
                                                            <div className="flex items-center gap-4">
                                                                <div className="font-medium">{visit.name}</div>
                                                                <div>Day {visit.timepoint}</div>
                                                                <div className="text-gray-600">{visit.description || 'No description'}</div>
                                                            </div>
                                                        </div>

                                                        {/* CRFs Section */}
                                                        <div className="pl-4">
                                                            {!visit.crfs || visit.crfs.length === 0 ? (
                                                                <p className="text-gray-500 text-sm ml-4">No CRFs assigned to this visit.</p>
                                                            ) : (
                                                                <div className="ml-2">
                                                                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded">
                                                                        <thead className="bg-gray-50">
                                                                            <tr>
                                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                    CRF Name
                                                                                </th>
                                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                    Type
                                                                                </th>
                                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                    Description
                                                                                </th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                                            {visit.crfs.map((crf) => (
                                                                                <tr key={crf.id} className="hover:bg-gray-50">
                                                                                    <td className="px-4 py-2 text-gray-700">
                                                                                        {crf.name}
                                                                                    </td>
                                                                                    <td className="px-4 py-2 text-gray-700">
                                                                                        {crf.type}
                                                                                    </td>
                                                                                    <td className="px-4 py-2 text-gray-700">
                                                                                        {crf.description || 'No description'}
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StudyViewPage;