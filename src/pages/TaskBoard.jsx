import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import projectMemberService from '../services/membersServices'; 

import Header from '../components/Header.jsx';
import Breadcrumbs from '../components/BreadCrumbs.jsx';
import KanbanBoard from '../features/tasks/components/KanbanBoard.jsx';
import AddTaskModal from "../features/tasks/modals/AddTaskModal.jsx";
import MilestoneProgressBar from '../features/tasks/components/MilestoneProgressBar.jsx';
import { useTaskBoard } from '../features/tasks/hooks/useTaskBoard.js';

import '../styles/TaskBoard.css';

const TaskBoard = () => {
    const { projectId, milestoneId } = useParams();
    const { user } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState(null); // New state for editing
    const [canAddTask, setCanAddTask] = useState(false);

    const {
        tasksByStatus,
        loading,
        error,
        fetchTasks,
        dragHandlers
    } = useTaskBoard(projectId, milestoneId);

    useEffect(() => {
        const checkPermission = async () => {
            if (!user) return;
            if (user.role === 'MANAGER' || user.role === 'ADMIN') {
                setCanAddTask(true);
                return;
            }
            if (projectId) {
                try {
                    const members = await projectMemberService.getMembersByProject(projectId);
                    const isProjectManager = members.some(
                        m => m.userId === user.id && m.role === 'PROJECT_MANAGER'
                    );
                    setCanAddTask(isProjectManager);
                } catch (err) {
                    console.error("Failed check permissions", err);
                    setCanAddTask(false);
                }
            }
        };
        checkPermission();
    }, [user, projectId]);

    // Handler to open modal for editing
    const handleTaskClick = (task) => {
        if (!canAddTask) return; // Or allow view-only mode if you prefer
        setTaskToEdit(task);
        setShowModal(true);
    };

    // Handler to open modal for creating
    const handleAddNew = () => {
        setTaskToEdit(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setTaskToEdit(null);
    };

    if (loading) return <div className="dashboard-wrapper loading-state">Loading Kanban board...</div>;
    if (error) return <div className="dashboard-wrapper error-state"><div className="error-box">{error}</div></div>;

    const boardTitle = milestoneId ? "Milestone Tasks" : "Project Task Board";

    return (
        <>
            <Header
                title={canAddTask ? "Add New Task" : boardTitle} 
                onClick={canAddTask ? handleAddNew : null} 
                btnIcon={canAddTask ? undefined : null}
                showSearch={true}
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
                    onTaskClick={handleTaskClick} // Pass the click handler
                />
            </div>

            {showModal && (
                <AddTaskModal
                    projectId={projectId} 
                    milestoneID={milestoneId}
                    isOpen={showModal}
                    onClose={handleCloseModal}
                    onSuccess={fetchTasks} // Renamed prop to match generic usage
                    taskToEdit={taskToEdit} // Pass the task data
                />
            )}
        </>
    );
};

export default TaskBoard;