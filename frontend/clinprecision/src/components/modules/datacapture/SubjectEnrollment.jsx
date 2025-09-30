// SubjectEnrollment.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudies, getStudyById } from '../../../services/StudyService';
import { enrollSubject } from '../../../services/SubjectService';

export default function SubjectEnrollment() {
    const [studies, setStudies] = useState([]);
    const [selectedStudy, setSelectedStudy] = useState('');
    const [studyArms, setStudyArms] = useState([]);
    const [formData, setFormData] = useState({
        subjectId: '',
        studyId: '',
        armId: '',
        enrollmentDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudies = async () => {
            try {
                const studiesData = await getStudies();
                setStudies(studiesData);
            } catch (error) {
                console.error('Error fetching studies:', error);
                setError('Failed to load studies.');
            }
        };

        fetchStudies();
    }, []);

    useEffect(() => {
        if (!selectedStudy) return;

        const fetchStudyDetails = async () => {
            try {
                const studyData = await getStudyById(selectedStudy);
                setStudyArms(studyData.arms || []);
                setFormData(prev => ({
                    ...prev,
                    studyId: selectedStudy,
                    armId: studyData.arms?.length > 0 ? studyData.arms[0].id : ''
                }));
            } catch (error) {
                console.error('Error fetching study details:', error);
                setError('Failed to load study details.');
            }
        };

        fetchStudyDetails();
    }, [selectedStudy]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'studyId') {
            setSelectedStudy(value);
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validate form
            if (!formData.subjectId || !formData.studyId || !formData.armId || !formData.firstName || !formData.lastName) {
                throw new Error('Please fill all required fields.');
            }

            // Validate email format if provided
            if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                throw new Error('Please enter a valid email address.');
            }

            // Enroll subject
            const result = await enrollSubject(formData);
            console.log('Subject enrolled successfully:', result);
            navigate(`/subject-management/subjects/${result.id}`);
        } catch (error) {
            console.error('Error enrolling subject:', error);
            setError(error.message || 'Failed to enroll subject.');
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Enroll New Subject</h3>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subject ID*
                        </label>
                        <input
                            type="text"
                            name="subjectId"
                            value={formData.subjectId}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md w-full px-3 py-2"
                            placeholder="e.g., SUBJ-001"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name*
                        </label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md w-full px-3 py-2"
                            placeholder="Enter first name"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name*
                        </label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md w-full px-3 py-2"
                            placeholder="Enter last name"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md w-full px-3 py-2"
                            placeholder="subject@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md w-full px-3 py-2"
                            placeholder="+1-555-123-4567"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Study*
                        </label>
                        <select
                            name="studyId"
                            value={formData.studyId}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md w-full px-3 py-2"
                            required
                        >
                            <option value="">Select a study</option>
                            {studies.map(study => (
                                <option key={study.id} value={study.id}>{study.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Study Arm*
                        </label>
                        <select
                            name="armId"
                            value={formData.armId}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md w-full px-3 py-2"
                            required
                            disabled={studyArms.length === 0}
                        >
                            <option value="">Select an arm</option>
                            {studyArms.map(arm => (
                                <option key={arm.id} value={arm.id}>{arm.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Enrollment Date*
                        </label>
                        <input
                            type="date"
                            name="enrollmentDate"
                            value={formData.enrollmentDate}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md w-full px-3 py-2"
                            required
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => navigate('/subject-management')}
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                        disabled={loading}
                    >
                        {loading ? 'Enrolling...' : 'Enroll Subject'}
                    </button>
                </div>
            </form>
        </div>
    );
}