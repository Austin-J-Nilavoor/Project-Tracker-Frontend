import api from './api';

const MEMBER_URL = '/members';

/**
 * Fetches all members associated with a specific project.
 * Calls GET /api/members/project/{projectId}
 * @param {string} projectId - The ID of the project.
 * @returns {Promise<Array>} List of ProjectMemberDto objects.
 */
const getMembersByProject = async (projectId) => {
    try {
        const response = await api.get(`${MEMBER_URL}/project/${projectId}`);

        // The backend wraps data in ApiResponse<T>, so we extract the 'data' field.
        return response.data.data;

    } catch (error) {
        throw error;
    }
};

/**
 * Adds a member to a project.
 * Calls POST /api/members/add
 * @param {object} payload - { projectId, userId, role }
 * @returns {Promise<object>} ApiResponse<ProjectMemberDto>
 */
const addMember = async (payload) => {
    try {
        const response = await api.post(`${MEMBER_URL}`, payload);

        return response.data.data;
    } catch (error) {
        throw error;
    }
};
/**
 * Removes a member from a project.
 * Calls DELETE /api/members/project/{projectId}/user/{userId}
 * @param {string} projectId 
 * @param {string} userId 
 */
const removeMember = async (projectId, userId) => {
    try {
        // Assuming your backend endpoint structure follows this pattern:
        await api.delete(`${MEMBER_URL}/project/remove-member`, {
            params: { projectId, userId }
        });

    } catch (error) {
        throw error;
    }
};

const projectMemberService = {
    getMembersByProject,
    addMember,
    removeMember
};

export default projectMemberService;