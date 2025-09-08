import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');
    const userRole = localStorage.getItem('userRole');

    if (token && userId) {
      setUser({
        email: userEmail || 'user@example.com',
        role: userRole || 'USER',
        userId,
        token
      });
    }
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
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('tokenExpiration');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
