/**
 * SubjectEdit Component
 * 
 * Edit Subject/Patient Information
 * Handles demographic and enrollment data updates
 * 
 * Updated: October 2025
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getSubjectById } from '../../../services/SubjectService';
import ApiService from '../../../services/ApiService';
import { getStudies } from '../../../services/StudyService';

interface Study {
    id: number;
    title?: string;
    name?: string;
    status?: string;
}

interface StudyArm {
    id: number;
    name: string;
}

interface StudySite {
    id: number;
    siteId?: number;
    siteName?: string;
    status?: string;
}

interface Subject {
    id: number;
    subjectId: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    gender?: string;
    studyId?: number;
    armId?: number;
    treatmentArmId?: number;
    siteId?: number;
    enrollmentDate?: string;
    enrollmentId?: number;
}

interface FormData {
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    gender: string;
    studyId: string;
    armId: string;
    siteId: string;
    subjectId: string;
    enrollmentDate: string;
}

const SubjectEdit: React.FC = () => {
    const { subjectId } = useParams<{ subjectId: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    // Detect which module we're in based on the current path
    const isSubjectManagementModule = location.pathname.startsWith('/subject-management');
    const basePath = isSubjectManagementModule ? '/subject-management' : '/datacapture-management';

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [subject, setSubject] = useState<Subject | null>(null);
    const [studies, setStudies] = useState<Study[]>([]);
    const [studyArms, setStudyArms] = useState<StudyArm[]>([]);
    const [studySites, setStudySites] = useState<StudySite[]>([]);

    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        dateOfBirth: '',
        gender: '',
        studyId: '',
        armId: '',
        siteId: '',
        subjectId: '',
        enrollmentDate: ''
    });

    useEffect(() => {
        fetchSubjectDetails();
        fetchStudies();
    }, [subjectId]);

    useEffect(() => {
        if (formData.studyId) {
            fetchStudyArms(formData.studyId);
            fetchStudySites(formData.studyId);
        } else {
            // Clear arms and sites if no study selected
            setStudyArms([]);
            setStudySites([]);
        }
    }, [formData.studyId]);

    const fetchSubjectDetails = async () => {
        try {
            setLoading(true);
            const subjectData = await getSubjectById(subjectId!) as any;
            setSubject(subjectData);

            console.log('Loaded subject data:', subjectData);
            console.log('Subject gender from API:', subjectData.gender);

            // Populate form with existing data
            setFormData({
                firstName: subjectData.firstName || '',
                middleName: subjectData.middleName || '',
                lastName: subjectData.lastName || '',
                email: subjectData.email || '',
                phoneNumber: subjectData.phone || subjectData.phoneNumber || '',
                dateOfBirth: subjectData.dateOfBirth || '',
                gender: subjectData.gender || '',
                studyId: subjectData.studyId || '',
                armId: subjectData.armId || subjectData.treatmentArmId || '',
                siteId: subjectData.siteId || '',
                subjectId: subjectData.subjectId || '',
                enrollmentDate: subjectData.enrollmentDate || ''
            });

            console.log('Form data after setting gender:', subjectData.gender);
        } catch (error) {
            console.error('Error fetching subject details:', error);
            setError('Failed to load subject details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchStudies = async () => {
        try {
            const studiesData = await getStudies() as any;
            // Filter for studies that are published/approved/active
            const filteredStudies = studiesData.filter((study: Study) => {
                const status = study.status?.toUpperCase();
                return status === 'PUBLISHED' || status === 'APPROVED' || status === 'ACTIVE';
            });
            setStudies(filteredStudies);
        } catch (error) {
            console.error('Error fetching studies:', error);
        }
    };

    const fetchStudyArms = async (studyId: string) => {
        try {
            const response = await ApiService.get(`/study-ws/api/v1/studies/${studyId}/arms`) as any;
            setStudyArms(response.data || []);
        } catch (error) {
            console.error('Error fetching study arms:', error);
            setStudyArms([]);
        }
    };

    const fetchStudySites = async (studyId: string) => {
        try {
            // Updated to use clinops-ws endpoint that now exists
            const response = await ApiService.get(`/clinops-ws/api/v1/patients/site-studies/study/${studyId}`) as any;
            const activeSites = (response.data || []).filter((ss: StudySite) => ss.status === 'ACTIVE');
            setStudySites(activeSites);
        } catch (error) {
            console.error('Error fetching study sites:', error);
            setStudySites([]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        console.log(`Field changed: ${name} = ${value}`);

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // If study changed, reset arm and site
        if (name === 'studyId') {
            setFormData(prev => ({
                ...prev,
                studyId: value,
                armId: '',
                siteId: ''
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSaving(true);

        try {
            // Validate required fields
            if (!formData.firstName || !formData.lastName) {
                throw new Error('First name and last name are required.');
            }

            if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                throw new Error('Please enter a valid email address.');
            }

            // Update patient demographic information
            const patientUpdateData = {
                firstName: formData.firstName,
                middleName: formData.middleName || null,
                lastName: formData.lastName,
                email: formData.email || null,
                phoneNumber: formData.phoneNumber || null,
                dateOfBirth: formData.dateOfBirth || null,
                gender: formData.gender || null
            };

            console.log('Updating patient with data:', patientUpdateData);
            await ApiService.put(`/clinops-ws/api/v1/patients/${subject!.id}`, patientUpdateData as any) as any;

            // Update enrollment information if study/arm/site changed
            if (subject!.enrollmentId && (
                formData.studyId !== subject!.studyId?.toString() ||
                formData.armId !== subject!.armId?.toString() ||
                formData.siteId !== subject!.siteId?.toString()
            )) {
                const enrollmentUpdateData = {
                    studyId: parseInt(formData.studyId),
                    siteId: parseInt(formData.siteId),
                    treatmentArmId: formData.armId ? parseInt(formData.armId) : null,
                    screeningNumber: formData.subjectId
                };

                console.log('Updating enrollment with data:', enrollmentUpdateData);
                await ApiService.put(`/clinops-ws/api/v1/patient-enrollment/${subject!.enrollmentId}`, enrollmentUpdateData as any) as any;
            }

            setSuccess(true);

            // Redirect after a brief delay
            setTimeout(() => {
                navigate(`${basePath}/subjects/${subjectId}`);
            }, 1500);

        } catch (error: any) {
            console.error('Error updating subject:', error);
            setError(error.message || 'Failed to update subject. Please try again.');
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white shadow rounded-lg p-6">
                <div className="text-center py-8">
                    <svg className="animate-spin h-8 w-8 mx-auto text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-2 text-gray-600">Loading subject details...</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="bg-white shadow rounded-lg p-6">
                <div className="text-center py-8">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Subject Updated Successfully!</h3>
                    <p className="text-gray-600">Redirecting to subject details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-6">
                <button
                    onClick={() => navigate(`${basePath}/subjects/${subjectId}`)}
                    className="text-blue-600 hover:underline mb-4"
                >
                    &larr; Back to Subject Details
                </button>
                <h3 className="text-2xl font-bold text-gray-900">Edit Subject: {subject?.subjectId}</h3>
                <p className="text-gray-600 mt-1">Update subject demographic and enrollment information</p>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {/* Debug Info - Remove after testing */}
            <div className="bg-gray-100 border border-gray-300 px-4 py-3 rounded mb-6 text-sm">
                <strong>Debug Info:</strong> Current Gender Value = "{formData.gender}"
                {subject && <span className="ml-4">| Original Gender = "{subject.gender}"</span>}
            </div>

            <form onSubmit={handleSubmit}>
                {/* Personal Information Section */}
                <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        Personal Information
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                First Name*
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter first name"
                                required
                                disabled={saving}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Middle Name
                            </label>
                            <input
                                type="text"
                                name="middleName"
                                value={formData.middleName}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter middle name"
                                disabled={saving}
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
                                className="border border-gray-300 rounded-md w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter last name"
                                required
                                disabled={saving}
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
                                className="border border-gray-300 rounded-md w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="subject@example.com"
                                disabled={saving}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="+1-555-0100"
                                disabled={saving}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date of Birth
                            </label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={saving}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Gender
                            </label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={saving}
                            >
                                <option value="">Select Gender</option>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                                <option value="PREFER_NOT_TO_SAY">Prefer Not to Say</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Study Enrollment Section */}
                <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        Study Enrollment
                    </h4>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start">
                            <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-blue-900">Note about enrollment changes</p>
                                <p className="text-sm text-blue-700 mt-1">
                                    Changing study or site will update the enrollment record. Ensure you have proper authorization before making these changes.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Screening Number
                            </label>
                            <input
                                type="text"
                                name="subjectId"
                                value={formData.subjectId}
                                onChange={handleChange}
                                className="border border-gray-300 bg-gray-50 rounded-md w-full px-3 py-2 cursor-not-allowed"
                                disabled
                                title="Screening number cannot be changed"
                            />
                            <p className="text-xs text-gray-500 mt-1">Cannot be modified after enrollment</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Study
                            </label>
                            <select
                                name="studyId"
                                value={formData.studyId}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={saving}
                            >
                                <option value="">Select Study</option>
                                {studies.map(study => (
                                    <option key={study.id} value={study.id}>
                                        {study.title || study.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Treatment Arm field removed for EDC blinding compliance */}
                        {/* See: EDC_BLINDING_ARCHITECTURE_DECISION.md */}
                        {/* Randomization handled by external IWRS/RTSM system */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Treatment Arm
                            </label>
                            <input
                                type="text"
                                value="BLINDED"
                                disabled
                                className="border border-gray-300 rounded-md w-full px-3 py-2 bg-gray-50 text-gray-400 cursor-not-allowed"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Treatment assignments are managed by external IWRS/RTSM system to maintain study blinding
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Site
                            </label>
                            <select
                                name="siteId"
                                value={formData.siteId}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={saving || !formData.studyId}
                            >
                                <option value="">Select Site</option>
                                {studySites.map(site => (
                                    <option key={site.id} value={site.id}>
                                        {site.siteName || `Site ${site.siteId}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Enrollment Date
                            </label>
                            <input
                                type="date"
                                name="enrollmentDate"
                                value={formData.enrollmentDate}
                                onChange={handleChange}
                                className="border border-gray-300 bg-gray-50 rounded-md w-full px-3 py-2 cursor-not-allowed"
                                disabled
                                title="Enrollment date cannot be changed"
                            />
                            <p className="text-xs text-gray-500 mt-1">Cannot be modified after enrollment</p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={() => navigate(`${basePath}/subjects/${subjectId}`)}
                        className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving Changes...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SubjectEdit;
