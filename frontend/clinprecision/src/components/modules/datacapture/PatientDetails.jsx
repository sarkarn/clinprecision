// PatientDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PatientEnrollmentService from '../../../services/data-capture/PatientEnrollmentService';

export default function PatientDetails() {
    const { patientId } = useParams();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (patientId) {
            loadPatientDetails();
        }
    }, [patientId]);

    const loadPatientDetails = async () => {
        try {
            setLoading(true);
            console.log('[PATIENT_DETAILS] Loading patient:', patientId);

            const patientData = await PatientEnrollmentService.getPatientById(patientId);

            console.log('[PATIENT_DETAILS] Loaded patient data:', patientData);
            setPatient(patientData);
            setError(null);
        } catch (error) {
            console.error('[PATIENT_DETAILS] Error loading patient:', error);
            if (error.response && error.response.status === 404) {
                setError('Patient not found.');
            } else {
                setError('Failed to load patient details. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const formatPatient = (patientData) => {
        return PatientEnrollmentService.formatPatientForDisplay(patientData);
    };

    const getStatusBadgeClass = (status) => {
        const statusClasses = {
            REGISTERED: 'bg-blue-100 text-blue-800',
            SCREENING: 'bg-yellow-100 text-yellow-800',
            ENROLLED: 'bg-green-100 text-green-800',
            WITHDRAWN: 'bg-red-100 text-red-800',
            COMPLETED: 'bg-purple-100 text-purple-800'
        };
        return statusClasses[status] || 'bg-gray-100 text-gray-800';
    };

    const getGenderBadgeClass = (gender) => {
        const genderClasses = {
            MALE: 'bg-blue-50 text-blue-700 border border-blue-200',
            FEMALE: 'bg-pink-50 text-pink-700 border border-pink-200',
            OTHER: 'bg-gray-50 text-gray-700 border border-gray-200'
        };
        return genderClasses[gender] || 'bg-gray-50 text-gray-700 border border-gray-200';
    };

    if (loading) {
        return (
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-gray-500">Loading patient details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white shadow rounded-lg p-6">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Patient</h3>
                    <p className="text-sm text-gray-500 mb-4">{error}</p>
                    <div className="space-x-3">
                        <button
                            onClick={loadPatientDetails}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => navigate('/datacapture-management/patients')}
                            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
                        >
                            Back to Patients
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="bg-white shadow rounded-lg p-6">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900">Patient not found</h3>
                    <p className="text-sm text-gray-500 mt-2">The requested patient could not be found.</p>
                    <button
                        onClick={() => navigate('/datacapture-management/patients')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mt-4"
                    >
                        Back to Patients
                    </button>
                </div>
            </div>
        );
    }

    const formattedPatient = formatPatient(patient);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate('/datacapture-management/patients')}
                            className="mr-4 p-2 text-gray-400 hover:text-gray-600"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {formattedPatient.displayName}
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Patient ID: {patient.id} | Patient Number: {patient.patientNumber || 'Not assigned'}
                            </p>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => navigate('/datacapture-management/subjects', { state: { openEnrollment: true } })}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            title="Open enrollment wizard"
                        >
                            Enroll in Study
                        </button>
                        <button
                            onClick={() => navigate(`/datacapture-management/patients/${patient.id}/edit`)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Edit Patient
                        </button>
                    </div>
                </div>
            </div>

            {/* Patient Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Personal Information */}
                <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {formattedPatient.displayName}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {formattedPatient.displayDateOfBirth}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-sm font-medium text-gray-500">Age</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {formattedPatient.displayAge}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-sm font-medium text-gray-500">Gender</dt>
                            <dd className="mt-1">
                                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getGenderBadgeClass(patient.gender)}`}>
                                    {formattedPatient.displayGender}
                                </span>
                            </dd>
                        </div>

                        <div>
                            <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {patient.phoneNumber || (
                                    <span className="text-gray-400">Not provided</span>
                                )}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-sm font-medium text-gray-500">Email Address</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {patient.email || (
                                    <span className="text-gray-400">Not provided</span>
                                )}
                            </dd>
                        </div>
                    </div>
                </div>

                {/* Status Information */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Status Information</h2>

                    <div className="space-y-4">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Current Status</dt>
                            <dd className="mt-1">
                                <span className={`inline-flex px-3 py-1 text-sm rounded-full ${getStatusBadgeClass(patient.status)}`}>
                                    {formattedPatient.displayStatus}
                                </span>
                            </dd>
                        </div>

                        <div>
                            <dt className="text-sm font-medium text-gray-500">Registration Date</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }) : 'Unknown'}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-sm font-medium text-gray-500">Registered By</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {patient.createdBy || 'Unknown'}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {patient.updatedAt ? new Date(patient.updatedAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }) : 'Never'}
                            </dd>
                        </div>
                    </div>
                </div>
            </div>

            {/* System Information */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">System Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Database ID</dt>
                        <dd className="mt-1 text-sm text-gray-900 font-mono">
                            {patient.id}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-sm font-medium text-gray-500">Aggregate UUID</dt>
                        <dd className="mt-1 text-sm text-gray-900 font-mono break-all">
                            {patient.aggregateUuid || 'Not available'}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-sm font-medium text-gray-500">Patient Number</dt>
                        <dd className="mt-1 text-sm text-gray-900 font-mono">
                            {patient.patientNumber || 'Not assigned'}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-sm font-medium text-gray-500">Contact Available</dt>
                        <dd className="mt-1">
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${formattedPatient.hasContactInfo
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {formattedPatient.hasContactInfo ? 'Yes' : 'No'}
                            </span>
                        </dd>
                    </div>
                </div>
            </div>

            {/* Study Enrollments Section (Placeholder for future implementation) */}
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Study Enrollments</h2>
                    <button
                        onClick={() => navigate('/datacapture-management/subjects', { state: { openEnrollment: true } })}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        title="Open enrollment wizard"
                    >
                        Enroll in New Study
                    </button>
                </div>

                <div className="text-center py-8">
                    <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">No Study Enrollments</h3>
                    <p className="text-sm text-gray-500">
                        This patient is not currently enrolled in any studies.
                    </p>
                </div>
            </div>
        </div>
    );
}