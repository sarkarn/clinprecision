import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import components with SSR disabled
const ProtectedRoute = dynamic(() => import('../src/routes/ProtectedRoute'), { ssr: false });
const Home = dynamic(() => import('../src/routes/Home'), { ssr: false });

const LoadingPlaceholder = () => (
  <div className="flex items-center justify-center h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

const ProtectedPage = () => {
  return (
    <React.Suspense fallback={<LoadingPlaceholder />}>
      <ProtectedRoute requiredRole={undefined}>
        <Home />
      </ProtectedRoute>
    </React.Suspense>
  );
};

export default ProtectedPage;
