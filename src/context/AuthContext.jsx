import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Assuming this dependency is available
import api from '../services/api'; // Import the axios instance

// Define AuthContext outside the component
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Load user data from localStorage on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');
    
    if (token && role && name) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          logout(); // Token expired
        } else {
          setUser({ token, role, name });
        }
      } catch (e) {
        // Handle case where token is malformed
        console.error("Failed to decode token on load:", e);
        logout();
      }
    }
  }, []);

const login = (authResponse) => {
  const { token, role, name } = authResponse;

  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
  localStorage.setItem('name', name);

  setUser({ token, role, name });
  
  // Role-based navigation
  if (role === 'ADMIN') {
    navigate('/admin');
  } else if (role === 'MANAGER') {
    navigate('/manager');
  } else if (role === 'EMPLOYEE') {
    navigate('/employee'); // Add employee route if needed
  } else {
    navigate('/'); // Fallback
  }
};

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate('/login'); // Redirect to login page
  };

  const hasRole = (requiredRole) => {
    if (!user) return false;
    return user.role === requiredRole;
  };

  // Memoize the context value
  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    login,
    logout,
    hasRole,
    isAdmin: user?.role === 'ADMIN',
    isManager: user?.role === 'MANAGER',
    isEmployee: user?.role === 'EMPLOYEE',
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export the hook for easy consumption
export const useAuth = () => {
  return useContext(AuthContext);
};