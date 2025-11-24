import { useState, useEffect, useCallback, useMemo } from 'react';
import userService from '../services/userServices';
import ibuService from '../services/ibuServices';

export const useAdminDashboard = () => {
    const [allUsers, setAllUsers] = useState([]);
    const [ibus, setIbus] = useState(["All"]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter State
    const [filters, setFilters] = useState({
        search: '',
        role: 'All',
        ibu: 'All'
    });

    // --- Fetch Data ---
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [fetchedUsers, fetchedIbus] = await Promise.all([
                userService.getAllUsers(),
                ibuService.getAllIbus()
            ]);

            // Add random colors for avatars
            const usersWithMetadata = fetchedUsers.map(u => ({
                ...u,
                avatarColor: ['blue', 'orange', 'yellow', 'green', 'red'][u.id.charCodeAt(0) % 5]
            }));

            setAllUsers(usersWithMetadata);
            setIbus(["All", ...fetchedIbus.map(i => i.name)]);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Filtering Logic (Memoized) ---
    const filteredUsers = useMemo(() => {
        return allUsers.filter(u => {
            const matchesSearch = filters.search === '' || 
                u.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                u.email.toLowerCase().includes(filters.search.toLowerCase());
            
            const matchesRole = filters.role === 'All' || u.role === filters.role;
            const matchesIbu = filters.ibu === 'All' || u.ibuName === filters.ibu;

            return matchesSearch && matchesRole && matchesIbu;
        });
    }, [allUsers, filters]);

    // --- Actions ---
    const deleteUser = async (userId) => {
        
        try {
            await userService.deleteUser(userId);
            await fetchData(); // Refresh list
        } catch (err) {
            alert(err.response?.data?.message || "Error deleting user.");
        }
    };

    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return {
        users: filteredUsers,
        ibus,
        loading,
        error,
        filters,
        updateFilter,
        deleteUser,
        refreshData: fetchData
    };
};