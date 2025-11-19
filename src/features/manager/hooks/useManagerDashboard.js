import { useState, useEffect, useCallback, useMemo } from 'react';
import projectService from '../../../services/projectServices';
import userService from '../../../services/userServices';
import { useAuth } from '../../../context/AuthContext';

export const useManagerDashboard = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [allEmployees, setAllEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [fetchedProjects, fetchedEmployees] = await Promise.all([
                projectService.getAllProjects(),
                userService.getAllUsers()
            ]);

            // UI specific transformations
            const projectsForUI = fetchedProjects.map(p => ({
                ...p,
                managerName: user.name, 
            }));

            setProjects(projectsForUI);
            setAllEmployees(fetchedEmployees);
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Failed to load dashboard data.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [user.name]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Metric Calculations
    const metrics = useMemo(() => {
        if (loading) return null;

        const activeProjects = projects.filter(p => p.status !== 'COMPLETED').length;
        const totalProjects = projects.length;
        const totalEmployees = allEmployees.length;

        // Mock calculations
        const mockAvailable = Math.floor(totalEmployees * 0.20);
        const mockOnLeave = Math.floor(totalEmployees * 0.10);
        const mockOnProjects = totalEmployees - mockAvailable - mockOnLeave;

        return {
            counts: {
                totalProjects,
                activeProjects,
                totalEmployees,
                onTimeCompletion: "92%" // Mock
            },
            availability: {
                total: totalEmployees,
                onProjects: mockOnProjects,
                available: mockAvailable,
                onLeave: mockOnLeave,
            },
            ibuName: allEmployees?.[0]?.ibuName?.toString() || 'N/A'
        };
    }, [projects, allEmployees, loading]);

    return { 
        projects, 
        loading, 
        error, 
        metrics, 
        refreshData: fetchDashboardData 
    };
};