import api from './api';

const PROJECT_URL = '/projects';

/**
 * Fetches the list of projects relevant to the logged-in user.
 * @returns {Promise<Array>} List of ProjectDto objects.
 */
const getAllProjects = async () => {
    try {
        const response = await api.get(PROJECT_URL);
        return response.data.data; 
        
    } catch (error) {
        throw error;
    }
};

/**
 * Fetches details for a single project by ID.
 * Calls GET /api/projects/{projectId}
 * @param {string} projectId - The ID of the project.
 * @returns {Promise<object>} The ProjectDto object.
 */
const getProjectById = async (projectId) => {
    try {
        const response = await api.get(`${PROJECT_URL}/${projectId}`);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Creates a new project.
 * @param {object} projectData - The ProjectDto structure
 * @returns {Promise<object>} The created ProjectDto.
 */
const createProject = async (projectData) => {
    try {
        const response = await api.post(PROJECT_URL, projectData);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};


const updateProject = async (projectId, projectData) => {
    try {
        const response = await api.put(`${PROJECT_URL}/${projectId}`, projectData);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Deletes a project by ID.
 * @param {string} projectId - ID of the project to delete
 * @returns {Promise<any>} Response data
 */
const deleteProject = async (projectId) => {
    try {
        const response = await api.delete(`${PROJECT_URL}/${projectId}`);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

const projectService = {
    getAllProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject, // Added here
};

export default projectService;