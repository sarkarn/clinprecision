/**
 * Template for implementing reusable header in other modules
 * 
 * Example for AdministrationModule, DataCaptureModule, etc.
 */

import { useLocation } from 'react-router-dom';
import TopNavigationHeader from './TopNavigationHeader';
// ... other imports

interface AdditionalLink {
    to: string;
    text: string;
}

const YourModule: React.FC = () => {
    const location = useLocation();

    // Check if module is being accessed directly or through Home
    const isDirectNavigation = !location.pathname.startsWith('/home');

    return (
        <div className={isDirectNavigation ? "min-h-screen flex flex-col" : ""}>
            {/* Show header only when navigated to directly, not when inside Home */}
            {isDirectNavigation && (
                <TopNavigationHeader
                    showFullNavigation={false}
                    className="fixed top-0 left-0 right-0"
                    additionalLinks={[
                        // Optional: Add module-specific navigation links
                        { to: '/module-specific-link', text: 'Module Feature' }
                    ]}
                />
            )}

            {/* Main Content Area */}
            <div className={`container mx-auto px-4 pb-4 flex-1 ${isDirectNavigation ? "mt-16" : "pt-0"
                }`}>
                {/* Your module content */}
                <h2 className="text-2xl font-bold mb-4">Your Module</h2>
                {/* ... rest of your component */}
            </div>
        </div>
    );
};

export default YourModule;
