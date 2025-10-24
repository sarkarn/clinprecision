import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './components/login/AuthContext';
import { StudyProvider } from './contexts/StudyContext';
import Login from './components/login/Login';
import ProtectedRoute from './components/login/ProtectedRoute';
import Home from './components/home';


function AppContent() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-100">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/*" element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    } />
                    {/* Legacy redirect: forward old /admin paths to new /user-management */}
                    <Route path="/admin/*" element={<Navigate to="/user-management" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <StudyProvider>
                <AppContent />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#363636',
                            color: '#fff',
                        },
                        success: {
                            duration: 3000,
                            iconTheme: {
                                primary: '#10b981',
                                secondary: '#fff',
                            },
                        },
                        error: {
                            duration: 5000,
                            iconTheme: {
                                primary: '#ef4444',
                                secondary: '#fff',
                            },
                        },
                    }}
                />
            </StudyProvider>
        </AuthProvider>
    );
}
