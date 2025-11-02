import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Login component with SSR disabled
const Login = dynamic(() => import('@domains/identity-access/src/ui/login/Login'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  ),
});

const LoginPage = () => <Login />;

export default LoginPage;
