import { Link, Routes, Route } from "react-router-dom";
import Logout from "./login/Logout";
import TopNavigationHeader from "./shared/TopNavigationHeader";
import StudyDesignModule from "./modules/trialdesign/StudyDesignModule";
import DataCaptureModule from "./modules/datacapture/DataCaptureModule";
import DQManagement from "./modules/dqmgmt/DQManagement";
import AdminModule from "./modules/admin/AdminModule";
import { useAuth } from "./login/AuthContext";

export default function Home() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Top Navigation Header - now reusable */}
            <TopNavigationHeader showFullNavigation={true} />

            <div className="flex flex-1">
                {/* Side Nav Bar - Enhanced professional design */}
                <nav className="w-64 bg-white border-r border-gray-200 shadow-sm h-[calc(100vh-64px)] sticky top-16 flex flex-col">
                    {/* Logo/Brand Section */}
                    <div className="px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center">
                            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-sm font-semibold text-gray-800">Workspace</span>
                        </div>
                    </div>

                    {/* Navigation Content */}
                    <div className="flex-1 px-4 py-4 overflow-y-auto">
                        {/* Main Modules Section */}
                        <div className="mb-8">
                            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
                                Core Modules
                            </h2>
                            <div className="space-y-1">
                                <Link to="/study-design" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200">
                                    <div className="flex items-center justify-center h-5 w-5 mr-3 text-gray-400 group-hover:text-blue-600">
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                        </svg>
                                    </div>
                                    Study Design
                                </Link>
                                <Link to="/datacapture-management" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200">
                                    <div className="flex items-center justify-center h-5 w-5 mr-3 text-gray-400 group-hover:text-blue-600">
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                        </svg>
                                    </div>
                                    Data Capture
                                </Link>
                                <Link to="/dq-management" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200">
                                    <div className="flex items-center justify-center h-5 w-5 mr-3 text-gray-400 group-hover:text-blue-600">
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                        </svg>
                                    </div>
                                    Data Quality & Cleaning
                                </Link>
                                <Link to="/user-management" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200">
                                    <div className="flex items-center justify-center h-5 w-5 mr-3 text-gray-400 group-hover:text-blue-600">
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0011.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                        </svg>
                                    </div>
                                    Administration
                                </Link>
                            </div>
                        </div>

                        {/* Additional Tools Section */}
                        <div>
                            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
                                Additional Tools
                            </h2>
                            <div className="space-y-1">
                                <Link to="/medical-coding" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200">
                                    <div className="flex items-center justify-center h-5 w-5 mr-3 text-gray-400 group-hover:text-blue-600">
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                                        </svg>
                                    </div>
                                    Medical Coding & Standardization
                                </Link>
                                <Link to="/data-integration" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200">
                                    <div className="flex items-center justify-center h-5 w-5 mr-3 text-gray-400 group-hover:text-blue-600">
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                                        </svg>
                                    </div>
                                    Data Integration
                                </Link>
                                <Link to="/reports" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200">
                                    <div className="flex items-center justify-center h-5 w-5 mr-3 text-gray-400 group-hover:text-blue-600">
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                        </svg>
                                    </div>
                                    Reporting & Exports
                                </Link>
                                <Link to="/archival" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200">
                                    <div className="flex items-center justify-center h-5 w-5 mr-3 text-gray-400 group-hover:text-blue-600">
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                        </svg>
                                    </div>
                                    Database Lock & Archival
                                </Link>
                                <Link to="/monitoring-oversight" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200">
                                    <div className="flex items-center justify-center h-5 w-5 mr-3 text-gray-400 group-hover:text-blue-600">
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    Monitoring & Oversight
                                </Link>
                                <Link to="/regulatory-compliance" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200">
                                    <div className="flex items-center justify-center h-5 w-5 mr-3 text-gray-400 group-hover:text-blue-600">
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                                        </svg>
                                    </div>
                                    Regulatory Compliance
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Footer section */}
                    <div className="px-4 py-3 border-t border-gray-100">
                        <div className="text-xs text-gray-500 text-center">
                            ClinPrecision v2.1.0
                        </div>
                    </div>
                </nav>

                {/* Main Content - Better spacing and card-based layout */}
                <main className="flex-1 p-6">
                    <Routes>
                        <Route index element={
                            <div className="max-w-4xl mx-auto">
                                {/* Keep existing dashboard content */}
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Welcome to ClinicalConnect</h2>

                                <div className="bg-white shadow-sm rounded-lg p-6 mb-8 border border-gray-200">
                                    <h3 className="text-lg font-semibold mb-3">Getting Started</h3>
                                    <p className="text-gray-600 mb-4">
                                        Select a module from the sidebar to get started with your clinical trial management tasks.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                        <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                                            <h4 className="font-medium text-blue-700 mb-2">Study Design</h4>
                                            <p className="text-sm text-gray-600">Set up studies, define visits, and create CRFs</p>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-md border border-green-100">
                                            <h4 className="font-medium text-green-700 mb-2">Data Collection</h4>
                                            <p className="text-sm text-gray-600">Manage subjects and collect study data</p>
                                        </div>
                                        <div className="bg-purple-50 p-4 rounded-md border border-purple-100">
                                            <h4 className="font-medium text-purple-700 mb-2">Quality Control</h4>
                                            <p className="text-sm text-gray-600">Manage queries and ensure data quality</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
                                    <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
                                    <div className="border-t border-gray-200 pt-3">
                                        <ul className="divide-y divide-gray-200">
                                            <li className="py-3 flex justify-between">
                                                <span className="text-sm text-gray-600">Study ABC-123 updated</span>
                                                <span className="text-xs text-gray-500">2 hours ago</span>
                                            </li>
                                            <li className="py-3 flex justify-between">
                                                <span className="text-sm text-gray-600">New query created</span>
                                                <span className="text-xs text-gray-500">Yesterday</span>
                                            </li>
                                            <li className="py-3 flex justify-between">
                                                <span className="text-sm text-gray-600">Subject enrollment completed</span>
                                                <span className="text-xs text-gray-500">3 days ago</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        } />

                        {/* Main modules routes */}
                        <Route path="study-design/*" element={<StudyDesignModule />} />
                        <Route path="datacapture-management/*" element={<DataCaptureModule />} />
                        <Route path="dq-management/*" element={<DQManagement />} />
                        <Route path="user-management/*" element={<AdminModule />} />

                        {/* Additional tools routes - you'll need to import these components */}
                        <Route path="medical-coding/*" element={<div className="p-6"><h2 className="text-2xl font-bold mb-4">Medical Coding & Standardization Module</h2><p>Medical coding and standardization functionality will be implemented here.</p></div>} />
                        <Route path="data-integration/*" element={<div className="p-6"><h2 className="text-2xl font-bold mb-4">Data Integration Module</h2><p>Data integration functionality will be implemented here.</p></div>} />
                        <Route path="reports/*" element={<div className="p-6"><h2 className="text-2xl font-bold mb-4">Reports & Exports</h2><p>Reporting functionality will be implemented here.</p></div>} />
                        <Route path="archival/*" element={<div className="p-6"><h2 className="text-2xl font-bold mb-4">Database Lock & Archival</h2><p>Archival functionality will be implemented here.</p></div>} />
                        <Route path="monitoring-oversight/*" element={<div className="p-6"><h2 className="text-2xl font-bold mb-4">Monitoring & Oversight</h2><p>Study monitoring and oversight functionality will be implemented here.</p></div>} />
                        <Route path="regulatory-compliance/*" element={<div className="p-6"><h2 className="text-2xl font-bold mb-4">Regulatory Compliance</h2><p>Regulatory compliance and audit trail functionality will be implemented here.</p></div>} />

                        {/* Static content pages */}
                        <Route path="help" element={<div className="p-6"><h2 className="text-2xl font-bold mb-4">Documentation</h2><p>Help and documentation will be provided here.</p></div>} />
                        <Route path="about" element={<div className="p-6"><h2 className="text-2xl font-bold mb-4">About ClinicalConnect</h2><p>Information about the platform will be displayed here.</p></div>} />
                        <Route path="contact" element={<div className="p-6"><h2 className="text-2xl font-bold mb-4">Contact Us</h2><p>Contact information and form will be available here.</p></div>} />

                        {/* Admin route - conditionally rendered in the sidebar based on user role */}
                        <Route path="admin/*" element={<div className="p-6"><h2 className="text-2xl font-bold mb-4">Administration</h2><p>Administrative functions will be accessible here.</p></div>} />

                        {/* Fallback for undefined routes */}
                        <Route path="*" element={<div className="p-6 text-center"><h2 className="text-2xl font-bold mb-4">Page Not Found</h2><p>The page you're looking for doesn't exist.</p></div>} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}