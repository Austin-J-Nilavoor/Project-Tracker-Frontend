import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import projectService from '../../services/projectServices';
import { Briefcase, Search, Plus } from 'lucide-react';
import CommonHeader from '../../components/Header';
import { useNavigate } from 'react-router-dom';import userService from '../../services/userServices'; // FIX: Corrected path and file extension
import Breadcrumbs from '../../components/BreadCrumbs';
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

        </div>
    );
};

// Renders a single row in the Active Projects table
const ProjectRow = ({ project }) => {
    // Project status from backend (e.g., PENDING, IN_PROGRESS, COMPLETED)
    const displayStatus = project.status.toUpperCase().replace(/ /g, '_');

    // Mock the manager name and progress for now
    const managerName =
        !project.managers || project.managers.length === 0
            ? "N/A"
            : project.managers.length === 1
                ? project.managers[0]
                : `${project.managers[0]}, ...`;

    const projectName = project.name;
    const deadline = project.endDate;
    const mockProgress = (projectName.length * 5) % 100;

    const navigate = useNavigate();

    // NOTE: Clicking the entire row navigates to details
    const handleRowClick = (e) => {
        // Prevent button clicks (like View) from triggering row click twice
        if (e.target.tagName === 'BUTTON') return;
        navigate(`/projects/${project.id}`);
    };

    return (
        <div onClick={handleRowClick} className="project-row grid-cols-project-table" style={{ cursor: 'pointer' }}>
            <div className="project-cell project-name">{projectName}</div>
            <div className="project-cell project-manager">{managerName}</div>
            <div className="project-cell project-progress">
                <StatusIndicator progress={mockProgress} status={displayStatus} />
            </div>
            <div className="project-cell project-deadline">{deadline}</div>
            <div className="project-cell project-status">
                <span className={`project-status-tag status-${displayStatus.toLowerCase().replace(/_/g, '-')}`}>{displayStatus.replace(/_/g, ' ')}</span>
            </div>

        </div>
    );
};

const StatCard = ({ title, value, color, onClick }) => {
    const colorClass = `stat-card-${color}`;
    return (
        <div className={`stat-card ${colorClass}`} onClick={onClick}>
            <p className="stat-title">{title}</p>
            <p className="stat-value">{value}</p>
        </div>
    );
};


const ManagerDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [allEmployees, setAllEmployees] = useState([]); // Store all IBU employees
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // --- Add New Project Modal State ---
    const [showAddProject, setShowAddProject] = useState(false);

    const [newProject, setNewProject] = useState({
        name: "",
        description: "",
        status: "PENDING",
        priority: "MEDIUM",
        startDate: "",
        endDate: ""
    });


    // --- Data Fetching ---
    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch projects (filtered by IBU on backend)
            const projectsPromise = projectService.getAllProjects();

            // Fetch employees (filtered by IBU on backend)
            const employeesPromise = userService.getAllUsers();

            const [fetchedProjects, fetchedEmployees] = await Promise.all([projectsPromise, employeesPromise]);

            // 1. PROJECTS
            const projectsForUI = fetchedProjects.map(p => ({
                ...p,
                managerName: user.name, // Use current user's name as placeholder manager
            }));
            setProjects(projectsForUI);

            // 2. EMPLOYEES
            setAllEmployees(fetchedEmployees);

        } catch (err) {
            const errorMessage = err.response?.data?.message || "Failed to load dashboard data.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [user.name]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);
    const handleCreateProject = async () => {
        try {
            await projectService.createProject(newProject);
            setShowAddProject(false);
            await fetchDashboardData();
            alert("Project created successfully!");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to create project");
        }
    };

    // --- Metric Calculations (useMemo) ---
    const metrics = useMemo(() => {
        if (loading) return null;

        // --- REAL COUNTS ---
        const activeProjects = projects.filter(p => p.status !== 'COMPLETED').length;
        const totalProjects = projects.length;
        const totalEmployees = allEmployees.length;

        // --- MOCK AVAILABILITY CALCULATIONS ---
        // Mocking availability metrics based on the employee count
        const mockAvailable = Math.floor(totalEmployees * 0.20);
        const mockOnLeave = Math.floor(totalEmployees * 0.10);
        const mockOnProjects = totalEmployees - mockAvailable - mockOnLeave;

        // Mocking On-Time Completion (requires full project history)
        const onTimeCompletion = "92%";

        return {
            stats: [
                { title: "Total Projects", value: totalProjects, color: "blue", onClick: () => navigate('/projects') },
                { title: "Active Projects", value: activeProjects, color: "orange", onClick: () => navigate('/projects') },
                { title: "Total Employees", value: totalEmployees, color: "green", onClick: () => navigate('/employees') }, // FINAL REAL COUNT
                { title: "On-Time Completion", value: onTimeCompletion, color: "indigo", onClick: () => console.log('Navigate to Completion Details') },
            ],
            availability: {
                total: totalEmployees,
                onProjects: mockOnProjects,
                available: mockAvailable,
                onLeave: mockOnLeave,
            }
        };
    }, [projects, allEmployees, loading]);

    // --- Helper for Employee Availability Ring Chart ---
    const renderAvailabilityChart = () => {
        if (!metrics || metrics.availability.total === 0) return <div className="status-message">No employee data.</div>;

        const { total, onProjects, available, onLeave } = metrics.availability;
        const circumference = 283;

        // Calculate percentages safely
        const availablePercent = total > 0 ? (available / total) : 0;
        const onProjectsPercent = total > 0 ? (onProjects / total) : 0;

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
                        <span className="legend-dot dot-on-leave"></span> On Leave ({onLeave})
                    </div>
                </div>
            </div>
        );
    };

    if (!user) return <div className="loading-message">Loading user profile...</div>;
    const { stats } = metrics || { stats: [] };

    // --- Main Render ---

    return (
        <div className="dashboard-wrapper">

            {/* --- COMMON HEADER --- */}
            <CommonHeader
                title="Add New Project"
                onClick={() => setShowAddProject(true)}
                showSearch={true}
            />
            {/* --- END COMMON HEADER --- */}
<Breadcrumbs/>
            {/* --- Main Content Area --- */}
            <main className="main-content manager-layout">
                {/* Greeting & Subtitle (Uses real user name and IBU) */}
                <h1 className="greeting-title">Welcome, {user.name}! 👋</h1>
                <p className="greeting-subtitle">
                    IBU: {allEmployees?.[0]?.ibuName?.toString() || 'N/A'}
                </p>


                {/* --- Row 1: Key Metrics --- */}
                <div className="metrics-grid">
                    {stats.map(stat => (
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
                                {/* <span>VIEW</span> */}
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
            {/* --- ADD PROJECT MODAL --- */}
            {showAddProject && (
                <div className="modal-overlay">
                    <div className="modal-box ">

                        <h2 className="modal-title">Create New Project</h2>

                        <input
                            type="text"
                            placeholder="Project Name"
                            className="modal-input"
                            value={newProject.name}
                            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                        />

                        <textarea
                            placeholder="Description"
                            className="modal-textarea"
                            value={newProject.description}
                            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                        />

                        <select
                            className="modal-input"
                            value={newProject.status}
                            onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                        >
                            <option value="PENDING">PENDING</option>
                            <option value="IN_PROGRESS">IN PROGRESS</option>
                            <option value="COMPLETED">COMPLETED</option>
                        </select>

                        <select
                            className="modal-input"
                            value={newProject.priority}
                            onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })}
                        >
                            <option value="LOW">LOW</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HIGH">HIGH</option>
                        </select>

                        <label>Start Date</label>
                        <input
                            type="date"
                            className="modal-input"
                            value={newProject.startDate}
                            onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                        />

                        <label>End Date</label>
                        <input
                            type="date"
                            className="modal-input"
                            value={newProject.endDate}
                            onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                        />

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowAddProject(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleCreateProject}>Create</button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default ManagerDashboard;