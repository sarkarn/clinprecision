/**
 * DataCaptureDashboard Component
 * 
 * Main landing page for Data Capture & Entry Module
 * Provides quick access to key workflows: subjects, visits, data entry, protocol compliance
 * 
 * Updated: October 2025
 * Aligned with clinical data capture workflow
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientEnrollmentService from 'services/data-capture/PatientEnrollmentService';
import { getStudies } from 'services/StudyService';

interface PatientStats {
    totalPatients: number;
    enrolledPatients: number;
    screeningPatients: number;
    completedPatients: number;
}

interface Study {
    id: number;
    title?: string;
    name?: string;
    protocolNumber: string;
    status: string;
    phase?: string;
    enrolledSubjects?: number;
    plannedSubjects?: number;
    targetEnrollment?: number;
}

interface QuickAction {
    label: string;
    action: () => void;
    variant: 'primary' | 'secondary';
}

interface StatItem {
    value: number;
    label: string;
    color: string;
}

interface QuickActionCard {
    title: string;
    description: string;
    icon: React.ReactElement;
    stats: StatItem[] | null;
    actions: QuickAction[];
    bgColor: string;
    borderColor: string;
    iconColor: string;
}

const DataCaptureDashboard: React.FC = () => {
    const [patientStats, setPatientStats] = useState<PatientStats | null>(null);
    const [activeStudies, setActiveStudies] = useState<Study[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            const stats = await PatientEnrollmentService.getPatientStatistics(undefined as any) as any;
            setPatientStats(stats);

            const studies = await getStudies() as any;
            const active = studies.filter((s: Study) =>
                s.status === 'ACTIVE' || s.status === 'RECRUITING' || s.status === 'PUBLISHED'
            );
            setActiveStudies(active);

        } catch (error) {
            console.error('[DASHBOARD] Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const quickActionCards: QuickActionCard[] = [
        {
            title: 'Subject Management',
            description: 'Enroll subjects, manage demographics, and track status',
            icon: (
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            stats: patientStats ? [
                { value: patientStats.enrolledPatients, label: 'Enrolled', color: 'text-green-600' },
                { value: patientStats.screeningPatients, label: 'Screening', color: 'text-yellow-600' },
                { value: patientStats.completedPatients, label: 'Completed', color: 'text-blue-600' }
            ] : null,
            actions: [
                { label: 'View All Subjects', action: () => navigate('/datacapture-management/subjects'), variant: 'primary' },
                { label: 'Enroll New Subject', action: () => navigate('/datacapture-management/subjects', { state: { openEnrollment: true } }), variant: 'secondary' }
            ],
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            iconColor: 'text-blue-600'
        },
        {
            title: 'Visit & Data Entry',
            description: 'Complete visits, enter form data, and track progress',
            icon: (
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            ),
            stats: null,
            actions: [
                { label: 'View Subjects', action: () => navigate('/datacapture-management/subjects'), variant: 'primary' },
                { label: 'Patient Registry', action: () => navigate('/datacapture-management/patients'), variant: 'secondary' }
            ],
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            iconColor: 'text-green-600'
        },
        {
            title: 'Protocol Compliance',
            description: 'Track deviations, visit windows, and protocol adherence',
            icon: (
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
            stats: null,
            actions: [
                { label: 'Protocol Deviations', action: () => navigate('/datacapture-management/deviations/dashboard'), variant: 'primary' },
                { label: 'View Subjects', action: () => navigate('/datacapture-management/subjects'), variant: 'secondary' }
            ],
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            iconColor: 'text-red-600'
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Data Capture & Entry</h1>
                        <p className="text-blue-100 mt-2">
                            Electronic Data Capture • Visit Management • Protocol Compliance
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-blue-200">Clinical Research Platform</div>
                        <div className="text-2xl font-semibold">ClinPrecision EDC</div>
                    </div>
                </div>
            </div>

            {/* Quick Statistics */}
            {patientStats && (
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Overall Statistics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
                            <div className="text-3xl font-bold text-blue-700">{patientStats.totalPatients}</div>
                            <div className="text-sm text-blue-900 font-medium">Total Patients</div>
                            <div className="text-xs text-blue-600 mt-1">Registered in System</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border-l-4 border-green-500">
                            <div className="text-3xl font-bold text-green-700">{patientStats.enrolledPatients}</div>
                            <div className="text-sm text-green-900 font-medium">Enrolled Subjects</div>
                            <div className="text-xs text-green-600 mt-1">Active in Studies</div>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border-l-4 border-yellow-500">
                            <div className="text-3xl font-bold text-yellow-700">{patientStats.screeningPatients}</div>
                            <div className="text-sm text-yellow-900 font-medium">In Screening</div>
                            <div className="text-xs text-yellow-600 mt-1">Eligibility Assessment</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border-l-4 border-purple-500">
                            <div className="text-3xl font-bold text-purple-700">{patientStats.completedPatients}</div>
                            <div className="text-sm text-purple-900 font-medium">Completed</div>
                            <div className="text-xs text-purple-600 mt-1">Study Completion</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Action Cards */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {quickActionCards.map((card, index) => (
                        <div key={index} className={`bg-white shadow-md rounded-lg border-2 ${card.borderColor} p-6 hover:shadow-xl transition-all duration-200`}>
                            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg ${card.bgColor} mb-4`}>
                                <div className={card.iconColor}>
                                    {card.icon}
                                </div>
                            </div>

                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{card.title}</h3>
                            <p className="text-gray-600 text-sm mb-4">{card.description}</p>

                            {/* Stats */}
                            {card.stats && (
                                <div className="mb-4 bg-gray-50 rounded-lg p-3">
                                    <div className="grid grid-cols-3 gap-2">
                                        {card.stats.map((stat, statIndex) => (
                                            <div key={statIndex} className="text-center">
                                                <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                                                <div className="text-xs text-gray-600">{stat.label}</div>
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
                                        className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${action.variant === 'primary'
                                            ? `${card.bgColor.replace('bg-', 'bg-').replace('-50', '-600')} text-white hover:shadow-md ${card.bgColor.replace('bg-', 'hover:bg-').replace('-50', '-700')}`
                                            : `border-2 ${card.borderColor} text-gray-700 hover:bg-gray-50`
                                            }`}
                                    >
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Active Studies */}
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Active Studies</h2>
                    {activeStudies.length > 0 && (
                        <span className="text-sm text-gray-500">{activeStudies.length} active</span>
                    )}
                </div>

                {activeStudies.length === 0 ? (
                    <div className="text-center py-8">
                        <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="text-sm font-medium text-gray-900 mb-2">No Active Studies</h3>
                        <p className="text-sm text-gray-500">
                            Active or recruiting studies will appear here for quick access.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeStudies.slice(0, 6).map((study) => (
                            <div
                                key={study.id}
                                className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all duration-200 cursor-pointer"
                                onClick={() => navigate('/datacapture-management/subjects', { state: { preselectedStudy: study.id } })}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
                                            {study.title || study.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 mb-2">{study.protocolNumber}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${study.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                        study.status === 'RECRUITING' ? 'bg-blue-100 text-blue-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {study.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <div className="bg-blue-50 rounded p-2">
                                        <div className="text-lg font-bold text-blue-700">
                                            {study.enrolledSubjects || 0}
                                        </div>
                                        <div className="text-xs text-blue-600">Enrolled</div>
                                    </div>
                                    <div className="bg-gray-50 rounded p-2">
                                        <div className="text-lg font-bold text-gray-700">
                                            {study.plannedSubjects || study.targetEnrollment || 0}
                                        </div>
                                        <div className="text-xs text-gray-600">Target</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">
                                        <span className="font-medium">Phase:</span> {study.phase || 'N/A'}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate('/datacapture-management/subjects', { state: { preselectedStudy: study.id } });
                                        }}
                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        View Subjects →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeStudies.length > 6 && (
                    <div className="mt-4 text-center">
                        <button
                            onClick={() => navigate('/study-design')}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                            View All {activeStudies.length} Active Studies →
                        </button>
                    </div>
                )}
            </div>

            {/* Work Queue / Recent Activity */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Work Queue</h2>
                <div className="text-center py-8">
                    <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">No Pending Tasks</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Pending visits, overdue data entry, and protocol deviations will appear here.
                    </p>
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={() => navigate('/datacapture-management/subjects')}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            View Subjects
                        </button>
                        <button
                            onClick={() => navigate('/datacapture-management/deviations/dashboard')}
                            className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            View Deviations
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataCaptureDashboard;
