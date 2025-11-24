import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Circle, Target } from 'lucide-react';
import milestoneService from '../../services/milestoneServices';
import '../../styles/MilestoneProgressBar.css';

const MilestoneProgressBar = ({ projectId, activeMilestoneId }) => {
    const [milestones, setMilestones] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // ---- Sort milestones in dependency order ----
    const sortByDependency = (list) => {
        if (!list || list.length === 0) return list;

        // Create a map for quick lookup
        const map = new Map();
        list.forEach(m => map.set(m.id, m));

        // Root milestone = one with no dependsOnId
        const root = list.find(m => !m.dependsOnId);
        if (!root) return list; // fallback

        const ordered = [];
        let current = root;

        // Traverse dependency chain
        while (current) {
            ordered.push(current);
            current = list.find(m => m.dependsOnId === current.id);
        }

        // Add leftover items (orphans / invalid chain)
        if (ordered.length !== list.length) {
            const remaining = list.filter(m => !ordered.includes(m));
            return [...ordered, ...remaining];
        }

        return ordered;
    };

    useEffect(() => {
        const fetchMilestones = async () => {
            if (!projectId) return;

            try {
                const data = await milestoneService.getMilestonesByProject(projectId);

                // Sort milestones according to dependency hierarchy
                const orderedMilestones = sortByDependency(data);

                setMilestones(orderedMilestones);
            } catch (error) {
                console.error("Failed to fetch milestones for timeline", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMilestones();
    }, [projectId]);

    if (loading) return <div className="milestone-bar-skeleton">Loading Timeline...</div>;
    if (milestones.length === 0) return null;

    return (
        <div className="milestone-progress-container">
            <div className="milestone-progress-bar">

                {/* Background timeline line */}
                <div className="progress-line-bg"></div>

                {milestones.map((milestone) => {
                    const isActive = milestone.id === activeMilestoneId;
                    const isCompleted = milestone.status === 'COMPLETED';
                    const inProgress = milestone.status === 'IN_PROGRESS';
                    const isPending = milestone.status === 'PENDING';


                    let statusClass = 'pending';
                    if (isCompleted) statusClass = 'completed';
                    if (isActive) statusClass = 'active';

                    return (
                        <div
                            key={milestone.id}
                            className={`milestone-node ${statusClass}`}
                            onClick={() => navigate(`/projects/${projectId}/milestones/${milestone.id}/tasks`)}
                            title={`${milestone.name} - ${milestone.status}`}
                        >
                            <div className="node-icon">
                                {isCompleted ? (
                                    <CheckCircle size={16} />
                                ) : inProgress ? <Target size={16} />
                                    : isActive ? (
                                        <Circle size={14} />
                                    ) : (
                                        <Circle size={14} />
                                    )}
                            </div>

                            <div className="node-label">
                                <span className="node-name">{milestone.name}</span>
                            </div>
                        </div>
                    );
                })}

            </div>
        </div>
    );
};

export default MilestoneProgressBar;
