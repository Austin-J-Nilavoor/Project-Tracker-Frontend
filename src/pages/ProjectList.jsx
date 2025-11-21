import React, { useState, useMemo } from 'react';

// Shared Components
import CommonHeader from '../components/Header';
import Breadcrumbs from '../components/BreadCrumbs';

// Feature Components
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
        refreshData
    } = useProjectList();

    const [showAddProject, setShowAddProject] = useState(false);
    const [activeTab, setActiveTab] = useState('active'); // 'active' | 'completed'
    const [searchQuery, setSearchQuery] = useState("");

    // Allow creation for non-EMPLOYEE roles
    const canCreateProject = user?.role !== 'EMPLOYEE';

    // ----------------------------------------
    // ✅ DATA PROCESSING
    // ----------------------------------------
    const getStatus = (p) => (p.status || 'PENDING');

    // 1. Active Projects (In Progress + Pending), Sorted by Priority
    const activeProjects = useMemo(() => {
        const active = projects.filter(p => getStatus(p) !== 'COMPLETED');

        // Sort: IN_PROGRESS comes before PENDING
        return active.sort((a, b) => {
            const statusA = getStatus(a);
            const statusB = getStatus(b);

            if (statusA === statusB) return 0;
            if (statusA === 'IN_PROGRESS') return -1; // Moves A up
            if (statusB === 'IN_PROGRESS') return 1;  // Moves B up
            return 0;
        });
    }, [projects]);

    // 2. Completed Projects
    const completedProjects = useMemo(() => {
        return projects.filter(p => getStatus(p) === 'COMPLETED');
    }, [projects]);

    // Determine which list to show based on tab
    // Determine which list to show based on tab

    const filteredList = (activeTab === 'active' ? activeProjects : completedProjects)
        .filter(p =>
            p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );

    const currentList = filteredList;

    const emptyMessage = activeTab === 'active'
        ? "No active projects found."
        : "No completed projects found.";

    return (
        <>
            <CommonHeader
                title={canCreateProject ? "Add New Project" : null}
                onClick={canCreateProject ? () => setShowAddProject(true) : null}
                showSearch={true}
                searchQuery={searchQuery}
                onSearch={(e) => setSearchQuery(e.target.value)}
            />

            <div className="project-list-wrapper">
                <Breadcrumbs />

                <div className="project-list-header">
                    <h1 className="header-title">My Projects</h1>
                </div>

                {/* --- TAB NAVIGATION --- */}
                <div className="project-tabs-nav">
                    <button
                        className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
                        onClick={() => setActiveTab('active')}
                    >
                        Active Projects <span className="tab-count">{activeProjects.length}</span>
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
                        onClick={() => setActiveTab('completed')}
                    >
                        Completed Projects <span className="tab-count">{completedProjects.length}</span>
                    </button>
                </div>

                {/* --- MAIN CONTENT --- */}
                {loading ? (
                    <div className="status-message">Loading projects...</div>
                ) : error ? (
                    <div className="error-box">{error}</div>
                ) : (
                    <>
                        {currentList.length === 0 ? (
                            <p className="status-message">{emptyMessage}</p>
                        ) : (
                            <ProjectGrid
                                projects={currentList}
                                loading={false}
                                error={null}
                                activeFilter="All"
                            />
                        )}
                    </>
                )}
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