import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import milestoneService from '../../../services/milestoneServices';
import projectMemberService from '../../../services/membersServices'; // Import member service
import UserAvatar from '../../../components/UserAvatar'; // Import global avatar

// --- Internal Helpers ---
const TeamAvatars = ({ members }) => {
    // Filter to exclude Project Managers
    const teamMembers = members?.filter(member => member.role !== 'PROJECT_MANAGER') || [];

    // If no team members, show a placeholder text
    if (teamMembers.length === 0) {
        return (
            <div className="team-avatars" style={{ minHeight: '32px', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
                    No team members
                </span>
            </div>
        );
    }

    // Limit to 3 avatars, show count for the rest
    const displayMembers = teamMembers.slice(0, 3);
    const remainingCount = teamMembers.length - 3;

    return (
        <div className="team-avatars">
            {displayMembers.map((member) => (
                <UserAvatar 
                    key={member.userId} 
                    name={member.userName} 
                    id={member.userId} 
                />
            ))}
            {remainingCount > 0 && (
                <div className="user-avatar small extra-members">
                    +{remainingCount}
                </div>
            )}
        </div>
    );
};

const ProgressIndicator = ({ progress }) => {
    const val = Math.min(Math.max(0, progress || 0), 100);
    const colorClass = val === 100 ? 'progress-completed' : 'progress-active';
    
    const getBarColor = (p) => {
        if (p === 100) return '#10b981'; // Green
        if (p > 0) return '#3b82f6';     // Blue
        return '#e2e8f0';                // Gray
    };

    return (
        <div className="progress-section">
            <div className="progress-bar-track">
                <div 
                    className={`progress-bar-fill ${colorClass}`} 
                    style={{ 
                        width: `${val}%`,
                        backgroundColor: getBarColor(val) 
                    }} 
                />
            </div>
            <span className="progress-text">{Math.round(val)}%</span>
        </div>
    );
};

// --- Main Component ---
const ProjectCard = ({ project }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [progress, setProgress] = useState(0);
    const [members, setMembers] = useState([]); // State for real members

    // --- Fetch Data (Progress & Members) ---
    useEffect(() => {
        let isMounted = true;
        
        const fetchData = async () => {
            try {
                // 1. Fetch Progress
                const milestonesPromise = milestoneService.getMilestonesByProject(project.id);
                // 2. Fetch Members
                const membersPromise = projectMemberService.getMembersByProject(project.id);

                const [milestones, fetchedMembers] = await Promise.all([milestonesPromise, membersPromise]);
                
                if (isMounted) {
                    // Calculate Progress
                    if (!milestones || milestones.length === 0) {
                        setProgress(0);
                    } else {
                        const total = milestones.length;
                        const completed = milestones.filter(m => m.status === 'COMPLETED').length;
                        setProgress(Math.round((completed / total) * 100));
                    }

                    // Set Members
                    setMembers(fetchedMembers || []);
                }
            } catch (error) {
                console.warn(`Failed to fetch data for project ${project.id}`, error);
                if (isMounted) {
                    setProgress(0);
                    // Keep members empty or previous state on error
                }
            }
        };

        fetchData();

        return () => { isMounted = false; };
    }, [project.id]);

    const status = project.status ? project.status.toUpperCase() : 'PENDING';
    const statusClass = status.toLowerCase().replace(/_/g, '-');
    const canManage = user && (user.role === 'ADMIN' || user.role === 'MANAGER');

    return (
        <div className="project-card">
            <div className="card-content">
                <div className="card-header">
                    <h3 className="project-name">{project.name}</h3>
                    <span className={`status-tag status-tag--${statusClass}`}>
                        {status.replace(/_/g, ' ')}
                    </span>
                </div>
                <p className="card-meta">
                    Managers: {project.managers?.length ? project.managers.join(', ') : 'N/A'}
                </p>
                
                {/* Pass real members to the avatar helper */}
                <TeamAvatars members={members} />
                
                <ProgressIndicator progress={progress} />
            </div>

            <div className="card-actions">
                <button 
                    className="btn-card btn-view-details"
                    onClick={() => navigate(`/projects/${project.id}`)}
                >
                    View Details
                </button>
                {canManage && (
                    <button 
                        className="btn-card btn-manage"
                        onClick={() => console.log('Manage', project.id)}
                    >
                        Manage
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProjectCard;