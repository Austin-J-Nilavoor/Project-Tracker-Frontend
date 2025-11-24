import React from 'react';
import ProjectCard from './ProjectCard';

const ProjectGrid = ({ projects, loading, error, activeFilter }) => {
    if (loading) return <div className="status-message">Loading projects...</div>;
    
    if (error) return <div className="error-box">{error}</div>;
    
    if (projects.length === 0) {
        return (
            <div className="status-message">
                No projects found matching the filter "{activeFilter}".
            </div>
        );
    }

    return (
        <div className="project-card-grid">
            {projects.map(project => (
                <ProjectCard key={project.id} project={project} />
            ))}
        </div>
    );
};

export default ProjectGrid;