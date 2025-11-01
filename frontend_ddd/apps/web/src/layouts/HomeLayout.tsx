import React from "react";
import TopNavigationHeader from "@shared/ui/TopNavigationHeader";
import { useAuth } from "@domains/identity-access/src/ui/login/AuthContext";
import { useRoleBasedNavigation } from "@packages/hooks/useRoleBasedNavigation";

const HomeLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { hasModuleAccess, hasCategoryAccess, userRoleDisplay } = useRoleBasedNavigation();
    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar - same as Home.tsx */}
            <div className="w-80 bg-white shadow-lg border-r border-gray-200 overflow-y-auto">
                {/* ...sidebar content from Home.tsx... */}
                {/* For brevity, copy sidebar JSX from Home.tsx here */}
            </div>
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNavigationHeader />
                <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default HomeLayout;