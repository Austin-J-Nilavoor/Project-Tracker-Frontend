import { useContext } from 'react';
// Assuming the AuthContext itself is defined in AuthContext.jsx
import { AuthContext } from '../context/AuthContext'; 

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};