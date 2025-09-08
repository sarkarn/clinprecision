import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/login/AuthContext';
import Login from './components/login/Login';
import ProtectedRoute from './components/login/ProtectedRoute';
import Home from './components/home';
import StudyDesignModule from './components/modules/trialdesign/StudyDesignModule';
import UserManagementModule from './components/modules/usermanagement/UserManagementModule';


function AppContent() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-100">
                <Routes>
                    <Route path="/login" element={
                        <Login />} />
                    <Route path="/*" element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    } />
                </Routes>
            </div>
        </Router>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}
