import React from 'react';
import { Calendar } from 'lucide-react';
import UserAvatar from '../../../components/UserAvatar';

const TaskCard = ({ task, onDragStart, onClick }) => {
    const priorityClass = task.priority.toLowerCase();
    const assignees = task.assignedToName ? [{ name: task.assignedToName, id: task.assignedToId }] : [];

    return (
        <div
            className="task-card"
            draggable
            onDragStart={(e) => onDragStart(e, task.id)}
            // Simply calling the onClick handler passed from parent
            onClick={() => onClick(task)} 
        >
            <div className="task-card-header">
                <h4 className="task-title">{task.title}</h4>
                <div className={`priority-dot ${priorityClass}`}></div>
            </div>

            {/* <p className="task-meta">{task.projectName}</p> */}

            <div className="task-footer">
                <div className="task-due-date">
                    <Calendar size={14} />
                    <span>{task.dueDate || "No Date"}</span>
                </div>
                <div className="task-assigned-users">
                    {assignees.map(a => (
                        <UserAvatar key={a.id} name={a.name} id={a.id} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TaskCard;