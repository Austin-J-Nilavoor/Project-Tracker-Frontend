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

function App() {
  const [isVisible, setIsVisible] = useState(false)
  const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
      setIsVisible(false);
      return <Navigate to="/login" replace />;
    }

    // Check for role-based access
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <AccessDenied/>
    }

    return children;
  };
  return (
    <>

      <Router>
        <AuthProvider>
          <main>
            {isVisible && <Header
              title="Add New Project"
              onClick={() => console.log("Navigate to Project Creation")}
              showSearch={true}
            />}
            <Routes>
              {/* Public Route */}
              <Route path="/login" element={<Login setIsVisible={setIsVisible} />} />

              {/* Default Redirect */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Protected Routes */}
              <Route path="/manager" element={
                <ProtectedRoute allowedRoles={['MANAGER']}>
                  <ManagerDashboard />
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
