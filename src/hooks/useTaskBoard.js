import { useState, useEffect, useCallback, useMemo } from 'react';
import taskService from '../services/taskServices';
import { TASK_STATUS_COLUMNS } from '../utils/taskConstants';

// Updated signature to accept milestoneId as the second argument
export const useTaskBoard = (projectId, milestoneId) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [draggedTaskId, setDraggedTaskId] = useState(null);

    // --- Fetch Data ---
    const fetchTasks = useCallback(async () => {
        // Validate that at least one ID is present to fetch data
        if (!projectId && !milestoneId) return;

        setLoading(true);
        setError(null);
        try {
            let fetchedTasks = [];

            // LOGIC: Check milestoneId first (Priority), then projectId
            if (milestoneId) {
                fetchedTasks = await taskService.getTasksByMilestone(milestoneId);
            } else if (projectId) {
                fetchedTasks = await taskService.getTasksByProject(projectId);
            }

            setTasks(fetchedTasks);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load tasks.");
        } finally {
            setLoading(false);
        }
    }, [projectId, milestoneId]); // Dependencies updated to include milestoneId

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // --- Memoized Grouping ---
    const tasksByStatus = useMemo(() => {
        const groups = {};
        // Initialize columns based on constants
        Object.keys(TASK_STATUS_COLUMNS).forEach(key => groups[key] = []);
        
        tasks.forEach(task => {
            // Default to PENDING if status is missing or undefined
            const statusKey = task.status ? task.status : 'PENDING';
            if (groups[statusKey]) {
                groups[statusKey].push(task);
            }
        });
        return groups;
    }, [tasks]);

    // --- Drag & Drop Handlers ---
    const onDragStart = (e, taskId) => {
        e.dataTransfer.setData("taskId", taskId);
        setDraggedTaskId(taskId);
    };

    const onDrop = async (e, newStatus) => {
        const taskId = e.dataTransfer.getData("taskId");
        
        // Validation: Prevent dropping if invalid or dropped in the same column
        if (!taskId || (taskId === draggedTaskId && tasks.find(t => t.id === taskId)?.status === newStatus)) {
            return;
        }

        setDraggedTaskId(null);

        // 1. Optimistic Update
        const originalTasks = [...tasks];
        setTasks(prev => prev.map(t => 
            t.id === taskId ? { ...t, status: newStatus } : t
        ));

        try {
            // 2. API Call
            await taskService.updateTaskStatus(taskId, newStatus);
            // Optional: Re-fetch to ensure sync
            // await fetchTasks(); 
        } catch (err) {
            // 3. Rollback on failure
            setError(`Status update failed: ${err.message}`);
            setTasks(originalTasks);
        }
    };

    return {
        tasksByStatus,
        loading,
        error,
        fetchTasks,
        dragHandlers: { onDragStart, onDrop }
    };
};