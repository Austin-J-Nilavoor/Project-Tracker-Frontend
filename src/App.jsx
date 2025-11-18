import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Auth/Login';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import ManagerDashboard from './pages/Dashboard/Dashboard';
import ProjectDetails from './pages/Projects/ProjectDetails';
import TaskBoard from './pages/Tasks/TaskView';
import Header from './components/Header.jsx';
import AccessDenied from './components/AccessDenied.jsx';
import NotFound from './components/NotFound.jsx';
import ProjectList from './pages/Projects/ProjectList.jsx';

function App() {
  const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
    
      return <Navigate to="/login" replace />;
    }

    // Check for role-based access
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <AccessDenied />
    }

    return children;
  };
  // Add this component in App.jsx
  const RoleBasedRedirect = () => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (user.role === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    } else if (user.role === 'MANAGER') {
      return <Navigate to="/manager" replace />;
    } else if (user.role === 'EMPLOYEE') {
      return <Navigate to="/employee" replace />;
    }

    return <Navigate to="/login" replace />;
  };

  // Then update the default route:

  return (
    <>

      <Router>
        <AuthProvider>
          <main>
            {/* {isVisible && <Header
              title="Add New Project"
              onClick={() => console.log("Navigate to Project Creation")}
              showSearch={true}
            />} */}

            <Routes>
              <Route path="/" element={<RoleBasedRedirect />} />
              {/* Public Route */}
              <Route path="/login" element={<Login  />} />


              {/* Protected Routes */}
              <Route path="/manager" element={
                <ProtectedRoute allowedRoles={['MANAGER']}>
                  <ManagerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/projects" exact element={
                <ProtectedRoute allowedRoles={['MANAGER']}>
                  <ProjectList />
                </ProtectedRoute>
              } />
              <Route path="/tasks" element={
                <ProtectedRoute allowedRoles={['MANAGER']}>
                  <TaskBoard />
                </ProtectedRoute>
              } />
              <Route path="/projects/:projectId" element={
                <ProtectedRoute allowedRoles={['MANAGER']}>
                  <ProjectDetails />
                </ProtectedRoute>
              } />
              <Route path="/tasks" element={
                <ProtectedRoute allowedRoles={['MANAGER']}>
                  <TaskBoard />
                </ProtectedRoute>
              } />
              <Route path="/projects/:projectId/tasks" element={
                <ProtectedRoute allowedRoles={['MANAGER']}>
                  <TaskBoard />
                </ProtectedRoute>
              } />
              {/* Future Admin/Manager Routes */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard /> {/* Placeholder for Admin management page */}
                </ProtectedRoute>
              } />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </AuthProvider>
      </Router>
    </>
  )
}

export default App
