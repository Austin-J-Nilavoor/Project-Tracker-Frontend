import { useState, useEffect, useCallback, useMemo } from 'react';
import projectService from '../../../services/projectServices';

export const useProjectList = () => {
    const [allProjects, setAllProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All');

    // --- Fetch Data ---
    const fetchProjects = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await projectService.getAllProjects();
            setAllProjects(data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load projects.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    // --- Filter Logic (Memoized) ---
    const filteredProjects = useMemo(() => {
        if (activeFilter === 'All') return allProjects;
        return allProjects.filter(p => 
            (p.status || 'PENDING').toUpperCase() === activeFilter
        );
    }, [allProjects, activeFilter]);

    return {
        projects: filteredProjects,
        loading,
        error,
        activeFilter,
        setActiveFilter,
        refreshData: fetchProjects
    };
};