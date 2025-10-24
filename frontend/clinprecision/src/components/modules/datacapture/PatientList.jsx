// PatientList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientEnrollmentService from '../../../services/data-capture/PatientEnrollmentService';

export default function PatientList() {
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedGender, setSelectedGender] = useState('');
    const [statistics, setStatistics] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadPatients();
        loadStatistics();
    }, []);

    useEffect(() => {
        // Apply filters when patients or filter criteria change
        applyFilters();
    }, [patients, searchTerm, selectedStatus, selectedGender]);

    const loadPatients = async () => {
        try {
            setLoading(true);
            console.log('[PATIENT_LIST] Loading patients...');

            const patientsData = await PatientEnrollmentService.getAllPatients();

            console.log('[PATIENT_LIST] Loaded patients:', patientsData.length);
            setPatients(patientsData);
            setError(null);
        } catch (error) {
            console.error('[PATIENT_LIST] Error loading patients:', error);
            setError('Failed to load patients. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const loadStatistics = async () => {
        try {
            const stats = await PatientEnrollmentService.getPatientStatistics();
            setStatistics(stats);
        } catch (error) {
            console.error('[PATIENT_LIST] Error loading statistics:', error);
            // Don't set error for statistics failure
        }
    };

    const applyFilters = () => {
        let filtered = [...patients];

        // Apply search filter
        if (searchTerm.trim()) {
            filtered = PatientEnrollmentService.filterPatients(filtered, { name: searchTerm });
        }

        // Apply status filter
        if (selectedStatus) {
            filtered = PatientEnrollmentService.filterPatients(filtered, { status: selectedStatus });
        }

        // Apply gender filter
        if (selectedGender) {
            filtered = PatientEnrollmentService.filterPatients(filtered, { gender: selectedGender });
        }

        setFilteredPatients(filtered);
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            applyFilters();
            return;
        }

        try {
            setLoading(true);
            const searchResults = await PatientEnrollmentService.searchPatientsByName(searchTerm);
            setFilteredPatients(searchResults);
        } catch (error) {
            console.error('[PATIENT_LIST] Error searching patients:', error);
            setError('Search failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatPatient = (patient) => {
        return PatientEnrollmentService.formatPatientForDisplay(patient);
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
            MALE: 'bg-blue-50 text-blue-700',
            FEMALE: 'bg-pink-50 text-pink-700',
            OTHER: 'bg-gray-50 text-gray-700'
        };
        return genderClasses[gender] || 'bg-gray-50 text-gray-700';
    };

    if (loading && patients.length === 0) {
        return (
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-gray-500">Loading patients...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Patient Management</h2>
                        <p className="text-gray-600 mt-1">Manage patient registrations and enrollments</p>
                    </div>
                    <button
                        onClick={() => navigate('/datacapture-management/patients/register')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Register New Patient
                    </button>
                </div>

                {/* Statistics Cards */}
                {statistics && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{statistics.totalPatients}</div>
                            <div className="text-sm text-blue-800">Total Patients</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{statistics.enrolledPatients}</div>
                            <div className="text-sm text-green-800">Enrolled</div>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-600">{statistics.screeningPatients}</div>
                            <div className="text-sm text-yellow-800">Screening</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{statistics.completedPatients}</div>
                            <div className="text-sm text-purple-800">Completed</div>
                        </div>
                    </div>
                )}

                {/* Search and Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search patients by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Statuses</option>
                            <option value="REGISTERED">Registered</option>
                            <option value="SCREENING">Screening</option>
                            <option value="ENROLLED">Enrolled</option>
                            <option value="WITHDRAWN">Withdrawn</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>

                    <div>
                        <select
                            value={selectedGender}
                            onChange={(e) => setSelectedGender(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Genders</option>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </div>
                    <button
                        onClick={loadPatients}
                        className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Patient List */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                {filteredPatients.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Patients Found</h3>
                        <p className="text-gray-500 mb-4">
                            {searchTerm || selectedStatus || selectedGender
                                ? 'No patients match your search criteria.'
                                : 'Get started by registering your first patient.'
                            }
                        </p>
                        {(!searchTerm && !selectedStatus && !selectedGender) && (
                            <button
                                onClick={() => navigate('/datacapture-management/patients/register')}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                            >
                                Register First Patient
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Patient
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Age & Gender
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Registration Date
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredPatients.map((patient) => {
                                    const formattedPatient = formatPatient(patient);
                                    return (
                                        <tr key={patient.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                                            <span className="text-sm font-medium text-white">
                                                                {patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {formattedPatient.displayName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            ID: {patient.id} | Patient #: {patient.patientNumber || 'N/A'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {formattedPatient.displayAge}
                                                </div>
                                                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getGenderBadgeClass(patient.gender)}`}>
                                                    {formattedPatient.displayGender}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {patient.email && <div>{patient.email}</div>}
                                                    {patient.phoneNumber && <div>{patient.phoneNumber}</div>}
                                                    {!formattedPatient.hasContactInfo && (
                                                        <span className="text-gray-400">No contact info</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(patient.status)}`}>
                                                    {formattedPatient.displayStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => navigate(`/datacapture-management/patients/${patient.id}`)}
                                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                                >
                                                    View Details
                                                </button>
                                                <button
                                                    onClick={() => navigate('/datacapture-management/subjects', { state: { openEnrollment: true } })}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Open enrollment wizard"
                                                >
                                                    Enroll in Study
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}