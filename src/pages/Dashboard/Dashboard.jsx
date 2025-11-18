import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext'; 
import projectService from '../../services/projectServices'; 
import { Briefcase, Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- MOCK DATA for Chart and Stats (Kept for UI layout, needs future API endpoint) ---
const MOCK_STATS = [
    { title: "Total Projects", value: 42, color: "blue" },
    { title: "Active Projects", value: 15, color: "orange" },
    { title: "Total Employees", value: 28, color: "green" },
    { title: "On-Time Completion", value: "92%", color: "indigo" },
];

const MOCK_AVAILABILITY = {
    total: 28,
    onProjects: 20,
    available: 5,
    onLeave: 3
};


// --- Helper Components ---

// Renders the progress bar and status tag for a project row
const StatusIndicator = ({ progress, status }) => {
    const statusClass = status.toLowerCase().replace(/_/g, '-'); 
    
    return (
        <div className="status-indicator-container">
            <div className="progress-bar-track">
                <div 
                    className={`progress-bar-fill progress-${statusClass}`} 
                    style={{ width: `${progress}%` }} 
                />
            </div>
            <span className={`status-badge status-${statusClass}`}>{status.replace(/_/g, ' ')}</span>
        </div>
    );
};

// Renders a single row in the Active Projects table
const ProjectRow = ({ project }) => {
    // Project status from backend (e.g., PENDING, IN_PROGRESS, COMPLETED)
    const displayStatus = project.status.toUpperCase().replace(/ /g, '_');

    // Assume 'MANAGER' name is flattened into the ProjectDto, or use a placeholder
    const managerName = project.managerName || "N/A"; // Using mock managerName for now
    
    // Use the actual backend data for Name and Deadline/EndDate
    const projectName = project.name;
    const deadline = project.endDate;
    
    // Mock the progress for now, as the backend ProjectDto doesn't include it.
    const mockProgress = (projectName.length * 5) % 100;
  const navigate = useNavigate();
    return (
        
        <div onClick={() => navigate(`/projects/${project.id}`)} className="project-row grid-cols-project-table">
            <div className="project-cell project-name">{projectName}</div>
            <div className="project-cell project-manager">{managerName}</div>
            <div className="project-cell project-progress">
                <StatusIndicator progress={mockProgress} status={displayStatus} />
            </div>
            <div className="project-cell project-deadline">{deadline}</div>
            <div className="project-cell project-status">
                <span className={`project-status-tag status-${displayStatus.toLowerCase().replace(/_/g, '-')}`}>{displayStatus.replace(/_/g, ' ')}</span>
            </div>
            <button onClick={() => navigate(`/projects/${project.id}`)}>View</button>

        </div>
    );
};

const StatCard = ({ title, value, color }) => {
    const colorClass = `stat-card-${color}`;
    return (
        <div className={`stat-card ${colorClass}`}>
            <p className="stat-title">{title}</p>
            <p className="stat-value">{value}</p>
        </div>
    );
};


const ManagerDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    // Use state to hold the real project data
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Data Fetching ---
    const fetchProjects = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // CALL API: Fetches projects relevant to the logged-in user's role/IBU
            const fetchedProjects = await projectService.getAllProjects();
            
            // NOTE: Since your ProjectDto doesn't include the manager's name or progress, 
            // we attach a placeholder manager name for the UI temporarily.
            const projectsForUI = fetchedProjects.map(p => ({
                ...p,
                managerName: user.name, // Manager's name is the current user
                // progress: p.progress (requires backend enhancement)
            }));

            setProjects(projectsForUI);
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Failed to load projects.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [user.name]);

    useEffect(() => {
        // Fetch projects whenever the component mounts or user data changes
        fetchProjects();
    }, [fetchProjects]);

    if (!user) return <div className="loading-message">Loading user profile...</div>;


    // --- Helper for Employee Availability Ring Chart (MOCK) ---
    const renderAvailabilityChart = () => {
        const total = MOCK_AVAILABILITY.total;
        const onProjects = MOCK_AVAILABILITY.onProjects;
        const available = MOCK_AVAILABILITY.available;
        // SVG math for circumference is 2 * pi * r (2 * 3.14 * 45 = 282.6)
        const circumference = 283; 
        const availablePercent = (available / total);
        const onProjectsPercent = (onProjects / total);
        
        // Calculate offsets to draw the arcs
        const availableDashoffset = circumference - (availablePercent * circumference);
        const onProjectsDasharray = onProjectsPercent * circumference;

        return (
            <div className="availability-chart-section">
                <div className="availability-chart-ring">
                    <svg viewBox="0 0 100 100">
                        {/* Background track */}
                        <circle className="chart-ring-bg" cx="50" cy="50" r="45" />
                        
                        {/* On Projects (Yellow arc) */}
                        <circle 
                            className="chart-ring-on-projects" 
                            cx="50" cy="50" r="45" 
                            style={{ strokeDasharray: onProjectsDasharray, strokeDashoffset: 0 }}
                        />

                        {/* Available (Green arc - starts after On Projects) */}
                        <circle 
                            className="chart-ring-available" 
                            cx="50" cy="50" r="45" 
                            style={{ strokeDasharray: circumference - onProjectsDasharray, strokeDashoffset: availableDashoffset }}
                        />

                        {/* Total Count */}
                        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="chart-ring-text">
                            {total}
                        </text>
                        <text x="50%" y="65%" dominantBaseline="middle" textAnchor="middle" className="chart-ring-label">
                            Total
                        </text>
                    </svg>
                </div>
                
                <div className="availability-legend">
                    <div>
                        <span className="legend-dot dot-on-projects"></span> On Projects ({onProjects})
                    </div>
                    <div>
                        <span className="legend-dot dot-available"></span> Available ({available})
                    </div>
                    <div>
                        <span className="legend-dot dot-on-leave"></span> On Leave ({MOCK_AVAILABILITY.onLeave})
                    </div>
                </div>
            </div>
        );
    };

    // --- Main Render ---

    return (
        <div className="dashboard-wrapper">
            {/* --- Header/Navbar --- */}
            {/* <header className="dashboard-header">
                <div className="logo-section">
                    <Briefcase className="logo-icon" />
                    <span className="logo-text">Project Tracker</span>
                </div>
                <div className="header-actions">
                    <div className="search-container search-header">
                        <Search className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search projects or employees..."
                            className="search-input"
                        />
                    </div>
                    <button 
                        onClick={() => console.log("New Project")}
                        className="btn btn-primary"
                    >
                        <Plus size={18} />
                        <span>Add New Project</span>
                    </button>
                    <button onClick={logout} className="user-avatar-button">
                         {user.name.charAt(0)}
                    </button>
                </div>
            </header> */}

            {/* --- Main Content Area --- */}
            <main className="main-content manager-layout">
                {/* Greeting & Subtitle (Uses real user name and IBU) */}
                <h1 className="greeting-title">Welcome, {user.name}! 👋</h1>
                <p className="greeting-subtitle">
                    IBU: {user.ibuName || 'N/A'}
                </p>
                
                {/* --- Row 1: Key Metrics (MOCK DATA) --- */}
                <div className="metrics-grid">
                    {MOCK_STATS.map(stat => (
                        <StatCard key={stat.title} {...stat} />
                    ))}
                </div>
                
                {/* --- Row 2: Main Content and Side Panel --- */}
                <div className="content-grid">
                    
                    {/* LEFT PANEL: Active Projects Table */}
                    <div className="active-projects-panel">
                        <h2 className="panel-title">Active Projects</h2>
                        
                        <div className="project-table-card">
                            
                            {/* Table Header */}
                            <div className="table-header grid-cols-project-table">
                                <span>PROJECT NAME</span>
                                <span>PROJECT MANAGER</span>
                                <span>PROGRESS</span>
                                <span>DEADLINE</span>
                                <span>STATUS</span>
                            </div>

                            {/* Table Body */}
                            <div className="table-body">
                                {loading ? (
                                    <div className="status-message">Fetching active projects...</div>
                                ) : error ? (
                                    <div className="error-box">{error}</div>
                                ) : projects.length === 0 ? (
                                    <div className="status-message">No active projects found in your IBU.</div>
                                ) : (
                                    projects.map(p => <ProjectRow key={p.id} project={p} />)
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL: Employee Availability & Deadlines */}
                    <div className="side-panel-grid">
                        
                        {/* Employee Availability */}
                        <div className="panel-card availability-card">
                            <h2 className="panel-title-small">Employee Availability</h2>
                            {renderAvailabilityChart()}
                        </div>

                        {/* Upcoming Deadlines (MOCK DATA) */}
                        <div className="panel-card deadlines-card">
                            <h2 className="panel-title-small">Upcoming Deadlines</h2>
                            <ul className="deadline-list">
                                <li className="deadline-item">
                                    <span>Helios Data Migration</span>
                                    <span className="deadline-date">Nov 30</span>
                                </li>
                                <li className="deadline-item">
                                    <span>Titan API Integration</span>
                                    <span className="deadline-date">Dec 05</span>
                                </li>
                                <li className="deadline-item">
                                    <span>Orion Platform V2</span>
                                    <span className="deadline-date">Dec 15</span>
                                </li>
                                <li className="deadline-item">
                                    <span>Project Phoenix</span>
                                    <span className="deadline-date">Dec 28</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ManagerDashboard;