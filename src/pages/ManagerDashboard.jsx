import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/ManagerDashboard.css';

// Hook
import { useManagerDashboard } from '../features/manager/hooks/useManagerDashboard';

// Components
import Header from '../components/Header';
import Breadcrumbs from '../components/BreadCrumbs';
import StatsGrid from '../features/manager/components/StatsGrid';
import ActiveProjectsTable from '../features/manager/components/ActiveProjectsTable';
import AvailabilityChart from '../features/manager/components/AvailabilityChart';
import AddProjectModal from '../features/projects/modals/AddProjectModal';

const UpcomingDeadlines = () => (
    <div className="panel-card deadlines-card">
        <h2 className="panel-title-small">Upcoming Deadlines</h2>
        <ul className="deadline-list">
            <li className="deadline-item"><span>Helios Data Migration</span><span className="deadline-date">Nov 30</span></li>
            <li className="deadline-item"><span>Titan API Integration</span><span className="deadline-date">Dec 05</span></li>
            <li className="deadline-item"><span>Orion Platform V2</span><span className="deadline-date">Dec 15</span></li>
            <li className="deadline-item"><span>Project Phoenix</span><span className="deadline-date">Dec 28</span></li>
        </ul>
    </div>
);

const ManagerDashboard = () => {
    const { user } = useAuth();
    const [showAddProject, setShowAddProject] = useState(false);
    
    // Custom Hook handles all data fetching and processing
    const { projects, loading, error, metrics, refreshData } = useManagerDashboard();

    if (!user) return <div className="loading-message">Loading user profile...</div>;

    return (
        <div className="dashboard-wrapper">
            <Header
                title="Add New Project"
                onClick={() => setShowAddProject(true)}
                showSearch={true}
            />
           

            <main className="main-content manager-layout">
                 <Breadcrumbs />
                <h1 className="greeting-title">Welcome, {user.name}! 👋</h1>
                <p className="greeting-subtitle">
                    IBU: {metrics ? metrics.ibuName : 'Loading...'}
                </p>

                {/* Metric Cards */}
                <StatsGrid counts={metrics?.counts} />

                <div className="content-grid">
                    {/* Left Panel: Projects */}
                    <ActiveProjectsTable 
                        projects={projects} 
                        loading={loading} 
                        error={error} 
                    />

                    {/* Right Panel: Availability & Deadlines */}
                    <div className="side-panel-grid">
                        <div className="panel-card availability-card">
                            <h2 className="panel-title-small">Employee Availability</h2>
                            <AvailabilityChart availability={metrics?.availability} />
                        </div>
                        <UpcomingDeadlines />
                    </div>
                </div>
            </main>

            {/* Modal */}
            {showAddProject && (
                <AddProjectModal 
                    onClose={() => setShowAddProject(false)} 
                    onSuccess={refreshData} 
                />
            )}
        </div>
    );
};

export default ManagerDashboard;