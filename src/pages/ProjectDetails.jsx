import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Layout Components
import CommonHeader from '../components/Header';
import Breadcrumbs from '../components/BreadCrumbs';
import '../styles/ProjectDetails.css';

// Feature Components
import ProjectHeader from '../features/projects/components/ProjectHeader';
import ProjectSummary from '../features/projects/components/ProjectSummary';
import MilestoneTimeline from '../features/projects/components/MilestoneTimeline';
import TeamSidebar from '../features/projects/components/TeamSidebar';
import AddMemberModal from '../features/projects/modals/AddMemberModal';
import AddMilestoneModal from '../features/projects/modals/AddMilestoneModal';
import AddProjectModal from '../features/projects/modals/AddProjectModal';
import projectMemberService from '../services/membersServices';

import { useProjectDetails } from '../features/projects/hooks/useProjectDetails';
import NotFound from '../components/NotFound';

const ProjectDetails = () => {
    const { projectId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [showAddMember, setShowAddMember] = useState(false);
    const [showAddMilestone, setShowAddMilestone] = useState(false);
    const [showEditProject, setShowEditProject] = useState(false);

    // New State for Editing Milestone
    const [milestoneToEdit, setMilestoneToEdit] = useState(null);

    const {
        project, members, milestones, tasks, allUsers,
        loading, error, refreshData
    } = useProjectDetails(projectId);

    if (loading) return <div className="dashboard-wrapper loading-state">Loading...</div>;
    if (error) return <div className="dashboard-wrapper error-state"><NotFound /></div>;
    if (!project) return <div className="dashboard-wrapper">Project not found.</div>;

    // --- PERMISSION LOGIC ---
    const isAdmin = user?.role === 'MANAGER';
    const isAssignedProjectManager = members.some(
        m => m.userId === user?.id && m.role === 'PROJECT_MANAGER'
    );

    const canEdit = isAdmin || isAssignedProjectManager;

    // --- HANDLERS ---
    const handleEditMilestone = (milestone) => {
        setMilestoneToEdit(milestone);
        setShowAddMilestone(true);
    };

    const handleCloseMilestoneModal = () => {
        setShowAddMilestone(false);
        setMilestoneToEdit(null); // Clear selection on close
    };
    const handleRemoveMember = async (memberUserId) => {
       
        if (!window.confirm("Are you sure you want to remove this member from the project?")) {
            return;
        }

        try {
            await projectMemberService.removeMember(projectId, memberUserId);
            refreshData(); // Reload data to update the list
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to remove member.");
        }
    };
    return (
        <>
            <CommonHeader
                title={canEdit ? "Edit Project" : "Project Details"}
                btnIcon={canEdit ? <Edit size={18} /> : null}
                onClick={canEdit ? () => setShowEditProject(true) : null}
                // showSearch={true}
            />

            <div className="project-details-wrapper">
                <Breadcrumbs />
                <ProjectHeader project={project} memberCount={members.length} />

                <main className="details-content-grid">
                    <div className="project-main-panel">
                        <ProjectSummary
                            project={project}
                            milestones={milestones}
                            tasks={tasks}
                        />

                        <MilestoneTimeline
                            milestones={milestones}
                            projectId={projectId}
                            // Pass handlers only if permitted
                            onAddClick={canEdit ? () => setShowAddMilestone(true) : null}
                            onEditClick={canEdit ? handleEditMilestone : null}
                        />
                    </div>

                    <TeamSidebar
                        members={members}
                        milestones={milestones}
                        onAddClick={canEdit ? () => setShowAddMember(true) : null}
                        // Pass the remove handler here
                        onRemoveClick={canEdit ? handleRemoveMember : null}
                    />
                </main>
            </div>

            {/* --- MODALS --- */}

            {showEditProject && (
                <AddProjectModal
                    projectToEdit={project}
                    onClose={() => setShowEditProject(false)}
                    onSuccess={refreshData}
                />
            )}

            {showAddMember && (
                <AddMemberModal
                    projectId={projectId}
                    allUsers={allUsers}
                    onClose={() => setShowAddMember(false)}
                    onSuccess={refreshData}
                />
            )}

            {showAddMilestone && (
                <AddMilestoneModal
                    projectId={projectId}
                    milestones={milestones}
                    project={project}
                    milestoneToEdit={milestoneToEdit} // Pass data to edit
                    onClose={handleCloseMilestoneModal} // Use specific handler
                    onSuccess={refreshData}

                />
            )}
        </>
    );
};

export default ProjectDetails;