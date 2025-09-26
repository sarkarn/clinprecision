import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export default function HomeEnhanced() {
    return (
        <div className="flex h-screen bg-gray-50">
            {/* Enhanced EDC Navigation Sidebar */}
            <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-lg border-r border-gray-200">
                <div className="flex flex-col h-full">
                    {/* Enhanced Header with EDC Branding */}
                    <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-blue-600 to-blue-700 shadow-md">
                        <div className="flex items-center">
                            <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-sm">
                                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h1 className="text-lg font-bold text-white">ClinPrecision</h1>
                                <p className="text-xs text-blue-100">Electronic Data Capture</p>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Navigation Content */}
                    <div className="flex-1 px-4 py-6 overflow-y-auto">
                        {/* Study Management Section */}
                        <div className="mb-8">
                            <h2 className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-4 px-2 flex items-center">
                                <svg className="w-3 h-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Study Management
                            </h2>
                            <div className="space-y-1">
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
                            </div>
                        </div>

                        {/* Clinical Operations Section */}
                        <div className="mb-8">
                            <h2 className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-4 px-2 flex items-center">
                                <svg className="w-3 h-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Clinical Operations
                            </h2>
                            <div className="space-y-1">
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
                                <Link to="/patient-management" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-700 transition-all duration-200 border border-transparent hover:border-green-200">
                                    <div className="flex items-center justify-center h-5 w-5 mr-3 text-green-400 group-hover:text-green-600">
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div>Subject Management</div>
                                        <div className="text-xs text-gray-500 group-hover:text-green-500">Patient enrollment & tracking</div>
                                    </div>
                                    <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded-full group-hover:bg-green-200">EDC</span>
                                </Link>
                            </div>
                        </div>

                        {/* Data Quality & Compliance Section */}
                        <div className="mb-8">
                            <h2 className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-4 px-2 flex items-center">
                                <svg className="w-3 h-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                </svg>
                                Data Quality & Compliance
                            </h2>
                            <div className="space-y-1">
                                <Link to="/dq-management" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 border border-transparent hover:border-purple-200">
                                    <div className="flex items-center justify-center h-5 w-5 mr-3 text-purple-400 group-hover:text-purple-600">
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div>Data Quality & Validation</div>
                                        <div className="text-xs text-gray-500 group-hover:text-purple-500">Edit checks & data cleaning</div>
                                    </div>
                                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded-full group-hover:bg-purple-200">SDV</span>
                                </Link>
                                <Link to="/audit-trail" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 border border-transparent hover:border-purple-200">
                                    <div className="flex items-center justify-center h-5 w-5 mr-3 text-purple-400 group-hover:text-purple-600">
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div>Audit Trail & Compliance</div>
                                        <div className="text-xs text-gray-500 group-hover:text-purple-500">Regulatory compliance tracking</div>
                                    </div>
                                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded-full group-hover:bg-purple-200">21 CFR</span>
                                </Link>
                            </div>
                        </div>

                        {/* Clinical Analytics Section */}
                        <div className="mb-8">
                            <h2 className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-4 px-2 flex items-center">
                                <svg className="w-3 h-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Clinical Analytics
                            </h2>
                            <div className="space-y-1">
                                <Link to="/reports" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-all duration-200 border border-transparent hover:border-orange-200">
                                    <div className="flex items-center justify-center h-5 w-5 mr-3 text-orange-400 group-hover:text-orange-600">
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div>Clinical Reports</div>
                                        <div className="text-xs text-gray-500 group-hover:text-orange-500">Generate study reports</div>
                                    </div>
                                    <span className="text-xs px-2 py-1 bg-orange-100 text-orange-600 rounded-full group-hover:bg-orange-200">CSR</span>
                                </Link>
                                <Link to="/medical-coding" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-all duration-200 border border-transparent hover:border-orange-200">
                                    <div className="flex items-center justify-center h-5 w-5 mr-3 text-orange-400 group-hover:text-orange-600">
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div>Medical Coding</div>
                                        <div className="text-xs text-gray-500 group-hover:text-orange-500">MedDRA & WHO-DD coding</div>
                                    </div>
                                    <span className="text-xs px-2 py-1 bg-orange-100 text-orange-600 rounded-full group-hover:bg-orange-200">AE</span>
                                </Link>
                            </div>
                        </div>

                        {/* System Integration Section */}
                        <div>
                            <h2 className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-4 px-2 flex items-center">
                                <svg className="w-3 h-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                System Integration
                            </h2>
                            <div className="space-y-1">
                                <Link to="/data-integration" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200 border border-transparent hover:border-indigo-200">
                                    <div className="flex items-center justify-center h-5 w-5 mr-3 text-indigo-400 group-hover:text-indigo-600">
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div>Data Integration</div>
                                        <div className="text-xs text-gray-500 group-hover:text-indigo-500">External system connectivity</div>
                                    </div>
                                    <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-600 rounded-full group-hover:bg-indigo-200">API</span>
                                </Link>
                                <Link to="/system-monitoring" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200 border border-transparent hover:border-indigo-200">
                                    <div className="flex items-center justify-center h-5 w-5 mr-3 text-indigo-400 group-hover:text-indigo-600">
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div>System Monitoring</div>
                                        <div className="text-xs text-gray-500 group-hover:text-indigo-500">Performance & health monitoring</div>
                                    </div>
                                    <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-600 rounded-full group-hover:bg-indigo-200">SLA</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Footer with System Status */}
                    <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center text-xs text-gray-500">
                                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                System Online
                            </div>
                            <div className="text-xs text-gray-400">v2.1.0</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="ml-72 flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}