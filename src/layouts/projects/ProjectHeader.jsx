import React from 'react';
import { Check, Tag, Users, Edit } from 'lucide-react';

const ProjectHeader = ({ project, memberCount }) => {
    const statusText = project.status.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    return (
        <>
            <div className="project-details-header">
                <h1 className="project-title">{project.name}</h1>
            </div>

            {/* <div className="project-header-meta">
                <p className="project-meta-item status-tag-active">
                    <Check size={16} /> {statusText}
                </p>
                <p className="project-meta-item priority-tag-high">
                    <Tag size={16} /> {project.priority} Priority
                </p>
                <p className="project-meta-item member-count">
                    <Users size={16} /> {memberCount} Members
                </p>
            </div> */}
        </>
    );
};

export default ProjectHeader;