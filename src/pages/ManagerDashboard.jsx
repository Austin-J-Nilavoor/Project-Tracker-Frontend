import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/ManagerDashboard.css';
import { formatDayMonth } from '../utils/dateFormater';

// Hook
import { useManagerDashboard } from '../features/manager/hooks/useManagerDashboard';

// Components
import Header from '../components/Header';
import Breadcrumbs from '../components/BreadCrumbs';
import StatsGrid from '../features/manager/components/StatsGrid';
import ActiveProjectsTable from '../features/manager/components/ActiveProjectsTable';
import AvailabilityChart from '../features/manager/components/AvailabilityChart';
import AddProjectModal from '../features/projects/modals/AddProjectModal';

const UpcomingDeadlines = ({ deadlines }) => (
    <div className="panel-card deadlines-card">
        <h2 className="panel-title-small">Upcoming Deadlines</h2>
        <ul className="deadline-list">
            {deadlines && deadlines.length > 0 ? (
                deadlines.map(project => (
                    <li key={project.id} className="deadline-item">
                        {/* Truncate long names if needed */}
                        <span title={project.name} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                            {project.name}
                        </span>
                        <span className="deadline-date">{formatDayMonth(project.endDate)}</span>
                    </li>
                ))
            ) : (
                <li className="deadline-item" style={{ fontStyle: 'italic', color: '#9ca3af' }}>
                    No upcoming deadlines.
                </li>
            )}
        </ul>
    </div>
);

const ManagerDashboard = () => {
    const { user } = useAuth();
    const [showAddProject, setShowAddProject] = useState(false);
    
    // Custom Hook handles all data fetching and processing
    const { projects, loading, error, metrics, refreshData } = useManagerDashboard();

    // --- Derived State: Upcoming Deadlines ---
    const upcomingDeadlines = useMemo(() => {
        if (!projects) return [];
        
        // 1. Filter out Completed projects and those without dates
        // 2. Sort by End Date (Ascending - soonest first)
        // 3. Take top 4
        return projects
            .filter(p => p.status !== 'COMPLETED' && p.endDate)
            .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
            .slice(0, 4);
    }, [projects]);

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
                        {/* Pass the calculated deadlines here */}
                        <UpcomingDeadlines deadlines={upcomingDeadlines} />
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