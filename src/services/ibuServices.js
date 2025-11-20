import api from './api';

const IBU_URL = '/ibus'; // Assuming the backend endpoint for IBUs is /api/ibus

/**
 * Fetches the list of all Independent Business Units (IBUs) from the backend.
 * Calls GET /api/ibus
 * @returns {Promise<Array>} List of IbuDto objects.
 */
const getAllIbus = async () => {
    try {
        const response = await api.get(IBU_URL);
        
        // The backend wraps data in ApiResponse<T>, so we extract the 'data' field.
        return response.data.data; 
        
    } catch (error) {
        // Log the error for debugging and re-throw for component handling
        console.error("Error fetching IBUs:", error);
        throw error;
    }
};

/**
 * Creates a new IBU.
 * Calls POST /api/ibus
 * @param {object} ibuData - { name: string }
 */
const createIbu = async (ibuData) => {
    try {
        const response = await api.post(IBU_URL, ibuData);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

const ibuService = {
    getAllIbus,
    createIbu, // Export the new function
};

export default ibuService;