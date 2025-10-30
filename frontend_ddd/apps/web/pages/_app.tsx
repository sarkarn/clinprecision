import type { AppProps } from 'next/app';
import '../src/index.css';
import { AuthProvider } from '../../../packages/domains/authentication/src/ui/login/AuthContext';
import { StudyProvider } from '../../../packages/shared/src/context/StudyContext';
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps }: AppProps) {
  return (
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
  );
}

export default MyApp;
