import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import projectService from '../../services/projectServices.js';
import { useAuth } from '../../context/AuthContext.jsx';
import CommonHeader from '../../components/Header.jsx';
import { Users, Search } from 'lucide-react';
import Breadcrumbs from '../../components/BreadCrumbs.jsx';

// --- Constants ---
const PROJECT_STATUSES = ['All', 'ACTIVE', 'COMPLETED', 'PENDING', 'ON_HOLD'];
// NOTE: Mock data for UI presentation (Avatars/Budget)
const MOCK_TEAM_AVATARS = [
    { name: "A", color: "blue" },
    { name: "B", color: "orange" },
    { name: "C", color: "green" }
];


// --- Helper Components ---

// Renders the small team avatars for the card
const TeamAvatars = ({ teamMembers, managerId }) => {
    return (
        <div className="team-avatars">
            {MOCK_TEAM_AVATARS.map((member, index) => (
                <div key={index} className={`user-avatar small bg-avatar-${member.color}`}>
                    {member.name}
                </div>
            ))}
            <div className="user-avatar small extra-members">
                +8
            </div>
        </div>
    );
};

// Renders the progress bar with percentage text
const ProgressIndicator = ({ progress }) => {
    const progressValue = Math.min(Math.max(0, progress || 0), 100);
    const colorClass = progressValue === 100 ? 'progress-completed' : 'progress-active';

    return (
        <div className="progress-section">
            <div className="progress-bar-track">
                <div
                    className={`progress-bar-fill ${colorClass}`}
                    style={{ width: `${progressValue}%` }}
                />
            </div>
            <span className="progress-text">{progressValue}%</span>
        </div>
    );
};


// Renders a single project in card format
const ProjectCard = ({ project }) => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // --- Mocking fields missing from ProjectDto for UI presentation ---
    const mockManager = "Alice Johnson";
    const mockBudgetUsed = "15k";
    const mockBudgetTotal = "20k";
    // Progress is mocked here as ProjectDto doesn't include it
    const mockProgress = (project.name.length * 7) % 100;

    // Determine status tag color/text
    const status = project.status ? project.status.toUpperCase() : 'PENDING';
    const statusClass = status.toLowerCase().replace(/_/g, '-');
    const statusText = status.replace(/_/g, ' ');

    // Determine if the current user can manage the project (for button visibility)
    const canManage = user && (user.role === 'ADMIN' || user.role === 'MANAGER');

    return (
        <div className="project-card">
            <div className="card-content">
                <div className="card-header">
                    <h3 className="project-name">{project.name}</h3>
                    <span className={`status-tag status-tag--${statusClass}`}>{statusText}</span>
                </div>

                <p className="card-meta">
                    Managers: {project.managers?.length > 0
                        ? project.managers.join(', ')
                        : 'N/A'}
                </p>

                <TeamAvatars />

                <ProgressIndicator progress={mockProgress} />

                {/* <p className="budget-info">Budget: ${mockBudgetUsed} / ${mockBudgetTotal} Used</p> */}
            </div>

            <div className="card-actions">
                <button
                    className="btn-card btn-view-details"
                    onClick={() => navigate(`/projects/${project.id}`)}
                >
                    View Details
                </button>

                {/* Conditional rendering for the Manage button */}
                {canManage && (
                    <button
                        className="btn-card btn-manage"
                        onClick={() => console.log(`Navigating to management view for ${project.id}`)}
                    >
                        Manage
                    </button>
                )}
            </div>
        </div>
    );
};


const ProjectList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [allProjects, setAllProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All');

    // --- Data Fetching ---
    const fetchProjects = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetches projects filtered by user authorization on the backend
            const fetchedProjects = await projectService.getAllProjects();
            setAllProjects(fetchedProjects);
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Failed to load project list.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);


    // --- Filtering Logic (Client-side) ---
    useEffect(() => {
        let projects = allProjects;

        if (activeFilter !== 'All') {
            projects = projects.filter(p => p.status.toUpperCase() === activeFilter);
        }

        setFilteredProjects(projects);
    }, [allProjects, activeFilter]);


    // --- Main Render ---

    return (<>
        <CommonHeader
            title="Add New Project"
            onClick={() => console.log("New Project Modal Opened")}
            showSearch={true}
        />
        <Breadcrumbs />
        <div className="project-list-wrapper">

            {/* The header is rendered by App.jsx */}

            <div className="project-list-header">
                <h1 className="header-title">Projects Overview</h1>

                {/* Status Filters */}
                <div className="project-status-filters">
                    {PROJECT_STATUSES.map(status => (
                        <button
                            key={status}
                            className={`filter-button ${activeFilter === status ? 'active' : ''}`}
                            onClick={() => setActiveFilter(status)}
                        >
                            {status.replace(/_/g, ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="status-message">Loading projects...</div>
            ) : error ? (
                <div className="error-box">{error}</div>
            ) : filteredProjects.length === 0 ? (
                <div className="status-message">No projects found matching the filter "{activeFilter}".</div>
            ) : (
                <div className="project-card-grid">
                    {filteredProjects.map(project => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            )}
        </div></>
    );
};

export default ProjectList;