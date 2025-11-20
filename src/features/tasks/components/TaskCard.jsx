import React from 'react';
import { Calendar } from 'lucide-react';
import UserAvatar from '../../../components/UserAvatar';

const TaskCard = ({ task, onDragStart, onClick, currentUser ,isProjectManager}) => {
    const priorityClass = task.priority.toLowerCase();
    const assignees = task.assignedToName ? [{ name: task.assignedToName, id: task.assignedToId }] : [];

    // PERMISSION LOGIC
    const isManager = currentUser?.role === 'MANAGER'; // Adjust string to match your DB
    const isAssignedToMe = task.assignedToId === currentUser?.id;
   

    // Allowed to drag if: You are PM OR You are the assignee
    const canDrag = isProjectManager || isAssignedToMe || isManager;

    return (
        <div
            className={`task-card ${!isAssignedToMe ? 'disabled' : ''}`} 
            // Only allow draggable attribute if permission check passes
            draggable={canDrag}
            // Prevent drag start logic if permissions fail (double safety)
            onDragStart={(e) => {
                if (canDrag) {
                    onDragStart(e, task.id);
                } else {
                    e.preventDefault();
                }
            }}
            onClick={() => onClick(task)} 
            style={{ pointerEvents: 'all' }} // Ensures they can still click to view details even if greyed out
        >
            <div className="task-card-header">
                <h4 className="task-title">{task.title}</h4>
                <div className={`priority-dot ${priorityClass}`}></div>
            </div>

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