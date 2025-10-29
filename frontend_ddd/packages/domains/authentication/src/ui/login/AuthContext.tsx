// ...existing code from AuthContext.tsx (legacy location) will be placed here...
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
    email: string;
    role: string;
    userId?: string;
    userNumericId?: string;
    token?: string;
    name?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, role: string, userData?: any) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userId');
        const userNumericId = localStorage.getItem('userNumericId');
        const userEmail = localStorage.getItem('userEmail');
        const userRole = localStorage.getItem('userRole');
        const userName = localStorage.getItem('userName');

        // Only restore user if we have valid authentication data
        if (token && userId && userEmail && userRole) {
            setUser({
                email: userEmail,
                role: userRole,
                userId, // String username
                userNumericId: userNumericId || undefined, // Long numeric ID
                token,
                name: userName || userEmail // User's display name
            });
        } else {
            // Clear invalid/incomplete session data
            localStorage.removeItem('authToken');
            localStorage.removeItem('userId');
            localStorage.removeItem('userNumericId');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userName');
            localStorage.removeItem('tokenExpiration');
        }

        // Mark loading as complete after checking localStorage
        setIsLoading(false);
    }, []);

    const login = (email: string, role: string, userData?: any): boolean => {
        const newUser: User = {
            email,
            role,
            ...userData
        };
        setUser(newUser);

        // Store email in localStorage
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userRole', role);

        return true;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userNumericId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('tokenExpiration');
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
