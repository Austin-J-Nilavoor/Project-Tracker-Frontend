import React from 'react';

const PROJECT_STATUSES = ['All', 'ACTIVE', 'COMPLETED', 'PENDING'];

const ProjectFilters = ({ activeFilter, onFilterChange }) => {
    return (
        <div className="project-status-filters">
            {PROJECT_STATUSES.map(status => (
                <button
                    key={status}
                    className={`filter-button ${activeFilter === status ? 'active' : ''}`}
                    onClick={() => onFilterChange(status)}
                >
                    {status.replace(/_/g, ' ')}
                </button>
            ))}
        </div>
    );
};

export default ProjectFilters;