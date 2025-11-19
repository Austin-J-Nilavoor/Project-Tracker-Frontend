import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, ArrowRight, Circle } from 'lucide-react';
import taskService from '../../../services/taskServices';

const InProgressTasksWidget = ({ milestones }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeMilestone, setActiveMilestone] = useState(null);
    const navigate = useNavigate();

    // 1. Identify the Active Milestone
    useEffect(() => {
        if (!milestones) return;
        const current = milestones.find(m => m.status === 'IN_PROGRESS');
        setActiveMilestone(current || null);
    }, [milestones]);

    // 2. Fetch Tasks for that Milestone
    useEffect(() => {
        const fetchTasks = async () => {
            if (!activeMilestone) {
                setTasks([]);
                return;
            }

            setLoading(true);
            try {
                const data = await taskService.getTasksByMilestone(activeMilestone.id);
                // Filter for IN_PROGRESS only
                const inProgress = data.filter(t => t.status === 'IN_PROGRESS');
                setTasks(inProgress);
            } catch (error) {
                console.error("Failed to fetch active tasks", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [activeMilestone]);

    if (!activeMilestone) return null;

    return (
        <div className="sidebar-card">
            <div className="section-heading">
                <h3>IN PROGRESS</h3>
            </div>
            
            <div style={{ marginBottom: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
                Current Phase: <span style={{ fontWeight: '600', color: '#334155' }}>{activeMilestone.name}</span>
            </div>

            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.85rem' }}>
                   <Loader size={14} className="animate-spin" /> Loading tasks...
                </div>
            ) : tasks.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
                    No tasks currently in progress.
                </p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {tasks.slice(0, 5).map(task => (
                        <li 
                            key={task.id} 
                            style={{
                                padding: '0.6rem 0',
                                borderBottom: '1px dashed #e2e8f0',
                                display: 'flex',
                                alignItems: 'start',
                                gap: '0.6rem',
                                cursor: 'pointer'
                            }}
                            // Clicking a task takes you to the board filtered by this milestone
                            onClick={() => navigate(`/projects/${task.projectId}/milestones/${activeMilestone.id}/tasks`)}
                        >
                            <Circle size={10} fill="#3b82f6" color="#3b82f6" style={{ marginTop: '5px', flexShrink: 0 }} />
                            <span style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.4', fontWeight: '500' }}>
                                {task.title}
                            </span>
                        </li>
                    ))}
                </ul>
            )}

            {tasks.length > 0 && (
                <button 
                    style={{
                        width: '100%',
                        marginTop: '1rem',
                        padding: '0.5rem',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        color: '#475569',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        transition: 'all 0.2s'
                    }}
                    onClick={() => navigate(`/projects/${activeMilestone.projectId}/milestones/${activeMilestone.id}/tasks`)}
                >
                    View Board <ArrowRight size={12}/>
                </button>
            )}
        </div>
    );
};

export default InProgressTasksWidget;