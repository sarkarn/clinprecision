import React from "react";
import { Link, Routes, Route } from "react-router-dom";
import Logout from "./login/Logout";
import TopNavigationHeader from "./shared/TopNavigationHeader";
import StudyDesignModule from "./modules/trialdesign/StudyDesignModule";
import DataCaptureModule from "./modules/datacapture/DataCaptureModule";
import { useAuth } from "./login/AuthContext";
import { useRoleBasedNavigation } from "../hooks/useRoleBasedNavigation";

const HomeWithRBAC: React.FC = () => {
    const { user } = useAuth();
    const { hasModuleAccess, hasCategoryAccess, userRoleDisplay } = useRoleBasedNavigation();

    return (
        <>
            <div className="flex h-screen bg-gray-50">
                {/* Sidebar */}
                <div className="w-80 bg-white shadow-lg border-r border-gray-200 overflow-y-auto">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-xl font-bold text-gray-900">ClinPrecision EDC</h1>
                            <div className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                Clinical Research Platform
                            </div>
                        </div>

                        {/* User Role Display */}
                        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">
                                        {user?.name?.charAt(0) || 'U'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {user?.name || 'User'}
                                </p>
                                <p className="text-xs text-blue-600 truncate">
                                    {userRoleDisplay}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Study Management Section */}
                        {hasCategoryAccess('study-management') && (
                            <div className="mb-8">
                                <h2 className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-4 px-2 flex items-center">
                                    <svg className="w-3 h-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Study Management
                                </h2>
                                <div className="space-y-1">
                                    {hasModuleAccess('study-design') && (
                                        <Link to="/study-design" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 border border-transparent hover:border-blue-200">
                                            <div className="flex items-center justify-center h-5 w-5 mr-3 text-blue-400 group-hover:text-blue-600">
                                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <div>Protocol Design</div>
                                                <div className="text-xs text-gray-500 group-hover:text-blue-500">Design and manage study protocols</div>
                                            </div>
                                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full group-hover:bg-blue-200">CRF</span>
                                        </Link>
                                    )}
                                    {hasModuleAccess('user-management') && (
                                        <Link to="/user-management" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 border border-transparent hover:border-blue-200">
                                            <div className="flex items-center justify-center h-5 w-5 mr-3 text-blue-400 group-hover:text-blue-600">
                                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <div>User & Site Management</div>
                                                <div className="text-xs text-gray-500 group-hover:text-blue-500">Manage users, roles & study sites</div>
                                            </div>
                                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full group-hover:bg-blue-200">RBAC</span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Clinical Operations Section */}
                        {hasCategoryAccess('clinical-operations') && (
                            <div className="mb-8">
                                <h2 className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-4 px-2 flex items-center">
                                    <svg className="w-3 h-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Clinical Operations
                                </h2>
                                <div className="space-y-1">
                                    {hasModuleAccess('datacapture-management') && (
                                        <Link to="/datacapture-management" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-700 transition-all duration-200 border border-transparent hover:border-green-200">
                                            <div className="flex items-center justify-center h-5 w-5 mr-3 text-green-400 group-hover:text-green-600">
                                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <div>Data Capture & Entry</div>
                                                <div className="text-xs text-gray-500 group-hover:text-green-500">Electronic case report forms</div>
                                            </div>
                                            <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded-full group-hover:bg-green-200">eCRF</span>
                                        </Link>
                                    )}
                                    {hasModuleAccess('subject-management') && (
                                        <Link to="/subject-management" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-700 transition-all duration-200 border border-transparent hover:border-green-200">
                                            <div className="flex items-center justify-center h-5 w-5 mr-3 text-green-400 group-hover:text-green-600">
                                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <div>Subject Management</div>
                                                <div className="text-xs text-gray-500 group-hover:text-green-500">Patient enrollment & tracking</div>
                                            </div>
                                            <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded-full group-hover:bg-green-200">SDV</span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Data Quality & Compliance Section */}
                        {hasCategoryAccess('data-quality') && (
                            <div className="mb-8">
                                <h2 className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-4 px-2 flex items-center">
                                    <svg className="w-3 h-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    Data Quality & Compliance
                                </h2>
                                <div className="space-y-1">
                                    {hasModuleAccess('dq-management') && (
                                        <Link to="/dq-management" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 border border-transparent hover:border-purple-200">
                                            <div className="flex items-center justify-center h-5 w-5 mr-3 text-purple-400 group-hover:text-purple-600">
                                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <div>Data Quality & Validation</div>
                                                <div className="text-xs text-gray-500 group-hover:text-purple-500">Query management & validation</div>
                                            </div>
                                            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded-full group-hover:bg-purple-200">21 CFR</span>
                                        </Link>
                                    )}
                                    {hasModuleAccess('audit-trail') && (
                                        <Link to="/audit-trail" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 border border-transparent hover:border-purple-200">
                                            <div className="flex items-center justify-center h-5 w-5 mr-3 text-purple-400 group-hover:text-purple-600">
                                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <div>Audit Trail</div>
                                                <div className="text-xs text-gray-500 group-hover:text-purple-500">Compliance & audit logging</div>
                                            </div>
                                            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded-full group-hover:bg-purple-200">GCP</span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Clinical Analytics Section */}
                        {hasCategoryAccess('clinical-analytics') && (
                            <div className="mb-8">
                                <h2 className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-4 px-2 flex items-center">
                                    <svg className="w-3 h-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    Clinical Analytics
                                </h2>
                                <div className="space-y-1">
                                    {hasModuleAccess('reports') && (
                                        <Link to="/reports" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-all duration-200 border border-transparent hover:border-orange-200">
                                            <div className="flex items-center justify-center h-5 w-5 mr-3 text-orange-400 group-hover:text-orange-600">
                                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l-1-3m1 3l-1-3m-16.5-3h9.75" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <div>Clinical Reports</div>
                                                <div className="text-xs text-gray-500 group-hover:text-orange-500">Study reports & analytics</div>
                                            </div>
                                            <span className="text-xs px-2 py-1 bg-orange-100 text-orange-600 rounded-full group-hover:bg-orange-200">CSR</span>
                                        </Link>
                                    )}
                                    {hasModuleAccess('medical-coding') && (
                                        <Link to="/medical-coding" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-all duration-200 border border-transparent hover:border-orange-200">
                                            <div className="flex items-center justify-center h-5 w-5 mr-3 text-orange-400 group-hover:text-orange-600">
                                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <div>Medical Coding</div>
                                                <div className="text-xs text-gray-500 group-hover:text-orange-500">Adverse events & medical coding</div>
                                            </div>
                                            <span className="text-xs px-2 py-1 bg-orange-100 text-orange-600 rounded-full group-hover:bg-orange-200">AE</span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* System Integration Section */}
                        {hasCategoryAccess('system-integration') && (
                            <div className="mb-8">
                                <h2 className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-4 px-2 flex items-center">
                                    <svg className="w-3 h-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                    System Integration
                                </h2>
                                <div className="space-y-1">
                                    {hasModuleAccess('data-integration') && (
                                        <Link to="/data-integration" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200 border border-transparent hover:border-indigo-200">
                                            <div className="flex items-center justify-center h-5 w-5 mr-3 text-indigo-400 group-hover:text-indigo-600">
                                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <div>Data Integration</div>
                                                <div className="text-xs text-gray-500 group-hover:text-indigo-500">External system integrations</div>
                                            </div>
                                            <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-600 rounded-full group-hover:bg-indigo-200">API</span>
                                        </Link>
                                    )}
                                    {hasModuleAccess('system-monitoring') && (
                                        <Link to="/system-monitoring" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200 border border-transparent hover:border-indigo-200">
                                            <div className="flex items-center justify-center h-5 w-5 mr-3 text-indigo-400 group-hover:text-indigo-600">
                                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <div>System Monitoring</div>
                                                <div className="text-xs text-gray-500 group-hover:text-indigo-500">System health & performance</div>
                                            </div>
                                            <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-600 rounded-full group-hover:bg-indigo-200">SLA</span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Enhanced Footer with System Status */}
                    <div className="border-t border-gray-200 p-6 mt-auto">
                        <div className="space-y-3">
                            {/* System Status */}
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">System Status:</span>
                                <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <span className="text-green-600 font-medium">Operational</span>
                                </div>
                            </div>

                            {/* Data Sync Status */}
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">Last Sync:</span>
                                <span className="text-gray-700">2 mins ago</span>
                            </div>

                            {/* Compliance Badge */}
                            <div className="flex flex-wrap gap-1">
                                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">FDA 21 CFR Part 11</span>
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">ICH GCP</span>
                                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">HIPAA Compliant</span>
                            </div>

                            <div className="pt-3 border-t border-gray-100">
                                <Logout />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <TopNavigationHeader />
                    <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
                        <Routes>
                            <Route path="/study-design" element={<StudyDesignModule />} />
                            <Route path="/datacapture-management" element={<DataCaptureModule />} />
                            <Route path="/dq-management" element={
                                <div className="bg-white rounded-lg shadow p-8 text-center">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Quality Management</h2>
                                    <p className="text-gray-600">Data quality and validation module coming soon.</p>
                                </div>
                            } />
                            <Route path="/user-management" element={
                                <div className="bg-white rounded-lg shadow p-8 text-center">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">User Management</h2>
                                    <p className="text-gray-600">User administration module coming soon.</p>
                                </div>
                            } />

                            {/* Placeholder routes for new modules */}
                            <Route path="/subject-management" element={
                                <div className="bg-white rounded-lg shadow p-8 text-center">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Subject Management</h2>
                                    <p className="text-gray-600">Patient enrollment and tracking module coming soon.</p>
                                </div>
                            } />
                            <Route path="/audit-trail" element={
                                <div className="bg-white rounded-lg shadow p-8 text-center">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Audit Trail</h2>
                                    <p className="text-gray-600">Compliance and audit logging module coming soon.</p>
                                </div>
                            } />
                            <Route path="/medical-coding" element={
                                <div className="bg-white rounded-lg shadow p-8 text-center">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Medical Coding</h2>
                                    <p className="text-gray-600">Medical coding and adverse events module coming soon.</p>
                                </div>
                            } />
                            <Route path="/reports" element={
                                <div className="bg-white rounded-lg shadow p-8 text-center">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Clinical Reports</h2>
                                    <p className="text-gray-600">Study reports and analytics module coming soon.</p>
                                </div>
                            } />
                            <Route path="/data-integration" element={
                                <div className="bg-white rounded-lg shadow p-8 text-center">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Integration</h2>
                                    <p className="text-gray-600">External system integrations module coming soon.</p>
                                </div>
                            } />
                            <Route path="/system-monitoring" element={
                                <div className="bg-white rounded-lg shadow p-8 text-center">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">System Monitoring</h2>
                                    <p className="text-gray-600">System health and performance monitoring coming soon.</p>
                                </div>
                            } />
                        </Routes>
                    </main>
                </div>
            </div>
        </>
    );
};

export default HomeWithRBAC;
