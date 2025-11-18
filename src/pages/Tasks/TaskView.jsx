import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx'; // FIX: Corrected path from ../../ to ../
import taskService from '../../services/taskServices.js'; // FIX: Corrected path from ../../ to ../
import { Plus, Clock, User, Calendar, Tag, Briefcase } from 'lucide-react'; 

// Constants derived from backend TaskStatus enum (excluding ON_HOLD)
const TASK_STATUS_COLUMNS = {
    PENDING: { title: "To Do", status: "PENDING" },
    IN_PROGRESS: { title: "In Progress", status: "IN_PROGRESS" },
    COMPLETED: { title: "Completed", status: "COMPLETED" },
};

// --- Helper Components ---

const UserAvatar = ({ name, id }) => {
    const initial = name ? name.charAt(0) : 'U';
    const colorIndex = (id ? id.charCodeAt(0) : 0) % 5;
    const colorMap = ['bg-avatar-blue', 'bg-avatar-orange', 'bg-avatar-yellow', 'bg-avatar-green', 'bg-avatar-red'];
    
    return (
        <div className={`user-avatar small ${colorMap[colorIndex]}`}>
            {initial}
        </div>
    );
};

const TaskCard = ({ task, onDragStart }) => {
    // Determine priority class for the small dot
    const priorityClass = task.priority.toLowerCase();
    
    // Assignees display (using placeholder names for now)
    const assignees = task.assignedToName ? [{ name: task.assignedToName, id: task.assignedToId }] : [];

    return (
        <div 
            className="task-card"
            draggable
            onDragStart={(e) => onDragStart(e, task.id)}
            data-task-id={task.id}
        >
            <div className="task-card-header">
                <h4 className="task-title">{task.title}</h4>
                <div className={`priority-dot ${priorityClass}`}></div>
            </div>
            
            <p className="task-meta">{task.projectName}</p>

            <div className="task-footer">
                <div className="task-due-date">
                    <Calendar size={14} />
                    <span>{task.dueDate}</span>
                </div>
                <div className="task-assigned-users">
                    {assignees.map(a => (
                        <UserAvatar key={a.id} name={a.name} id={a.id} />
                    ))}
                    {/* Add more avatars if needed, or a +N count */}
                </div>
            </div>
        </div>
    );
};


const TaskBoard = () => {
    // --- State and Context ---
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    // NOTE: In a real app, projectId would come from URL params (useParams)
    const projectId = "7674e452-c9e3-4fae-a5b5-75d0abe57fb6"; 

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [draggedTaskId, setDraggedTaskId] = useState(null);

    // Group tasks by status for display
    const tasksByStatus = useMemo(() => {
        const groups = {};
        // Initialize groups only for the statuses we want to display
        Object.keys(TASK_STATUS_COLUMNS).forEach(key => groups[key] = []); 
        
        tasks.forEach(task => {
            // Only assign tasks if the status matches a defined column key
            if (groups[task.status]) {
                groups[task.status].push(task);
            }
        });
        return groups;
    }, [tasks]);

    // --- Data Fetching ---

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch tasks for the mock project ID
            const fetchedTasks = await taskService.getTasksByProject(projectId);
            setTasks(fetchedTasks);
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Failed to load tasks.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);
    
    // --- Drag and Drop Handlers ---

    const handleDragStart = (e, taskId) => {
        e.dataTransfer.setData("taskId", taskId);
        setDraggedTaskId(taskId);
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // Necessary to allow dropping
        e.currentTarget.classList.add('drag-over');
    };

    const handleDragLeave = (e) => {
        e.currentTarget.classList.remove('drag-over');
    };

    const handleDrop = async (e, newStatus) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');

        const taskId = e.dataTransfer.getData("taskId");
        if (!taskId || taskId === draggedTaskId && tasks.find(t => t.id === taskId)?.status === newStatus) {
            return; // Dropped back in the same column or invalid task ID
        }

        setDraggedTaskId(null); // Clear the dragged state

        // Optimistic UI update
        setTasks(prevTasks => prevTasks.map(t => 
            t.id === taskId ? { ...t, status: newStatus } : t
        ));

        try {
            // API Call: PUT /api/tasks/{taskId}/status?status={newStatus}
            await taskService.updateTaskStatus(taskId, newStatus);
            // Re-fetch data to confirm backend update and sync state
            fetchTasks(); 
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Failed to update task status.";
            setError(`Status update failed: ${errorMessage}`);
            // Revert UI change if API fails (by simply re-fetching original state)
            fetchTasks(); 
        }
    };
    
    // --- Render Logic ---

    if (loading) {
        return <div className="dashboard-wrapper loading-state">Loading Kanban board...</div>;
    }

    if (error) {
        return (
            <div className="dashboard-wrapper error-state">
                <div className="error-box">Error: {error}</div>
            </div>
        );
    }
    
    return (
        <div className="task-board-wrapper">
            <div className="kanban-header">
                <h1 className="greeting-title">Task Board</h1>
                <button 
                    onClick={() => console.log("Open Task Creation Modal")}
                    className="btn btn-primary"
                >
                    <Plus size={18} />
                    <span>Add New Task</span>
                </button>
            </div>

            <div className="kanban-board">
                {Object.values(TASK_STATUS_COLUMNS).map(column => (
                    <div 
                        key={column.status}
                        className="kanban-column"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, column.status)}
                    >
                        <div className="column-title-bar">
                            <span>{column.title}</span>
                            <span className="column-count">
                                {tasksByStatus[column.status].length}
                            </span>
                        </div>

                        <div className="column-tasks">
                            {tasksByStatus[column.status].map(task => (
                                <TaskCard 
                                    key={task.id} 
                                    task={task} 
                                    onDragStart={handleDragStart} 
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TaskBoard;