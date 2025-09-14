import { Link, Routes, Route } from "react-router-dom";
import Logout from "./login/Logout";
import TopNavigationHeader from "./shared/TopNavigationHeader";
import StudyDesignModule from "./modules/trialdesign/StudyDesignModule";
import DataCaptureModule from "./modules/datacapture/DataCaptureModule";
import DQManagement from "./modules/dqmgmt/DQManagement";
import UserManagementModule from "./modules/usermanagement/UserManagementModule";
import { useAuth } from "./login/AuthContext";

export default function Home() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Top Navigation Header - now reusable */}
            <TopNavigationHeader showFullNavigation={true} />

            <div className="flex flex-1">
                {/* Side Nav Bar - More visually distinct */}
                <nav className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col shadow-sm h-[calc(100vh-64px)] sticky top-16">
                    <div className="mb-6">
                        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            Main Modules
                        </h2>
                        <div className="space-y-1">
                            <Link to="/study-design" className="flex items-center text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-4 py-2 rounded-md transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Study Design
                            </Link>
                            <Link to="/datacapture-management" className="flex items-center text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-4 py-2 rounded-md transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Data Capture
                            </Link>
                            <Link to="/dq-management" className="flex items-center text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-4 py-2 rounded-md transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Data Quality Management
                            </Link>
                            <Link to="/user-management" className="flex items-center text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-4 py-2 rounded-md transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                Administration
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            Additional Tools
                        </h2>
                        <div className="space-y-1">
                            <Link to="/medical-coding" className="flex items-center text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-4 py-2 rounded-md transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                Medical Coding
                            </Link>
                            <Link to="/data-integration" className="flex items-center text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-4 py-2 rounded-md transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                </svg>
                                Data Integration
                            </Link>
                            <Link to="/reports" className="flex items-center text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-4 py-2 rounded-md transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Reporting & Exports
                            </Link>
                            <Link to="/archival" className="flex items-center text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-4 py-2 rounded-md transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                                Database Lock & Archival
                            </Link>
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
                        <Route path="user-management/*" element={<UserManagementModule />} />

                        {/* Additional tools routes - you'll need to import these components */}
                        <Route path="medical-coding/*" element={<div className="p-6"><h2 className="text-2xl font-bold mb-4">Medical Coding Module</h2><p>Medical coding functionality will be implemented here.</p></div>} />
                        <Route path="data-integration/*" element={<div className="p-6"><h2 className="text-2xl font-bold mb-4">Data Integration Module</h2><p>Data integration functionality will be implemented here.</p></div>} />
                        <Route path="reports/*" element={<div className="p-6"><h2 className="text-2xl font-bold mb-4">Reports & Exports</h2><p>Reporting functionality will be implemented here.</p></div>} />
                        <Route path="archival/*" element={<div className="p-6"><h2 className="text-2xl font-bold mb-4">Database Lock & Archival</h2><p>Archival functionality will be implemented here.</p></div>} />

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