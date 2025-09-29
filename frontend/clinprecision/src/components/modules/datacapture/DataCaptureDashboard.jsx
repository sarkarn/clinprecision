// DataCaptureDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientEnrollmentService from '../../../services/PatientEnrollmentService';

export default function DataCaptureDashboard() {
    const [patientStats, setPatientStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const stats = await PatientEnrollmentService.getPatientStatistics();
            setPatientStats(stats);
        } catch (error) {
            console.error('[DASHBOARD] Error loading dashboard data:', error);
            // Don't show error for dashboard stats
        } finally {
            setLoading(false);
        }
    };

    const dashboardCards = [
        {
            title: 'Patient Management',
            description: 'Register and manage patients in the system',
            icon: (
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            stats: patientStats ? [
                { label: 'Total Patients', value: patientStats.totalPatients, color: 'text-blue-600' },
                { label: 'Enrolled', value: patientStats.enrolledPatients, color: 'text-green-600' },
                { label: 'Screening', value: patientStats.screeningPatients, color: 'text-yellow-600' }
            ] : null,
            actions: [
                { label: 'View All Patients', action: () => navigate('/datacapture-management/patients'), variant: 'secondary' },
                { label: 'Register New Patient', action: () => navigate('/datacapture-management/patients/register'), variant: 'primary' }
            ],
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            iconColor: 'text-blue-600'
        },
        {
            title: 'Subject Management',
            description: 'Manage study subjects and enrollments',
            icon: (
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            stats: null,
            actions: [
                { label: 'View All Subjects', action: () => navigate('/datacapture-management/subjects'), variant: 'secondary' },
                { label: 'Enroll Subject', action: () => navigate('/datacapture-management/enroll'), variant: 'primary' }
            ],
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            iconColor: 'text-green-600'
        },
        {
            title: 'Data Entry',
            description: 'Electronic case report forms and data collection',
            icon: (
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            ),
            stats: null,
            actions: [
                { label: 'View Forms', action: () => navigate('/datacapture-management/forms'), variant: 'secondary' },
                { label: 'Data Entry', action: () => navigate('/datacapture-management/entry'), variant: 'primary' }
            ],
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200',
            iconColor: 'text-purple-600'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Data Capture & Entry Dashboard</h1>
                        <p className="text-gray-600 mt-2">
                            Manage patients, subjects, and clinical data collection
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-500">Clinical Research Platform</div>
                        <div className="text-lg font-semibold text-blue-600">ClinPrecision EDC</div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            {patientStats && (
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Statistics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="text-2xl font-bold text-blue-600">{patientStats.totalPatients}</div>
                            <div className="text-sm text-blue-800">Total Patients</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <div className="text-2xl font-bold text-green-600">{patientStats.enrolledPatients}</div>
                            <div className="text-sm text-green-800">Enrolled in Studies</div>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                            <div className="text-2xl font-bold text-yellow-600">{patientStats.screeningPatients}</div>
                            <div className="text-sm text-yellow-800">In Screening</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <div className="text-2xl font-bold text-purple-600">{patientStats.completedPatients}</div>
                            <div className="text-sm text-purple-800">Completed Studies</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {dashboardCards.map((card, index) => (
                    <div key={index} className={`bg-white shadow rounded-lg border-2 ${card.borderColor} p-6 hover:shadow-lg transition-shadow duration-200`}>
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg ${card.bgColor} mb-4`}>
                            <div className={card.iconColor}>
                                {card.icon}
                            </div>
                        </div>

                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{card.title}</h3>
                        <p className="text-gray-600 mb-4">{card.description}</p>

                        {/* Stats */}
                        {card.stats && (
                            <div className="mb-4">
                                <div className="grid grid-cols-3 gap-2">
                                    {card.stats.map((stat, statIndex) => (
                                        <div key={statIndex} className="text-center">
                                            <div className={`text-lg font-semibold ${stat.color}`}>{stat.value}</div>
                                            <div className="text-xs text-gray-500">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="space-y-2">
                            {card.actions.map((action, actionIndex) => (
                                <button
                                    key={actionIndex}
                                    onClick={action.action}
                                    className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${action.variant === 'primary'
                                            ? `bg-${card.iconColor.split('-')[1]}-600 text-white hover:bg-${card.iconColor.split('-')[1]}-700`
                                            : `border border-gray-300 text-gray-700 hover:bg-gray-50`
                                        }`}
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity (Placeholder) */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
                <div className="text-center py-8">
                    <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">No Recent Activity</h3>
                    <p className="text-sm text-gray-500">
                        Recent patient registrations, enrollments, and data entry activities will appear here.
                    </p>
                </div>
            </div>
        </div>
    );
}