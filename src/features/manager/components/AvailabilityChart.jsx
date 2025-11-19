import React from 'react';

const AvailabilityChart = ({ availability }) => {
    if (!availability || availability.total === 0) {
        return <div className="status-message">No employee data.</div>;
    }

    const { total, onProjects, available, onLeave } = availability;
    const circumference = 283;

    // Calculate percentages safely
    const availablePercent = total > 0 ? (available / total) : 0;
    const onProjectsPercent = total > 0 ? (onProjects / total) : 0;

    const availableDashoffset = circumference - (availablePercent * circumference);
    const onProjectsDasharray = onProjectsPercent * circumference;

    return (
        <div className="availability-chart-section">
            <div className="availability-chart-ring">
                <svg viewBox="0 0 100 100">
                    {/* Background */}
                    <circle className="chart-ring-bg" cx="50" cy="50" r="45" />
                    {/* On Projects (Yellow) */}
                    <circle
                        className="chart-ring-on-projects"
                        cx="50" cy="50" r="45"
                        style={{ strokeDasharray: onProjectsDasharray, strokeDashoffset: 0 }}
                    />
                    {/* Available (Green) */}
                    <circle
                        className="chart-ring-available"
                        cx="50" cy="50" r="45"
                        style={{ strokeDasharray: circumference - onProjectsDasharray, strokeDashoffset: availableDashoffset }}
                    />
                    {/* Text */}
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
                <div><span className="legend-dot dot-available"></span> Available ({available})</div>
                <div><span className="legend-dot dot-on-leave"></span> On Leave ({onLeave})</div>
            </div>
        </div>
    );
};

export default AvailabilityChart;