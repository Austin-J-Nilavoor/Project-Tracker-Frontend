import React from 'react';
import TaskCard from './TaskCard';

const KanbanColumn = ({ title, status, tasks, onDragStart, onDrop ,onTaskClick}) => {
    
    const handleDragOver = (e) => {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    };

    const handleDragLeave = (e) => {
        e.currentTarget.classList.remove('drag-over');
    };

    const handleDropEvent = (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        onDrop(e, status);
    };

    return (
        <div
            className="kanban-column"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDropEvent}
        >
            <div className="column-title-bar">
                <span>{title}</span>
                <span className="column-count">{tasks.length}</span>
            </div>

            <div className="column-tasks">
                {tasks.map(task => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        onDragStart={onDragStart}
                        onClick={onTaskClick}
                    />
                ))}
            </div>
        </div>
    );
};

export default KanbanColumn;