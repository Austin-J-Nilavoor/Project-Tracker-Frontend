import api from './api';

const USER_URL = '/users';

/**
 * Fetches the list of users from the backend. 
 * The backend automatically filters this list based on the user's role 
 * (e.g., Admin sees all, Manager sees IBU members).
 * * @returns {Promise<Array>} List of UserDto objects.
 */
const getAllUsers = async () => {
    try {
        // Calls GET /api/users
        const response = await api.get(USER_URL);
        
        // The backend wraps data in ApiResponse<T>, so we extract the 'data' field.
        return response.data.data; 
        
    } catch (error) {
        console.log("Error fetching users:", error);
        // Re-throw the error to be handled by the component (AdminManagement.jsx).
        throw error;
    }
};

/**
 * Deletes a user by ID. Only callable by ADMIN role (as enforced by Spring Security).
 * * @param {string} userId - The ID of the user to delete.
 * @returns {Promise<void>}
 */
const deleteUser = async (userId) => {
    try {
        // Calls DELETE /api/users/{userId}
        await api.delete(`${USER_URL}/${userId}`);
    } catch (error) {
        throw error;
    }
};

/**
 * Placeholder for creating a new user (usually requires ADMIN access and includes IBU/Role).
 * * @param {object} userData - UserDto or RegisterRequest data.
 * @returns {Promise<object>} The created UserDto.
 */
const createUser = async (userData) => {
    // NOTE: In your backend, user creation goes to /api/auth/register and is restricted to ADMIN.
    // For simplicity, we can use the main /users endpoint if a regular user creation flow is built.
    // Assuming a future PUT/POST to /users endpoint for user management:
    try {
        const response = await api.post(USER_URL, userData);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};


const updateUser = async (userId, userData) => {
    try {
        const response = await api.put(`${USER_URL}/${userId}`, userData);
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

const userService = {
    getAllUsers,
    deleteUser,
    createUser,
    updateUser, // Export the new function
};

export default userService;