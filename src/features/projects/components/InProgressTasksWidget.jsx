import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, ArrowRight, Circle, ChevronRight } from 'lucide-react';
import taskService from '../../../services/taskServices';

const TaskItem = ({ task, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <li 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
            style={{
                padding: '0.75rem 0.5rem',
                borderBottom: '1px dashed #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between', // Space between content and arrow
                cursor: 'pointer',
                backgroundColor: isHovered ? '#f8fafc' : 'transparent', // Hover effect
                transition: 'background-color 0.2s ease',
                borderRadius: '6px'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
                <Circle size={10} fill="#3b82f6" color="#3b82f6" style={{ flexShrink: 0 }} />
                <span style={{ 
                    fontSize: '0.85rem', 
                    color: isHovered ? '#1e293b' : '#334155', // Darken text on hover
                    lineHeight: '1.4', 
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {task.title}
                </span>
            </div>
            {/* Visual cue pointing to the task */}
            <ChevronRight 
                size={14} 
                color={isHovered ? '#3b82f6' : '#94a3b8'} 
                style={{ flexShrink: 0, transition: 'color 0.2s' }} 
            />
        </li>
    );
};

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

    const handleNavigate = () => {
        navigate(`/projects/${activeMilestone.projectId}/milestones/${activeMilestone.id}/tasks`);
    };

    return (
        <div className="sidebar-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="section-heading">
                <h3>IN PROGRESS</h3>
            </div>
            
            <div style={{ marginBottom: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
                Current Phase: <span style={{ fontWeight: '600', color: '#334155' }}>{activeMilestone.name}</span>
            </div>

            <div style={{ flexGrow: 1, marginBottom: '1rem' }}>
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.85rem', padding: '1rem 0' }}>
                       <Loader size={14} className="animate-spin" /> Loading tasks...
                    </div>
                ) : tasks.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic', padding: '1rem 0' }}>
                        No tasks currently in progress.
                    </p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {tasks.slice(0, 5).map(task => (
                            <TaskItem 
                                key={task.id} 
                                task={task} 
                                onClick={handleNavigate} 
                            />
                        ))}
                    </ul>
                )}
            </div>

            {/* "Always Forwards" Option: Button is now rendered regardless of task count */}
            <button 
                style={{
                    width: '100%',
                    marginTop: 'auto', // Pushes button to bottom if container has height
                    padding: '0.6rem',
                    background: '#fff',
                    border: '1px solid #3b82f6',
                    borderRadius: '6px',
                    color: '#3b82f6',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#eff6ff';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#fff';
                }}
                onClick={handleNavigate}
            >
                Go to Task Board <ArrowRight size={14}/>
            </button>
        </div>
    );
};

export default InProgressTasksWidget;