import React, { useState, useMemo } from 'react';

// Shared Components
import CommonHeader from '../components/Header';
import Breadcrumbs from '../components/BreadCrumbs';

// Feature Components
import ProjectFilters from '../features/projects/components/ProjectFilters';
import ProjectGrid from '../features/projects/components/ProjectGrid';

// Modals
import AddProjectModal from '../features/projects/modals/AddProjectModal';

// Logic Hook
import { useProjectList } from '../features/projects/hooks/useProjectList';
import { useAuth } from '../context/AuthContext';

// Styles
import '../styles/ProjectList.css';

const ProjectList = () => {
    const { user } = useAuth();

    const {
        projects,
        loading,
        error,
        activeFilter,
        setActiveFilter,
        refreshData
    } = useProjectList();

    const [showAddProject, setShowAddProject] = useState(false);

    // Allow creation for non-EMPLOYEE roles
    const canCreateProject = user?.role !== 'EMPLOYEE';

    // ----------------------------------------
    // ✅ CUSTOM SORTING LOGIC
    // ----------------------------------------
    const sortedProjects = useMemo(() => {
        if (!projects) return [];

        const priority = {
            "IN_PROGRESS": 1,
            "PENDING": 2,
            "COMPLETED": 3
        };

        return [...projects].sort((a, b) => {
            const statusA = priority[a.status] || 99;
            const statusB = priority[b.status] || 99;
            return statusA - statusB;
        });
    }, [projects]);
    // ----------------------------------------

    return (
        <>
            <CommonHeader
                title={canCreateProject ? "Add New Project" : null}
                onClick={canCreateProject ? () => setShowAddProject(true) : null}
                showSearch={true}
            />

            <div className="project-list-wrapper">
                <Breadcrumbs />

                <div className="project-list-header">
                    <h1 className="header-title">Projects Overview</h1>

                    <ProjectFilters
                        activeFilter={activeFilter}
                        onFilterChange={setActiveFilter}
                    />
                </div>

                {/* Pass sorted projects to the grid */}
                <ProjectGrid
                    projects={sortedProjects}
                    loading={loading}
                    error={error}
                    activeFilter={activeFilter}
                />
            </div>

            {showAddProject && (
                <AddProjectModal
                    onClose={() => setShowAddProject(false)}
                    onSuccess={refreshData}
                />
            )}
        </>
    );
};

export default ProjectList;
