import api from './api';

const MILESTONE_URL = '/milestones';

/**
 * Fetches all milestones for a specific project.
 * Calls GET /api/milestones/project/{projectId}
 * @param {string} projectId - The ID of the project.
 * @returns {Promise<Array>} List of MilestoneDto objects.
 */
const getMilestonesByProject = async (projectId) => {
    try {
        const response = await api.get(`${MILESTONE_URL}/project/${projectId}`);
        
        // The backend wraps data in ApiResponse<T>, so we extract the 'data' field.
        return response.data.data; 
        
    } catch (error) {
        throw error;
    }
};
const createMilestone = async (data) => {
    const response = await api.post(`/milestones`, data);
    return response.data.data;
};

const getMilestoneById = async (milestoneId) => {
    try {
        const response = await api.get(`${MILESTONE_URL}/${milestoneId}`);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

const updateMilestone = async (milestoneId, milestoneData) => {
    try {
        const response = await api.put(`${MILESTONE_URL}/${milestoneId}`, milestoneData);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Deletes a milestone by ID.
 * Calls DELETE /api/milestones/{milestoneId}
 * @param {string} milestoneId 
 */
const deleteMilestone = async (milestoneId) => {
    try {
        await api.delete(`${MILESTONE_URL}/${milestoneId}`);
    } catch (error) {
        throw error;
    }
};

const milestoneService = {
    getMilestonesByProject,
    getMilestoneById,
    createMilestone,
    updateMilestone,
    deleteMilestone, // Export the new function
};

export default milestoneService;