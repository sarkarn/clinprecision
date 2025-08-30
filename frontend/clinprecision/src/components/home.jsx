import { Link, Routes, Route } from "react-router-dom";
import Logout from "./login/Logout";
import StudyDesignModule from "./modules/trialdesign/StudyDesignModule";
import SubjectManagement from "./modules/subjectmgmt/SubjectManagement";
import QueryManagement from "./modules/querymgmt/QueryManagement";
import { useAuth } from "./login/AuthContext";

export default function Home() {
    const { user } = useAuth();
    return (
        <div className="min-h-screen flex flex-col">
            {/* Top Menu Bar */}
            <header className="bg-white shadow flex justify-between items-center px-8 py-4">
                <div className="flex items-center space-x-6">
                    <h1 className="text-xl font-bold text-blue-600">ClinicalConnect</h1>
                    <Link to="/reports" className="text-gray-700 hover:text-blue-600">Reports</Link>
                    <Link to="/help" className="text-gray-700 hover:text-blue-600">Documentation</Link>
                    {user?.role === 'admin' && (
                        <Link to="/admin" className="text-gray-700 hover:text-blue-600">Administration</Link>
                    )}
                </div>
                <div className="flex items-center space-x-4">
                    {user && (
                        <>
                            <span className="text-gray-600">{user.username || user.email}</span>
                            <Logout />
                        </>
                    )}
                </div>
            </header>
            <div className="flex flex-1">
                {/* Side Nav Bar */}
                <nav className="w-64 bg-gray-100 p-6 flex flex-col space-y-4 shadow">
                    <Link to="/study-design" className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded">
                        Study Design
                    </Link>
                    <Link to="/subject-management" className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded">
                        Subject Management
                    </Link>
                    <Link to="/query-management" className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded">
                        Query Management
                    </Link>
                </nav>
                {/* Main Content */}
                <main className="flex-1 p-10">
                    <Routes>
                        <Route index element={
                            <>
                                <h2 className="text-3xl font-bold mb-6">Welcome to ClinicalConnect</h2>
                                <p className="text-lg mb-4">
                                    Select a module from the sidebar to get started.
                                </p>
                            </>
                        } />
                        <Route path="study-design/" element={<StudyDesignModule />} />
                        <Route path="subject-management/" element={<SubjectManagement />} />
                        <Route path="query-management/" element={<QueryManagement />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}