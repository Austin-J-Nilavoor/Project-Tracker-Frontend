import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const ProjectSummary = ({ project, milestones = [], tasks = [] }) => {
    const navigate = useNavigate();

    // --- Metrics Calculation (Kept from previous step) ---
    const metrics = useMemo(() => {
        const totalMilestones = milestones.length;
        const completedMilestones = milestones.filter(m => m.status === 'COMPLETED').length;
        
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;

        // Calculate Overall Progress
        let percentage = 0;
        if (totalMilestones > 0) {
            percentage = Math.round((completedMilestones / totalMilestones) * 100);
        }

        return {
            totalMilestones,
            completedMilestones,
            totalTasks,
            completedTasks,
            percentage
        };
    }, [milestones, tasks]);

    return (
        <>
            <div className="summary-section">
                <h3 className="section-heading">PROJECT SUMMARY</h3>
                <p className="project-description">
                    {project.description || "No description provided."}
                </p>
                <div className="project-dates">
                    <span>Start: {project.startDate}</span>
                    <span>End: {project.endDate}</span>
                    </div>
            </div>

            <div className="progress-metrics-section">
                {/* Reverted to original header style with dynamic percentage */}
                <h3 className="section-heading">OVERALL PROGRESS ({metrics.percentage}%)</h3>
                
                <div className="progress-bar-large">
                    <div 
                        className="progress-fill" 
                        style={{ width: `${metrics.percentage}%` }}
                    ></div>
                </div>

                {/* Reverted to original card style with dynamic numbers */}
                <div className="metric-cards-grid">
                    <div className="metric-card">
                        <h3>{metrics.totalMilestones}</h3>
                        <p>Total Milestones</p>
                    </div>
                    <div className="metric-card">
                        <h3>{metrics.completedMilestones}</h3>
                        <p>Completed</p>
                    </div>
                    <div className="metric-card">
                        <h3>{metrics.totalTasks}</h3>
                        <p>Total Tasks</p>
                    </div>
                    <div className="metric-card">
                        <h3>{metrics.completedTasks}</h3>
                        <p>Completed</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProjectSummary;