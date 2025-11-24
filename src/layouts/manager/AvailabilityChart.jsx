import React from 'react';

const AvailabilityChart = ({ availability }) => {
    if (!availability || availability.total === 0) {
        return <div className="status-message">No employee data.</div>;
    }

    // Updated destructuring to use notInProjects
    const { total, onProjects, notInProjects } = availability;
    const circumference = 283;

    // Calculate percentages safely
    const onProjectsPercent = total > 0 ? (onProjects / total) : 0;
    const notInProjectsPercent = total > 0 ? (notInProjects / total) : 0;

    const onProjectsDasharray = onProjectsPercent * circumference;
    // Dashoffset for the second segment starts where the first one ends
    // Since SVG stroke-dashoffset works counter-clockwise or backwards, we offset by the length of the first segment
    const notInProjectsDashoffset = -onProjectsDasharray; 
    const notInProjectsDasharray = notInProjectsPercent * circumference;

    return (
        <div className="availability-chart-section">
            <div className="availability-chart-ring">
                <svg viewBox="0 0 100 100">
                    {/* Background Circle */}
                    <circle className="chart-ring-bg" cx="50" cy="50" r="45" />
                    
                    {/* On Projects (Yellow/Amber) */}
                    <circle
                        className="chart-ring-on-projects"
                        cx="50" cy="50" r="45"
                        style={{ 
                            strokeDasharray: `${onProjectsDasharray} ${circumference}`, 
                            strokeDashoffset: 0 
                        }}
                    />
                    
                    {/* Not In Projects (Green/Teal - replacing Available) */}
                    <circle
                        className="chart-ring-available" 
                        cx="50" cy="50" r="45"
                        style={{ 
                            strokeDasharray: `${notInProjectsDasharray} ${circumference}`, 
                            strokeDashoffset: notInProjectsDashoffset 
                        }}
                    />
                    
                    {/* Center Text */}
                    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="chart-ring-text">
                        {total}
                    </text>
                    <text x="50%" y="65%" dominantBaseline="middle" textAnchor="middle" className="chart-ring-label">
                        Total
                    </text>
                </svg>
            </div>

            <div className="availability-legend">
                <div><span className="legend-dot dot-on-projects"></span> On Projects ({onProjects})</div>
                {/* Replaced "Available" and "On Leave" with "Not In Projects" */}
                <div><span className="legend-dot dot-available"></span> Not In Projects ({notInProjects})</div>
            </div>
        </div>
    );
};

export default AvailabilityChart;