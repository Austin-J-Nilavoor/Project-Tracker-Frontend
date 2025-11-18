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

const milestoneService = {
    getMilestonesByProject,
    // Add createMilestone, updateMilestone, deleteMilestone here later
};

export default milestoneService;