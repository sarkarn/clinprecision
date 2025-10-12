// SubjectManagementDashboard.jsx - SIMPLIFIED VERSION
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SubjectManagementDashboard() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-4xl w-full">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">Subject Management</h1>
                    <p className="text-lg text-gray-600">
                        Manage study subjects, enrollment, and clinical data
                    </p>
                </div>

                {/* Main Action Cards - Only 2 Primary Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* View All Subjects - PRIMARY ACTION */}
                    <button
                        onClick={() => navigate('/subject-management/subjects')}
                        className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-200 border-2 border-blue-200 hover:border-blue-400 group"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                                <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">View All Subjects</h2>
                            <p className="text-gray-600">
                                Browse subjects by study, view details, and manage status
                            </p>
                        </div>
                    </button>

                    {/* Enroll New Subject */}
                    <button
                        onClick={() => navigate('/subject-management/enroll')}
                        className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-200 border-2 border-green-200 hover:border-green-400 group"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                                <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Enroll New Subject</h2>
                            <p className="text-gray-600">
                                Register a new subject in a clinical study
                            </p>
                        </div>
                    </button>
                </div>

                {/* Quick Info Card */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-900">Subject Status Workflow</h3>
                            <div className="mt-2 text-sm text-blue-800">
                                <p className="mb-2">After enrolling a subject, you can manage their lifecycle:</p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">REGISTERED</span>
                                    <span>→</span>
                                    <span className="px-2 py-1 bg-yellow-100 rounded text-xs font-medium">SCREENING</span>
                                    <span>→</span>
                                    <span className="px-2 py-1 bg-blue-100 rounded text-xs font-medium">ENROLLED</span>
                                    <span>→</span>
                                    <span className="px-2 py-1 bg-green-100 rounded text-xs font-medium">ACTIVE</span>
                                    <span>→</span>
                                    <span className="px-2 py-1 bg-purple-100 rounded text-xs font-medium">COMPLETED</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}