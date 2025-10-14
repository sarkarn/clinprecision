import { Link, Routes, Route, Navigate } from "react-router-dom";
import TopNavigationHeader from "./shared/TopNavigationHeader";
import StudyDesignModule from "./modules/trialdesign/StudyDesignModule";
import DataCaptureModule from "./modules/datacapture/DataCaptureModule";
import SubjectManagementModule from "./modules/subjectmanagement/SubjectManagementModule";
import DQManagement from "./modules/dqmgmt/DQManagement";
import AdminModule from "./modules/admin/AdminModule";
import BreadcrumbNavigation from "./shared/BreadcrumbNavigation";
import { useAuth } from "./login/AuthContext";
import { useRoleBasedNavigation } from "../hooks/useRoleBasedNavigation";

// New Module Imports
import IdentityAccessModule from "./modules/identity-access/IdentityAccessModule";
import OrganizationAdminModule from "./modules/organization-admin/OrganizationAdminModule";
import SiteOperationsModule from "./modules/site-operations/SiteOperationsModule";

export default function Home() {
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
                                        <Link to="/study-design/studies" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 border border-transparent hover:border-blue-200">
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
                                    {/* Identity & Access Management */}
                                    {hasModuleAccess('user-management') && (
                                        <Link to="/identity-access" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 border border-transparent hover:border-blue-200">
                                            <div className="flex items-center justify-center h-5 w-5 mr-3 text-blue-400 group-hover:text-blue-600">
                                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <div>Identity & Access</div>
                                                <div className="text-xs text-gray-500 group-hover:text-blue-500">User & role management</div>
                                            </div>
                                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full group-hover:bg-blue-200">IAM</span>
                                        </Link>
                                    )}

                                    {/* Organization Administration */}
                                    {hasModuleAccess('user-management') && (
                                        <Link to="/organization-admin" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-all duration-200 border border-transparent hover:border-violet-200">
                                            <div className="flex items-center justify-center h-5 w-5 mr-3 text-violet-400 group-hover:text-violet-600">
                                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <div>Organization Admin</div>
                                                <div className="text-xs text-gray-500 group-hover:text-violet-500">Sponsors & CROs</div>
                                            </div>
                                            <span className="text-xs px-2 py-1 bg-violet-100 text-violet-600 rounded-full group-hover:bg-violet-200">ORG</span>
                                        </Link>
                                    )}

                                    {/* Site Operations Management */}
                                    {hasModuleAccess('user-management') && (
                                        <Link to="/site-operations" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-all duration-200 border border-transparent hover:border-amber-200">
                                            <div className="flex items-center justify-center h-5 w-5 mr-3 text-amber-400 group-hover:text-amber-600">
                                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <div>Site Operations</div>
                                                <div className="text-xs text-gray-500 group-hover:text-amber-500">Clinical site management</div>
                                            </div>
                                            <span className="text-xs px-2 py-1 bg-amber-100 text-amber-600 rounded-full group-hover:bg-amber-200">SITES</span>
                                        </Link>
                                    )}
                                    {hasModuleAccess('study-design') && (
                                        <Link to="/study-design/database-builds" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 border border-transparent hover:border-blue-200">
                                            <div className="flex items-center justify-center h-5 w-5 mr-3 text-blue-400 group-hover:text-blue-600">
                                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <div>Database Build</div>
                                                <div className="text-xs text-gray-500 group-hover:text-blue-500">Build & manage study databases</div>
                                            </div>
                                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full group-hover:bg-blue-200">NEW</span>
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
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
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
                        </div>
                    </div>
                </div>                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <TopNavigationHeader />
                    <BreadcrumbNavigation />
                    <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
                        <Routes>
                            {/* Default dashboard route */}
                            <Route index element={
                                <div className="space-y-6">
                                    {/* Hero Welcome Section */}
                                    <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-xl shadow-2xl overflow-hidden">
                                        <div className="px-8 py-12 md:px-12 md:py-16">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                                        <span className="text-white text-sm font-medium">System Operational</span>
                                                    </div>
                                                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                                        Welcome back, {user?.name || 'User'}
                                                    </h1>
                                                    <p className="text-xl text-blue-100 mb-6 max-w-3xl">
                                                        Accelerate clinical research with AI-powered trial management, real-time data capture, and end-to-end compliance automation.
                                                    </p>
                                                    <div className="flex flex-wrap gap-3">
                                                        <div className="flex items-center space-x-2 text-white">
                                                            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            <span className="text-sm font-medium">FDA 21 CFR Part 11</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2 text-white">
                                                            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            <span className="text-sm font-medium">ICH-GCP Compliant</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2 text-white">
                                                            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            <span className="text-sm font-medium">HIPAA Secure</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="hidden lg:block">
                                                    <div className="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                                        <svg className="w-20 h-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Platform Capabilities */}
                                    <div className="bg-white rounded-xl shadow-lg p-8">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-2xl font-bold text-gray-900">Platform Capabilities</h2>
                                            <span className="text-sm text-gray-500">Everything you need in one platform</span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                            {/* Capability Card 1 */}
                                            <div className="text-center">
                                                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                                    <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                </div>
                                                <h3 className="font-semibold text-gray-900 mb-1">Study Design</h3>
                                                <p className="text-sm text-gray-600">Dynamic CRF builder with drag-and-drop interface</p>
                                            </div>

                                            {/* Capability Card 2 */}
                                            <div className="text-center">
                                                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <h3 className="font-semibold text-gray-900 mb-1">Data Capture</h3>
                                                <p className="text-sm text-gray-600">Real-time validation with offline capabilities</p>
                                            </div>

                                            {/* Capability Card 3 */}
                                            <div className="text-center">
                                                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                                    <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                    </svg>
                                                </div>
                                                <h3 className="font-semibold text-gray-900 mb-1">Data Quality</h3>
                                                <p className="text-sm text-gray-600">Automated validation & query management</p>
                                            </div>

                                            {/* Capability Card 4 */}
                                            <div className="text-center">
                                                <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                                    <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                    </svg>
                                                </div>
                                                <h3 className="font-semibold text-gray-900 mb-1">Analytics</h3>
                                                <p className="text-sm text-gray-600">Real-time dashboards & custom reports</p>
                                            </div>
                                        </div>

                                        {/* Key Statistics */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-blue-600 mb-1">50%</div>
                                                <div className="text-sm text-gray-600">Faster Data Entry</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-green-600 mb-1">95%</div>
                                                <div className="text-sm text-gray-600">Query Reduction</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-purple-600 mb-1">100%</div>
                                                <div className="text-sm text-gray-600">Regulatory Compliant</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-orange-600 mb-1">24/7</div>
                                                <div className="text-sm text-gray-600">Global Access</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Actions - Role Based */}
                                    <div className="bg-white rounded-xl shadow-lg p-8">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
                                                <p className="text-sm text-gray-600 mt-1">Get started with common tasks</p>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Role: <span className="font-semibold text-blue-600">{userRoleDisplay}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {hasModuleAccess('study-design') && (
                                                <Link
                                                    to="/study-design/studies"
                                                    className="group relative p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200"
                                                >
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                            </svg>
                                                        </div>
                                                        <span className="text-xs px-2 py-1 bg-blue-200 text-blue-700 rounded-full font-medium">CRF</span>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                                                        Protocol Design
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mb-4 group-hover:text-gray-700">
                                                        Create study protocols with dynamic CRF builder
                                                    </p>
                                                    <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
                                                        Get Started
                                                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </Link>
                                            )}

                                            {hasModuleAccess('study-design') && (
                                                <Link
                                                    to="/study-design/database-builds"
                                                    className="group relative p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border-2 border-indigo-200 hover:border-indigo-400 hover:shadow-lg transition-all duration-200"
                                                >
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                                            </svg>
                                                        </div>
                                                        <span className="text-xs px-2 py-1 bg-indigo-200 text-indigo-700 rounded-full font-medium">NEW</span>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors">
                                                        Database Build
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mb-4 group-hover:text-gray-700">
                                                        Build & deploy study databases with live tracking
                                                    </p>
                                                    <div className="flex items-center text-indigo-600 text-sm font-medium group-hover:text-indigo-700">
                                                        Get Started
                                                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </Link>
                                            )}

                                            {hasModuleAccess('datacapture-management') && (
                                                <Link
                                                    to="/datacapture-management"
                                                    className="group relative p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all duration-200"
                                                >
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                        </div>
                                                        <span className="text-xs px-2 py-1 bg-green-200 text-green-700 rounded-full font-medium">eCRF</span>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                                                        Data Capture
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mb-4 group-hover:text-gray-700">
                                                        Enter and manage patient data with real-time validation
                                                    </p>
                                                    <div className="flex items-center text-green-600 text-sm font-medium group-hover:text-green-700">
                                                        Get Started
                                                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </Link>
                                            )}

                                            {hasModuleAccess('subject-management') && (
                                                <Link
                                                    to="/subject-management"
                                                    className="group relative p-6 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-200"
                                                >
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                            </svg>
                                                        </div>
                                                        <span className="text-xs px-2 py-1 bg-teal-200 text-teal-700 rounded-full font-medium">SDV</span>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-teal-700 transition-colors">
                                                        Subject Management
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mb-4 group-hover:text-gray-700">
                                                        Manage patient enrollment and tracking across sites
                                                    </p>
                                                    <div className="flex items-center text-teal-600 text-sm font-medium group-hover:text-teal-700">
                                                        Get Started
                                                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </Link>
                                            )}

                                            {hasModuleAccess('dq-management') && (
                                                <Link
                                                    to="/dq-management"
                                                    className="group relative p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all duration-200"
                                                >
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </div>
                                                        <span className="text-xs px-2 py-1 bg-purple-200 text-purple-700 rounded-full font-medium">21 CFR</span>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">
                                                        Data Quality
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mb-4 group-hover:text-gray-700">
                                                        Query management and data validation workflows
                                                    </p>
                                                    <div className="flex items-center text-purple-600 text-sm font-medium group-hover:text-purple-700">
                                                        Get Started
                                                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </Link>
                                            )}

                                            {hasModuleAccess('user-management') && (
                                                <Link
                                                    to="/user-management"
                                                    className="group relative p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200"
                                                >
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                        </div>
                                                        <span className="text-xs px-2 py-1 bg-blue-200 text-blue-700 rounded-full font-medium">IAM</span>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                                                        Identity & Access Management
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mb-4 group-hover:text-gray-700">
                                                        Manage users, roles, permissions & study assignments
                                                    </p>
                                                    <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
                                                        Get Started
                                                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </Link>
                                            )}

                                            {hasModuleAccess('user-management') && (
                                                <Link
                                                    to="/user-management/organizations"
                                                    className="group relative p-6 bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl border-2 border-violet-200 hover:border-violet-400 hover:shadow-lg transition-all duration-200"
                                                >
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                            </svg>
                                                        </div>
                                                        <span className="text-xs px-2 py-1 bg-violet-200 text-violet-700 rounded-full font-medium">ORG</span>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-violet-700 transition-colors">
                                                        Organization Administration
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mb-4 group-hover:text-gray-700">
                                                        Manage sponsors, CROs, and organizational hierarchy
                                                    </p>
                                                    <div className="flex items-center text-violet-600 text-sm font-medium group-hover:text-violet-700">
                                                        Get Started
                                                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </Link>
                                            )}

                                            {hasModuleAccess('user-management') && (
                                                <Link
                                                    to="/user-management/sites"
                                                    className="group relative p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border-2 border-amber-200 hover:border-amber-400 hover:shadow-lg transition-all duration-200"
                                                >
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                                                            </svg>
                                                        </div>
                                                        <span className="text-xs px-2 py-1 bg-amber-200 text-amber-700 rounded-full font-medium">SITES</span>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-amber-700 transition-colors">
                                                        Site Operations Management
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mb-4 group-hover:text-gray-700">
                                                        Manage clinical sites, activation & study associations
                                                    </p>
                                                    <div className="flex items-center text-amber-600 text-sm font-medium group-hover:text-amber-700">
                                                        Get Started
                                                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </Link>
                                            )}
                                        </div>
                                    </div>

                                    {/* Getting Started Guide */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Quick Start Guide */}
                                        <div className="bg-white rounded-xl shadow-lg p-8">
                                            <div className="flex items-center mb-6">
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                </div>
                                                <h2 className="text-xl font-bold text-gray-900">Quick Start Guide</h2>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-start">
                                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">1</div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 mb-1">Design Your Protocol</h4>
                                                        <p className="text-sm text-gray-600">Use the CRF builder to create case report forms</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start">
                                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">2</div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 mb-1">Build Your Database</h4>
                                                        <p className="text-sm text-gray-600">Deploy study databases with automated validation</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start">
                                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">3</div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 mb-1">Set Up Organizations & Sites</h4>
                                                        <p className="text-sm text-gray-600">Configure sponsors, CROs, and activate clinical sites</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start">
                                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">4</div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 mb-1">Configure Users & Access</h4>
                                                        <p className="text-sm text-gray-600">Create users, assign roles, and grant study access</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start">
                                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">5</div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 mb-1">Start Data Capture</h4>
                                                        <p className="text-sm text-gray-600">Begin enrolling subjects and capturing clinical data</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Resources & Support */}
                                        <div className="bg-white rounded-xl shadow-lg p-8">
                                            <div className="flex items-center mb-6">
                                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                    </svg>
                                                </div>
                                                <h2 className="text-xl font-bold text-gray-900">Resources & Support</h2>
                                            </div>

                                            <div className="space-y-3">
                                                <a href="#" className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group">
                                                    <div className="flex items-center">
                                                        <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        <span className="font-medium text-gray-900">User Documentation</span>
                                                    </div>
                                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </a>

                                                <a href="#" className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group">
                                                    <div className="flex items-center">
                                                        <svg className="w-5 h-5 text-green-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                        </svg>
                                                        <span className="font-medium text-gray-900">Video Tutorials</span>
                                                    </div>
                                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </a>

                                                <a href="#" className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group">
                                                    <div className="flex items-center">
                                                        <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span className="font-medium text-gray-900">Help Center & FAQ</span>
                                                    </div>
                                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </a>

                                                <a href="#" className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group">
                                                    <div className="flex items-center">
                                                        <svg className="w-5 h-5 text-orange-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                                        </svg>
                                                        <span className="font-medium text-gray-900">Contact Support</span>
                                                    </div>
                                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    {/* System Information Footer */}
                                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl shadow p-6">
                                        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                                    <span className="text-sm font-medium text-gray-700">All Systems Operational</span>
                                                </div>
                                                <div className="h-4 w-px bg-gray-300"></div>
                                                <span className="text-sm text-gray-600">Last sync: 2 mins ago</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-xs text-gray-600">
                                                <span>Platform Version: 2.1.0</span>
                                                <div className="h-3 w-px bg-gray-300"></div>
                                                <span>© 2025 ClinPrecision</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            } />

                            <Route path="/study-design/*" element={<StudyDesignModule />} />
                            <Route path="/datacapture-management/*" element={<DataCaptureModule />} />
                            <Route path="/dq-management" element={<DQManagement />} />

                            {/* New Module Routes - Phase 2 Implementation */}
                            <Route path="/identity-access/*" element={<IdentityAccessModule />} />
                            <Route path="/organization-admin/*" element={<OrganizationAdminModule />} />
                            <Route path="/site-operations/*" element={<SiteOperationsModule />} />

                            {/* Legacy Routes - Deprecated (Remove after 3 months) */}
                            <Route path="/user-management/*" element={<AdminModule />} />

                            {/* Subject Management Module */}
                            <Route path="/subject-management/*" element={<SubjectManagementModule />} />

                            {/* Placeholder routes for new modules */}
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
}