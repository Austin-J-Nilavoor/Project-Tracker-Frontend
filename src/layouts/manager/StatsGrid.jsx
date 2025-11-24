import React from 'react';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, color, onClick }) => (
    <div
        className={`stat-card stat-card-${color}`}
        onClick={onClick}
        role="button"
        tabIndex={0}
    >
        <p className="stat-title">{title}</p>
        <p className="stat-value">{value}</p>
    </div>
);

const StatsGrid = ({ counts }) => {
    const navigate = useNavigate();
    if (!counts) return null;

    const statsData = [
        { title: "Total Projects", value: counts.totalProjects, color: "blue", onClick: () => navigate('/projects') },
        { title: "Active Projects", value: counts.activeProjects, color: "orange", onClick: () => navigate('/projects') },
        { title: "Total Employees", value: counts.totalEmployees, color: "green",  },
    ];

    return (
        <div className="metrics-grid">
            {statsData.map(stat => (
                <StatCard key={stat.title} {...stat} />
            ))}
        </div>
    );
};

export default StatsGrid;
