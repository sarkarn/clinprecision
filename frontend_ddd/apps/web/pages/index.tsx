import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Home component with SSR disabled
const Home = dynamic(() => import('../src/routes/Home'), {
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

const HomePage = () => {
  return <Home />;
};

export default HomePage;
