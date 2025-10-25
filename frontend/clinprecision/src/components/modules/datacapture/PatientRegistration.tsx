/**
 * PatientRegistration Component
 * 
 * Patient registration form for initial demographic data collection
 * Validates and submits patient information to enrollment service
 * 
 * Updated: October 2025
 * Aligned with patient enrollment workflow
 */

import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientEnrollmentService from '../../../services/data-capture/PatientEnrollmentService';

interface FormData {
    firstName: string;
    middleName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    phoneNumber: string;
    email: string;
}

interface GenderOption {
    value: string;
    label: string;
}

interface RegistrationResult {
    id: number;
}

const PatientRegistration: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        middleName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        phoneNumber: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const navigate = useNavigate();

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear errors when user starts typing
        if (error) setError(null);
        if (validationErrors.length > 0) setValidationErrors([]);
        if (success) setSuccess(false);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setValidationErrors([]);
        setSuccess(false);

        try {
            // Validate form data
            const validation = PatientEnrollmentService.validatePatientData(formData as any) as any;

            if (!validation.isValid) {
                setValidationErrors(validation.errors);
                setLoading(false);
                return;
            }

            console.log('[PATIENT_REGISTRATION] Submitting patient data:', formData);

            // Register patient
            const result = await PatientEnrollmentService.registerPatient(formData as any) as any as RegistrationResult;

            console.log('[PATIENT_REGISTRATION] Patient registered successfully:', result);

            setSuccess(true);

            // Redirect to patient details after a brief delay
            setTimeout(() => {
                navigate(`/datacapture-management/patients/${result.id}`);
            }, 2000);

        } catch (error: any) {
            console.error('[PATIENT_REGISTRATION] Error registering patient:', error);

            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            } else if (error.message) {
                setError(error.message);
            } else {
                setError('Failed to register patient. Please try again.');
            }

            setLoading(false);
        }
    };

    const genderOptions: GenderOption[] = [
        { value: '', label: 'Select Gender' },
        { value: 'MALE', label: 'Male' },
        { value: 'FEMALE', label: 'Female' },
        { value: 'OTHER', label: 'Other' }
    ];

    if (success) {
        return (
            <div className="bg-white shadow rounded-lg p-6">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Patient Registered Successfully!</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Patient {formData.firstName} {formData.lastName} has been registered in the system.
                    </p>
                    <p className="text-xs text-gray-400">
                        Redirecting to patient details...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Register New Patient</h3>
                <button
                    type="button"
                    onClick={() => navigate('/datacapture-management/patients')}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <div className="font-bold">Please fix the following errors:</div>
                    <ul className="list-disc list-inside mt-2">
                        {validationErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* General Error */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <div className="font-bold">Registration Failed</div>
                    <p>{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Personal Information */}
                <div className="mb-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h4>

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
                                disabled={loading}
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
                                placeholder="Enter middle name (optional)"
                                disabled={loading}
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
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date of Birth*
                            </label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                disabled={loading}
                                max={new Date().toISOString().split('T')[0]} // Prevent future dates
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Patient must be at least 18 years old
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Gender*
                            </label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                disabled={loading}
                            >
                                {genderOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="mb-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h4>
                    <p className="text-sm text-gray-600 mb-4">
                        At least one form of contact information is required.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                placeholder="e.g., +1 (555) 123-4567"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="patient@example.com"
                                disabled={loading}
                            />
                        </div>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={() => navigate('/datacapture-management/patients')}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Registering Patient...
                            </div>
                        ) : (
                            'Register Patient'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PatientRegistration;
