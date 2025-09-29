// SubjectList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getStudies } from '../../../services/StudyService';
import { getSubjectsByStudy } from '../../../services/SubjectService';

export default function SubjectList() {
    const [studies, setStudies] = useState([]);
    const [selectedStudy, setSelectedStudy] = useState('');
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudies = async () => {
            try {
                const studiesData = await getStudies();
                setStudies(studiesData);
                if (studiesData.length > 0) {
                    setSelectedStudy(studiesData[0].id);
                }
            } catch (error) {
                console.error('Error fetching studies:', error);
            }
        };

        fetchStudies();
    }, []);

    useEffect(() => {
        if (!selectedStudy) return;

        const fetchSubjects = async () => {
            setLoading(true);
            try {
                const subjectsData = await getSubjectsByStudy(selectedStudy);
                setSubjects(subjectsData);
            } catch (error) {
                console.error('Error fetching subjects:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubjects();
    }, [selectedStudy]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Subject Management</h3>
                <button
                    onClick={() => navigate('/datacapture-management/enroll')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    + Enroll New Subject
                </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Study
                </label>
                <select
                    value={selectedStudy}
                    onChange={(e) => setSelectedStudy(e.target.value)}
                    className="border border-gray-300 rounded-md w-full px-3 py-2 mb-4"
                >
                    {studies.map(study => (
                        <option key={study.id} value={study.id}>{study.name}</option>
                    ))}
                </select>

                {loading ? (
                    <div className="text-center py-4">Loading subjects...</div>
                ) : subjects.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                        No subjects enrolled in this study yet.
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollment Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Study Arm</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {subjects.map(subject => (
                                <tr key={subject.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{subject.subjectId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {subject.firstName && subject.lastName ?
                                            `${subject.firstName} ${subject.lastName}` :
                                            'N/A'
                                        }
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${subject.status === 'Active' || subject.status === 'Enrolled' ? 'bg-green-100 text-green-800' :
                                                subject.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                                    subject.status === 'Withdrawn' ? 'bg-red-100 text-red-800' :
                                                        subject.status === 'Screening' ? 'bg-yellow-100 text-yellow-800' :
                                                            subject.status === 'Screen Failed' ? 'bg-red-100 text-red-800' :
                                                                'bg-gray-100 text-gray-800'}`}>
                                            {subject.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(subject.enrollmentDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{subject.armName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link to={`/datacapture-management/subjects/${subject.id}`} className="text-indigo-600 hover:text-indigo-900 mr-3">
                                            View Details
                                        </Link>
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