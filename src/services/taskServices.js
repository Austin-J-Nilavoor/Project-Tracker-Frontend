import api from './api';

const TASK_URL = '/tasks';

/**
 * Fetches all tasks associated with a specific project.
 * Calls GET /api/tasks/project/{projectId}
 * @param {string} projectId - The ID of the project whose tasks to fetch.
 * @returns {Promise<Array>} List of TaskDto objects.
 */
const getTasksByProject = async (projectId) => {
    try {
        const response = await api.get(`${TASK_URL}/project/${projectId}`);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Updates a task's status by dragging and dropping.
 * Calls PUT /api/tasks/{id}/status?status={status}
 * @param {string} taskId - The ID of the task to update.
 * @param {string} newStatus - The new status (e.g., 'IN_PROGRESS', 'COMPLETED').
 * @returns {Promise<object>} The updated TaskDto object.
 */
const updateTaskStatus = async (taskId, newStatus) => {
    try {
        const response = await api.put(`${TASK_URL}/${taskId}/status?status=${newStatus}`);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

const taskService = {
    getTasksByProject,
    updateTaskStatus,
    // Add createTask, updateTask, deleteTask here later
};

export default taskService;