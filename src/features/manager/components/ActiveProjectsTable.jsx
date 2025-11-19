import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// FIX: Added .js extension to ensure the file resolves correctly
import milestoneService from '../../../services/milestoneServices.js';

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
            {/* Optional: Show percentage text next to bar */}
            <span style={{ fontSize: '0.7rem', color: '#64748b', marginLeft: 'auto', display: 'block', textAlign: 'right', marginTop: '2px' }}>
                {progress}%
            </span>
        </div>
    );
};

const ProjectRow = ({ project }) => {
    const navigate = useNavigate();
    const [progress, setProgress] = useState(0);
    
    // Fetch milestones to calculate live progress
    useEffect(() => {
        const fetchMilestoneProgress = async () => {
            try {
                const milestones = await milestoneService.getMilestonesByProject(project.id);
                
                if (!milestones || milestones.length === 0) {
                    setProgress(0);
                    return;
                }

                const total = milestones.length;
                const completed = milestones.filter(m => m.status === 'COMPLETED').length;
                
                // Simple calculation: (Completed / Total) * 100
                const percentage = Math.round((completed / total) * 100);
                setProgress(percentage);

            } catch (error) {
                console.warn(`Failed to fetch progress for project ${project.id}`, error);
                setProgress(0);
            }
        };

        fetchMilestoneProgress();
    }, [project.id]);

    const displayStatus = project.status.toUpperCase().replace(/ /g, '_');

    const managerName = !project.managers || project.managers.length === 0
        ? "N/A"
        : project.managers.length === 1 ? project.managers[0] : `${project.managers[0]}, ...`;

    const handleRowClick = (e) => {
        if (e.target.tagName === 'BUTTON') return;
        navigate(`/projects/${project.id}`);
    };

    return (
        <div onClick={handleRowClick} className="project-row grid-cols-project-table" style={{ cursor: 'pointer' }}>
            <div className="project-cell project-name">{project.name}</div>
            <div className="project-cell project-manager">{managerName}</div>
            <div className="project-cell project-progress">
                {/* Pass calculated progress instead of mock */}
                <StatusIndicator progress={progress} status={displayStatus} />
            </div>
            <div className="project-cell project-deadline">{project.endDate}</div>
            <div className="project-cell project-status">
                <span className={`project-status-tag status-${displayStatus.toLowerCase().replace(/_/g, '-')}`}>
                    {displayStatus.replace(/_/g, ' ')}
                </span>
            </div>
        </div>
    );
};

const ActiveProjectsTable = ({ projects, loading, error }) => {
    // Filter to show only Active (In Progress) projects
    const activeProjects = projects.filter(p => p.status === "IN_PROGRESS");

    return (
        <div className="active-projects-panel">
            <h2 className="panel-title">Active Projects</h2>
            <div className="project-table-card">
                <div className="table-header grid-cols-project-table">
                    <span>PROJECT NAME</span>
                    <span>PROJECT MANAGER</span>
                    <span>PROGRESS</span>
                    <span>DEADLINE</span>
                    <span>STATUS</span>
                </div>
                <div className="table-body">
                    {loading ? (
                        <div className="status-message">Fetching active projects...</div>
                    ) : error ? (
                        <div className="error-box">{error}</div>
                    ) : activeProjects.length === 0 ? (
                        <div className="status-message">No active projects found in your IBU.</div>
                    ) : (
                        activeProjects.map(p => <ProjectRow key={p.id} project={p} />)
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActiveProjectsTable;