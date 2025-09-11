import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { getStudies } from '../../../services/StudyService'; // Commented out to use mock data

const StudyList = () => {
    const [studies, setStudies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudies = async () => {
            try {
                // Mock data instead of API call
                const mockStudies = [
                    {
                        id: 'STD-001',
                        name: 'Phase III Oncology Trial - Advanced NSCLC',
                        phase: 'Phase III',
                        status: 'Active',
                        startDate: '2024-01-15',
                        endDate: '2026-03-30'
                    },
                    {
                        id: 'STD-002',
                        name: 'Cardiovascular Prevention Study',
                        phase: 'Phase II',
                        status: 'Recruiting',
                        startDate: '2024-02-01',
                        endDate: '2025-12-31'
                    },
                    {
                        id: 'STD-003',
                        name: 'Neurological Disorder Treatment Protocol',
                        phase: 'Phase I',
                        status: 'On Hold',
                        startDate: '2024-06-01',
                        endDate: '2025-06-30'
                    },
                    {
                        id: 'STD-004',
                        name: 'Diabetes Management Study',
                        phase: 'Phase II',
                        status: 'Completed',
                        startDate: '2023-03-01',
                        endDate: '2024-01-15'
                    },
                    {
                        id: 'STD-005',
                        name: 'Pediatric Vaccine Trial',
                        phase: 'Phase I',
                        status: 'Active',
                        startDate: '2024-04-15',
                        endDate: '2025-04-14'
                    }
                ];

                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 1000));

                setStudies(mockStudies);
                setLoading(false);
            } catch (err) {
                setError('Failed to load studies');
                setLoading(false);
                console.error(err);
            }
        };

        fetchStudies();
    }, []);

    const handleViewStudy = (studyId) => {
        navigate(`/study-design/view/${studyId}`);
    };

    const handleEditStudy = (studyId) => {
        navigate(`/study-design/edit/${studyId}`);
    };

    if (loading) return (
        <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading studies...</span>
        </div>
    );

    if (error) return (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error Loading Studies</h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900">Legacy Study List</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Traditional tabular view of all clinical studies
                    </p>
                </div>
                <button
                    onClick={() => navigate('/study-design/create')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                    + New Study
                </button>
            </div>

            {studies.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No studies found</h3>
                    <p className="text-gray-500 mb-4">Get started by creating your first clinical study.</p>
                    <button
                        onClick={() => navigate('/study-design/create')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Create Study
                    </button>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Study ID</th>
                                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Study Name</th>
                                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phase</th>
                                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {studies.map((study) => (
                                <tr key={study.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{study.id}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        <div className="font-medium">{study.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                            {study.phase}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${study.status === 'Active' ? 'bg-green-100 text-green-800' :
                                                study.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                                    study.status === 'Recruiting' ? 'bg-purple-100 text-purple-800' :
                                                        study.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'}`}>
                                            {study.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(study.startDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(study.endDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleViewStudy(study.id)}
                                                className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded transition-colors"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleEditStudy(study.id)}
                                                className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors">
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default StudyList;