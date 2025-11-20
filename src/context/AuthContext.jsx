import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Assuming this dependency is available
import api from '../services/api'; // Import the axios instance

// Define AuthContext outside the component
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // 1. Initialize loading to true
  const [loading, setLoading] = useState(true); 
  const navigate = useNavigate();

  // Load user data from localStorage on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');
    const id = localStorage.getItem('id');
    
    if (token && role && name && id) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          logout(); // Token expired
        } else {
          setUser({ token, role, name, id });
        }
      } catch (e) {
        // Handle case where token is malformed
        console.error("Failed to decode token on load:", e);
        logout();
      }
    }
    // 2. Set loading to false once the check is complete
    setLoading(false); 
  }, []);

const login = (authResponse) => {
  const { token, role, name,id } = authResponse;

  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
  localStorage.setItem('name', name);
   localStorage.setItem('id', id);

  setUser({ token, role, name, id });
  
  // Role-based navigation
  if (role === 'ADMIN') {
    navigate('/admin');
  } else if (role === 'MANAGER') {
    navigate('/manager');
  } else if (role === 'EMPLOYEE') {
    navigate('/projects'); // Add employee route if needed
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
    loading, // 3. Expose loading state
    login,
    logout,
    hasRole,
    isAdmin: user?.role === 'ADMIN',
    isManager: user?.role === 'MANAGER',
    isEmployee: user?.role === 'EMPLOYEE',
  }), [user, loading]); // Add loading to dependencies

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export the hook for easy consumption
export const useAuth = () => {
  return useContext(AuthContext);
};