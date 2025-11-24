import { useState, useEffect, useCallback, useMemo } from 'react';
import projectService from '../services/projectServices';
import userService from '../services/userServices';
import projectMemberService from '../services/membersServices'; // Import member service
import { useAuth } from '../context/AuthContext';

export const useManagerDashboard = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [allEmployees, setAllEmployees] = useState([]);
    const [assignedUserCount, setAssignedUserCount] = useState(0); // State for assigned users
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // 1. Fetch basic data
            const [fetchedProjects, fetchedEmployees] = await Promise.all([
                projectService.getAllProjects(),
                userService.getAllUsers()
            ]);

            // 2. Fetch members for ALL projects to find who is assigned
            // We map over fetchedProjects to create an array of promises
            const projectMemberPromises = fetchedProjects.map(project => 
                projectMemberService.getMembersByProject(project.id)
            );
            
            const projectMembersResults = await Promise.all(projectMemberPromises);

            // 3. Calculate unique assigned users
            const assignedUserIds = new Set();
            projectMembersResults.forEach(membersList => {
                // membersList is an array of member objects for one project
                if (Array.isArray(membersList)) {
                    membersList.forEach(member => {
                        if (member.userId) {
                            assignedUserIds.add(member.userId);
                        }
                    });
                }
            });

            setAssignedUserCount(assignedUserIds.size);

            // UI specific transformations
            const projectsForUI = fetchedProjects.map(p => ({
                ...p,
                managerName: user.name, 
            }));

            setProjects(projectsForUI);
            setAllEmployees(fetchedEmployees);
        } catch (err) {
            console.error(err);
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

        // Real calculations based on API data
        const onProjects = assignedUserCount;
        
        // "Not in Projects" is simply Total - Assigned
        // Ensure we don't get negative numbers if data is out of sync
        const notInProjects = Math.max(0, totalEmployees - onProjects);

        return {
            counts: {
                totalProjects,
                activeProjects,
                totalEmployees,
                onTimeCompletion: "92%" // Mock
            },
            availability: {
                total: totalEmployees,
                onProjects: onProjects,
                notInProjects: notInProjects, // Replaces available/onLeave
            },
            ibuName: allEmployees?.[0]?.ibuName?.toString() || 'N/A'
        };
    }, [projects, allEmployees, assignedUserCount, loading]);

    return { 
        projects, 
        loading, 
        error, 
        metrics, 
        refreshData: fetchDashboardData 
    };
};