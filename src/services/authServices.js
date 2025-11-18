import api from './api';

const AUTH_URL = '/auth';

/**
 * Handles the login request to the backend.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Promise<object>} The AuthResponse DTO containing token, role, and name.
 */
const login = async (email, password) => {
    try {
        // Calls the backend endpoint POST /api/auth/login
        const response = await api.post(`${AUTH_URL}/login`, { email, password });
        
        // The backend uses an ApiResponse wrapper, so the useful data is inside 'data.data'
        return response.data.data; 
        
    } catch (error) {
        throw error;
    }
};

const authService = {
    login,
};

export default authService;