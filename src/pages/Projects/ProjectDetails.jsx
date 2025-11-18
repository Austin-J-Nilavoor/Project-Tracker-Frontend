import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import projectService from '../../services/projectServices.js';
import projectMemberService from '../../services/membersServices.js';
import milestoneService from '../../services/milestoneServices.js';
import { Check, Clock, Calendar, Anchor, Tag, Users, User, Edit, ChevronDown } from 'lucide-react';


// --- Helper Components ---

/**
 * Custom function to topologically sort milestones based on dependsOnId.
 * @param {Array} milestones - Unsorted list of MilestoneDto objects.
 * @returns {Array} Sorted list of milestones.
 */
const topologicalSort = (milestones) => {
    if (!milestones || milestones.length === 0) return [];

    const nodes = new Map();
    const dependencies = new Map();

    milestones.forEach(m => {
        nodes.set(m.id, m);
        dependencies.set(m.id, m.dependsOnId || null); // Map ID to its dependency ID
    });

    const sortedList = [];
    const visited = new Set();
    const visiting = new Set(); // To detect cycles

    const visit = (milestoneId) => {
        if (visited.has(milestoneId)) return;
        if (visiting.has(milestoneId)) {
            console.error("Milestone dependency cycle detected at:", nodes.get(milestoneId).name);
            return;
        }

        visiting.add(milestoneId);
        const dependencyId = dependencies.get(milestoneId);

        if (dependencyId && nodes.has(dependencyId)) {
            visit(dependencyId); // Recursively visit dependency first
        }

        visiting.delete(milestoneId);
        visited.add(milestoneId);
        sortedList.push(nodes.get(milestoneId));
    };

    milestones.forEach(m => visit(m.id));

    return sortedList;
};

// Modified MilestoneItem to match the design (phase number, specific icons, no buttons)
const MilestoneItem = ({ milestone, index, isLast }) => {
    // Determine status for styling and icon
    const statusText = milestone.status.toUpperCase().replace(/ /g, '_');
    const statusClass = statusText.toLowerCase().replace(/_/g, '-');

    let Icon;
    if (statusText === 'COMPLETED') {
        Icon = Check;
    } else if (statusText === 'IN_PROGRESS') {
        Icon = Anchor; // Running person icon equivalent
    } else {
        Icon = Clock; // Pending/Not Started icon
    }

    // Determine if this is the 'current' milestone for visual highlight
    // Logic: The first milestone that is IN_PROGRESS is considered current.
    // NOTE: This logic is illustrative and requires the full milestone list state for true accuracy.
    const isCurrent = statusText === 'IN_PROGRESS';

    const startDate = milestone.startDate;
    const endDate = milestone.endDate;

    return (
        <div className={`milestone-item status-${statusClass} ${isCurrent ? 'is-current' : ''}`}>
            <div className="milestone-timeline">
                <div className={`milestone-icon-wrapper`}>
                    <Icon size={16} className="milestone-icon" />
                </div>
                {!isLast && <div className="milestone-line"></div>}
            </div>
            <div className="milestone-details">
                <h4 className="milestone-name">
                    {/* Append Phase number */}
                    Phase {index + 1}: {milestone.name}
                </h4>
                <p className="milestone-dates">{startDate} - {endDate}</p>
                <p className="milestone-status">{statusText.replace(/_/g, ' ')}</p>
                {/* {milestone.dependsOnName && (
                    <p className="milestone-dependency">
                        (Depends on: {milestone.dependsOnName})
                    </p>
                )} */}
            </div>
        </div>
    );
};

const MemberAvatar = ({ name, role, email }) => {
    const initial = name.charAt(0);
    const color = name.length % 5;
    const colorMap = {
        0: 'bg-avatar-blue', 1: 'bg-avatar-orange', 2: 'bg-avatar-yellow', 3: 'bg-avatar-green', 4: 'bg-avatar-red',
    };

    return (
        <div className="member-card">
            <div className={`user-avatar large ${colorMap[color]}`}>{initial}</div>
            <div className="member-details">
                <p className="member-name">{name}</p>
                {/* <p className="member-role">{role}</p> */}
                <p className="member-email">{email}</p>
            </div>

        </div>
    );
};

