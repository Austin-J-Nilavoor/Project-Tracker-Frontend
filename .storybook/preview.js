import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import '../src/index.css';
import '../src/App.css';
// Import specific component styles if they aren't imported in index.css
import '../src/styles/AdminDashboard.css';
import '../src/styles/Header.css';
import '../src/styles/ManagerDashboard.css';
import '../src/styles/ProjectDetails.css';
import '../src/styles/ProjectList.css';
import '../src/styles/TaskBoard.css';

// Mock Auth Context for components that use useAuth()
import { AuthContext } from '../src/context/AuthContext';

const mockUser = {
  name: 'Demo User',
  role: 'MANAGER',
  id: '1',
  email: 'demo@example.com'
};

const MockAuthProvider = ({ children }) => (
  <AuthContext.Provider value={{ 
    user: mockUser, 
    isAuthenticated: true, 
    logout: () => alert('Logout clicked'),
    hasRole: (role) => role === mockUser.role
  }}>
    {children}
  </AuthContext.Provider>
);

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  // Wrap stories in Router and Auth Provider
  decorators: [
    (Story) => (
      <BrowserRouter>
        <MockAuthProvider>
          <Story />
        </MockAuthProvider>
      </BrowserRouter>
    ),
  ],
};

export default preview;