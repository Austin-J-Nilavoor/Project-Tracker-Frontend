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
        const response = await api.post(`${AUTH_URL}/login`, { email, password });
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Handles user registration.
 * @param {object} userData - All registration fields.
 * Example:
 * {
 *   name: "",
 *   email: "",
 *   password: "",
 *   role: "",
 *   phone: "",
 *   ibuId: ""
 * }
 * @returns {Promise<object>} ApiResponse containing created user.
 */
const register = async (userData) => {
    try {
        const response = await api.post(`${AUTH_URL}/register`, userData);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

const authService = {
    login,
    register,
};

export default authService;
