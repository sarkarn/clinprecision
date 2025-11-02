import type { AppProps } from 'next/app';
import '../src/styles/index.css';
import dynamic from 'next/dynamic';
import React from 'react';
import { AuthProvider } from '../../../packages/domains/identity-access/src/ui/login/AuthContext';
import { StudyProvider } from '../../../packages/shared/src/context/StudyContext';
import { Toaster } from 'react-hot-toast';

// Wrapper component for BrowserRouter
const RouterWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <>{children}</>;
  }

  // Dynamically import BrowserRouter only on client side
  const { BrowserRouter } = require('react-router-dom');
  return <BrowserRouter>{children}</BrowserRouter>;
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <RouterWrapper>
      <AuthProvider>
        <StudyProvider>
          <Component {...pageProps} />
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
    </RouterWrapper>
  );
}

export default MyApp;