const ProjectDetails = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [members, setMembers] = useState([]);
    const [milestones, setMilestones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusError, setStatusError] = useState(null);

    // --- Data Fetching ---
    const fetchData = useCallback(async () => {
        if (!projectId) {
            setError("Project ID is missing from the URL.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setStatusError(null);
        setError(null);

        try {
            // Fetch three endpoints concurrently
            const [projectData, membersData, milestonesData] = await Promise.all([
                projectService.getProjectById(projectId),
                projectMemberService.getMembersByProject(projectId),
                milestoneService.getMilestonesByProject(projectId)
            ]);

            setProject(projectData);
            setMembers(membersData);

            // Apply topological sort to milestones
            const sortedMilestones = topologicalSort(milestonesData);
            setMilestones(sortedMilestones);

        } catch (err) {
            const errorMessage = err.response?.data?.message || "Failed to load project details.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Milestone Status Update Handler (REMOVED LOGIC) ---
    // The handler logic is removed as the requirement was to remove the button.

    // --- Loading and Error States ---
    if (loading) {
        return <div className="dashboard-wrapper loading-state">Loading project details...</div>;
    }

    if (error) {
        return (
            <div className="dashboard-wrapper error-state">
                <div className="error-box">Error: {error}</div>
                <button onClick={() => navigate('/dashboard')} className="btn btn-primary mt-4">Go Back</button>
            </div>
        );
    }

    if (!project) {
        return <div className="dashboard-wrapper status-message">Project not found.</div>;
    }

    // --- Data Mapping ---

    const statusText = project.status.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const projectManager = members.find(m => m.role === 'PROJECT_MANAGER');
    const teamMembers = members.filter(m => m.role !== 'PROJECT_MANAGER');
    const totalMembers = members.length;

    // --- Main Render ---

    return (
        <div className="project-details-wrapper">
            {/* --- Project Header --- */}
            <div className="project-details-header">
                <h1 className="project-title">{project.name || 'Project Title Missing'}</h1>
                <button className="btn btn-secondary edit-button">
                    <Edit size={16} />
                    <span>Edit Project</span>
                </button>
            </div>

            <div className="project-header-meta">
                <p className="project-meta-item status-tag-active">
                    <Check size={16} /> {statusText}
                </p>
                <p className="project-meta-item priority-tag-high">
                    <Tag size={16} /> {project.priority} Priority
                </p>
                <p className="project-meta-item member-count">
                    <Users size={16} /> {totalMembers} Members
                </p>
            </div>

            {/* --- Main Content Grid --- */}
            <main className="details-content-grid">

                {/* LEFT COLUMN: Summary, Progress, Milestones */}
                <div className="project-main-panel">

                    {/* Project Summary */}
                    <div className="summary-section">
                        <h3 className="section-heading">PROJECT SUMMARY</h3>
                        <p className="project-description">
                            {project.description}
                        </p>
                        <div className="project-dates">
                            <span>Start: {project.startDate}</span>
                            <span>End: {project.endDate}</span>
                            <span>IBU: {project.ibuName}</span>
                        </div>
                    </div>

                    {/* Overall Progress Section */}
                    <div className="progress-metrics-section">
                        <h3 className="section-heading">OVERALL PROGRESS (65%)</h3>
                        <div className="progress-bar-large">
                            <div className="progress-fill" style={{ width: '65%' }}></div>
                        </div>

                        {/* Mock Metrics */}
                        <div className="metric-cards-grid">
                            <div className="metric-card">
                                <h3>{milestones.length}</h3><p>Total Milestones</p>
                            </div>
                            <div className="metric-card">
                                <h3>3</h3><p>Completed</p>
                            </div>
                            <div className="metric-card">
                                <h3>48</h3><p>Total Tasks</p>
                            </div>
                            <div className="metric-card">
                                <h3>31</h3><p>Completed</p>
                            </div>
                        </div>
                    </div>

                    {/* Milestones Timeline */}
                    <div className="milestone-timeline-section">
                        <h3 className="section-heading">MILESTONES TIMELINE</h3>
                        {statusError && <div className="error-box milestone-error">Status Update Failed: {statusError}</div>}
                        <div className="milestone-list">
                            {milestones.length === 0 ? (
                                <p className="status-message">No milestones defined for this project.</p>
                            ) : (
                                milestones.map((m, index) => (
                                    <MilestoneItem
                                        key={m.id}
                                        milestone={m}
                                        index={index} // Pass index for phase numbering
                                        isLast={index === milestones.length - 1}
                                    // Removed onStatusChange prop
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Team, Documents, Activity, Risks */}
                <div className="project-sidebar">

                    {/* Team Section */}
                    <div className="team-section sidebar-card">
                        <h3 className="section-heading">TEAM</h3>
                        {projectManager && (
                            <div className="project-manager-info">
                                <h4>Project Manager</h4>
                                <MemberAvatar name={projectManager.userName} email={"changeit@email.com"} role={projectManager.roleInProject || projectManager.role} />
                            </div>
                        )}

                        <h4 className="team-members-title">Team Members ({teamMembers.length})</h4>
                        <div className="team-member-avatars">
                            {/* Render up to 5 team members */}
                            {teamMembers.slice(0, 5).map(member => (
                                <div key={member.userId} className="user-avatar small bg-avatar-default">
                                    {member.userName.charAt(0)}
                                </div>
                            ))}
                            {/* If more than 5 members, show +N bubble */}
                            {teamMembers.length > 5 && (
                                <div className="user-avatar small extra-members">
                                    +{teamMembers.length - 5}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Placeholder Sections */}
                    <div className="sidebar-card">
                        <h3 className="section-heading collapsible-header">Project Documents <ChevronDown size={18} /></h3>
                    </div>
                    <div className="sidebar-card">
                        <h3 className="section-heading collapsible-header">Recent Activity <ChevronDown size={18} /></h3>
                    </div>
                    <div className="sidebar-card">
                        <h3 className="section-heading collapsible-header">Project Risks <ChevronDown size={18} /></h3>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProjectDetails;