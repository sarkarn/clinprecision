import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
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
        userNumericId, // Long numeric ID
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

  const login = (email, role, userData) => {
    const newUser = {
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

export function useAuth() {
  return useContext(AuthContext);
}
