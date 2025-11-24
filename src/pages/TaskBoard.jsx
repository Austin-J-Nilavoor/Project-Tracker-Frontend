import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import projectMemberService from '../services/membersServices';
import milestoneService from '../services/milestoneServices';
import projectService from '../services/projectServices';

import Header from '../components/Header.jsx';
import Breadcrumbs from '../components/BreadCrumbs.jsx';
import KanbanBoard from '../layouts/tasks/KanbanBoard.jsx';
import AddTaskModal from "../modals/AddTaskModal.jsx";
import AddMilestoneModal from "../modals/AddMilestoneModal.jsx";
import MilestoneProgressBar from '../layouts/tasks/MilestoneProgressBar.jsx';
import { useTaskBoard } from '../hooks/useTaskBoard.js';

import '../styles/TaskBoard.css';

const TaskBoard = () => {
    const { projectId, milestoneId } = useParams();
    const { user } = useAuth();

    // Modal States
    const [showModal, setShowModal] = useState(false);
    const [showMilestoneModal, setShowMilestoneModal] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState(null);

    // Permission & Data States
    const [canAddTask, setCanAddTask] = useState(false);
    const [project, setProject] = useState(null);
    const [milestones, setMilestones] = useState([]);
const [isProjectManager, setIsProjectManager] = useState(false);
    const {
        tasksByStatus,
        loading,
        error,
        fetchTasks,
        dragHandlers
    } = useTaskBoard(projectId, milestoneId);

    // --- Load Permissions & Project Context ---
    useEffect(() => {
        const loadContext = async () => {
            if (!user || !projectId) return;

            try {
                // 1. Check Permissions
                let hasPerm = false;
                if (user.role === 'MANAGER' || user.role === 'ADMIN') {
                    hasPerm = true;
                } else {
                    const members = await projectMemberService.getMembersByProject(projectId);
                    const isProjectManager = members.some(
                        m => m.userId === user.id && m.role === 'PROJECT_MANAGER'
                    );
                    setIsProjectManager(isProjectManager);
                    hasPerm = isProjectManager;
                }
                setCanAddTask(hasPerm);

                // 2. Fetch Project & Milestones (Required for validation logic)
                const [projData, milestoneData] = await Promise.all([
                    projectService.getProjectById(projectId),
                    milestoneService.getMilestonesByProject(projectId)
                    
                ]);

                setProject(projData);
                setMilestones(milestoneData || []);

            } catch (err) {
                console.error("Failed to load task board context", err);
            }
        };
        loadContext();
    }, [user, projectId]);

    // Handler: Click Task Card (Edit)
    const handleTaskClick = (task) => {
        // if (!canAddTask) return;
        setTaskToEdit(task);
        setShowModal(true);
    };

    // Handler: Click "Add New Task" Button
    const handleAddNew = () => {
        // LOGIC: Enforce Milestone Creation
        if (milestones.length === 0) {
            alert("Please create a milestone before adding tasks.");
            setShowMilestoneModal(true);
        } else {
            setTaskToEdit(null);
            setShowModal(true);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setTaskToEdit(null);
    };

    // Handler: Successfully Created Milestone
    const handleMilestoneSuccess = async () => {
        try {
            // Refresh milestones
            const updatedMilestones = await milestoneService.getMilestonesByProject(projectId);
            setMilestones(updatedMilestones);

            // Close milestone modal and open task modal immediately for smooth flow
            setShowMilestoneModal(false);
            setTaskToEdit(null);
            setShowModal(true);
        } catch (err) {
            console.error("Failed to refresh milestones", err);
        }
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
                // showSearch={true}
            />

            <div className="task-board-wrapper">
                <Breadcrumbs />

                {/* Key prop forces re-render when milestones change */}
                <MilestoneProgressBar
                    key={milestones.length}
                    projectId={projectId}
                    activeMilestoneId={milestoneId}
                />

                <KanbanBoard
                    tasksByStatus={tasksByStatus}
                    dragHandlers={dragHandlers}
                    onTaskClick={handleTaskClick}
                    currentUser={user}
                    isProjectManager={isProjectManager}
                />
            </div>

            {/* Task Modal */}
            {showModal && (
                <AddTaskModal
                    projectId={projectId}
                    milestoneID={milestoneId}
                    isOpen={showModal}
                    onClose={handleCloseModal}
                    onSuccess={fetchTasks}
                    taskToEdit={taskToEdit}
                    isReadOnly={!canAddTask}
                />
            )}

            {/* Milestone Modal (If needed) */}
            {showMilestoneModal && (
                <AddMilestoneModal
                    projectId={projectId}
                    project={project}
                    milestones={milestones}
                    onClose={() => setShowMilestoneModal(false)}
                    onSuccess={handleMilestoneSuccess}
                />
            )}
        </>
    );
};

export default TaskBoard;