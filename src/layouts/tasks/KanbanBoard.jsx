import React from 'react';
import { TASK_STATUS_COLUMNS } from '../../utils/taskConstants';
import KanbanColumn from './KanbanColumn';

// Assume currentUser is passed in from the parent page or context
const KanbanBoard = ({ tasksByStatus, dragHandlers, onTaskClick, currentUser,isProjectManager }) => { 
    return (
        <div className="kanban-board">
            {Object.values(TASK_STATUS_COLUMNS).map(column => (
                <KanbanColumn
                    key={column.status}
                    title={column.title}
                    status={column.status}
                    tasks={tasksByStatus[column.status]}
                    onDragStart={dragHandlers.onDragStart}
                    onDrop={dragHandlers.onDrop}
                    onTaskClick={onTaskClick}
                    currentUser={currentUser} // <--- Pass it here
                    isProjectManager={isProjectManager}
                />
            ))}
        </div>
    );
};
export default KanbanBoard;