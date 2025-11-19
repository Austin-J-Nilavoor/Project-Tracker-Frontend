import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import Auth Context
import projectMemberService from '../services/membersServices'; // Import Member Service

// Shared Components
import Header from '../components/Header.jsx';
import Breadcrumbs from '../components/BreadCrumbs.jsx';

// Feature Components
import KanbanBoard from '../features/tasks/components/KanbanBoard.jsx';
import AddTaskModal from "../features/tasks/modals/AddTaskModal.jsx";
import MilestoneProgressBar from '../features/tasks/components/MilestoneProgressBar.jsx';

// Logic Hook
import { useTaskBoard } from '../features/tasks/hooks/useTaskBoard.js';

// Styles
import '../styles/TaskBoard.css';

const TaskBoard = () => {
    const { projectId, milestoneId } = useParams();
    const { user } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [canAddTask, setCanAddTask] = useState(false);

    // Custom Hook
    const {
        tasksByStatus,
        loading,
        error,
        fetchTasks,
        dragHandlers
    } = useTaskBoard(projectId, milestoneId);

    // --- PERMISSION CHECK ---
    useEffect(() => {
        const checkPermission = async () => {
            if (!user) return;

            // 1. Global Role Check (e.g., MANAGER or ADMIN)
            if (user.role === 'MANAGER' || user.role === 'ADMIN') {
                setCanAddTask(true);
                return;
            }

            // 2. Project-Specific Role Check
            if (projectId) {
                try {
                    const members = await projectMemberService.getMembersByProject(projectId);
                    const isProjectManager = members.some(
                        m => m.userId === user.id && m.role === 'PROJECT_MANAGER'
                    );
                    setCanAddTask(isProjectManager);
                } catch (err) {
                    console.error("Failed to fetch project members for permission check", err);
                    setCanAddTask(false);
                }
            }
        };

        checkPermission();
    }, [user, projectId]);

    if (loading) return <div className="dashboard-wrapper loading-state">Loading Kanban board...</div>;

    if (error) {
        return (
            <div className="dashboard-wrapper error-state">
                <div className="error-box">Error: {error}</div>
            </div>
        );
    }

    const boardTitle = milestoneId ? "Milestone Tasks" : "Project Task Board";

    return (
        <>
            <Header
                title={canAddTask ? "Add New Task" : boardTitle} // Show Title if button is hidden
                // Only pass onClick if authorized, otherwise button is hidden by Header logic (usually)
                // If Header always shows button, we conditionally pass the handler or null.
                // Assuming CommonHeader hides button if onClick/title implies action, or we control it here.
                // Better approach: Pass null to onClick to hide the button if CommonHeader supports it.
                onClick={canAddTask ? () => setShowModal(true) : null} 
                btnIcon={canAddTask ? undefined : null} // Hide icon if not auth
                showSearch={true} // Keep search accessible
            />

            <div className="task-board-wrapper">
                <Breadcrumbs />
                
                <MilestoneProgressBar 
                    projectId={projectId} 
                    activeMilestoneId={milestoneId} 
                />

                <KanbanBoard
                    tasksByStatus={tasksByStatus}
                    dragHandlers={dragHandlers}
                />
            </div>

            {/* Render Modal only if authorized and state is true */}
            {showModal && canAddTask && (
                <AddTaskModal
                    projectId={projectId} 
                    milestoneID={milestoneId}
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onTaskCreated={fetchTasks}
                />
            )}
        </>
    );
};

export default TaskBoard;