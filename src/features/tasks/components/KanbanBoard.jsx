import React from 'react';
import { TASK_STATUS_COLUMNS } from '../utils/taskConstants';
import KanbanColumn from './KanbanColumn';

// ... imports
const KanbanBoard = ({ tasksByStatus, dragHandlers, onTaskClick }) => { // Accept onTaskClick
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
                    onTaskClick={onTaskClick} // Pass it down
                />
            ))}
        </div>
    );
};
export default KanbanBoard;