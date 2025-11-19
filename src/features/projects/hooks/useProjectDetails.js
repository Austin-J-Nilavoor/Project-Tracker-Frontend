import { useState, useEffect, useCallback } from 'react';
import projectService from '../../../services/projectServices';
import projectMemberService from '../../../services/membersServices';
import milestoneService from '../../../services/milestoneServices';
import userService from '../../../services/userServices';
import taskService from '../../../services/taskServices'; // Import task service

// --- Utility: Topological Sort ---
const topologicalSort = (milestones) => {
    if (!milestones || milestones.length === 0) return [];
    const nodes = new Map();
    const dependencies = new Map();

    milestones.forEach(m => {
        nodes.set(m.id, m);
        dependencies.set(m.id, m.dependsOnId || null);
    });

    const sortedList = [];
    const visited = new Set();
    const visiting = new Set();

    const visit = (milestoneId) => {
        if (visited.has(milestoneId)) return;
        if (visiting.has(milestoneId)) return; 

        visiting.add(milestoneId);
        const dependencyId = dependencies.get(milestoneId);

        if (dependencyId && nodes.has(dependencyId)) {
            visit(dependencyId);
        }

        visiting.delete(milestoneId);
        visited.add(milestoneId);
        sortedList.push(nodes.get(milestoneId));
    };

    milestones.forEach(m => visit(m.id));
    return sortedList;
};

export const useProjectDetails = (projectId) => {
    const [project, setProject] = useState(null);
    const [members, setMembers] = useState([]);
    const [milestones, setMilestones] = useState([]);
    const [tasks, setTasks] = useState([]); // State for tasks
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        if (!projectId) {
            setError("Project ID missing.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Fetch all related data in parallel
            const [proj, mems, miles, tks, users] = await Promise.all([
                projectService.getProjectById(projectId),
                projectMemberService.getMembersByProject(projectId),
                milestoneService.getMilestonesByProject(projectId),
                taskService.getTasksByProject(projectId), // Fetch tasks
                userService.getAllUsers()
            ]);

            setProject(proj);
            setMembers(mems);
            setAllUsers(users);
            setTasks(tks);
            setMilestones(topologicalSort(miles));

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to load project details.");
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        project,
        members,
        milestones,
        tasks, // Export tasks
        allUsers,
        loading,
        error,
        refreshData: fetchData
    };
};