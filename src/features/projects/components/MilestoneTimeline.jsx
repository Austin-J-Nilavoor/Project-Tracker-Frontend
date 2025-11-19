import React from 'react';
import { Check, Anchor, Clock, Edit2 } from 'lucide-react';
import { formatDateFull } from '../../../utils/dateFormater'; // Import date formatter

const MilestoneItem = ({ milestone, index, isLast, onEdit }) => {
 
    const statusText = milestone.status.toUpperCase().replace(/ /g, '_');
    const statusClass = statusText.toLowerCase().replace(/_/g, '-');
    const isCurrent = statusText === 'IN_PROGRESS';

    let Icon = Clock;
    if (statusText === 'COMPLETED') Icon = Check;
    if (statusText === 'IN_PROGRESS') Icon = Anchor;

    return (
        <div 
            className={`milestone-item status-${statusClass} ${isCurrent ? 'is-current' : ''}`}
            style={{ cursor: onEdit ? 'pointer' : 'default', position: 'relative' }}
            onClick={() => onEdit && onEdit(milestone)}
            title={onEdit ? "Click to edit milestone" : ""}
        >
            <div className="milestone-timeline">
                <div className="milestone-icon-wrapper">
                    <Icon size={16} className="milestone-icon" />
                </div>
                {!isLast && <div className="milestone-line"></div>}
            </div>
            <div className="milestone-details" style={{ flexGrow: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 className="milestone-name">Phase {index + 1}: {milestone.name}</h4>
                    {/* {onEdit && <Edit2 size={12} color="#94a3b8" />} */}
                </div>
                
                {/* Use Format Date Full */}
                <p className="milestone-dates">
                    {formatDateFull(milestone.startDate)} - {formatDateFull(milestone.endDate)}
                </p>
                
                <p className="milestone-status">{statusText.replace(/_/g, ' ')}</p>
            </div>
        </div>
    );
};

const MilestoneTimeline = ({ milestones, onAddClick, onEditClick, projectId }) => {
    return (
        <div className="milestone-timeline-section">
            <div className="section-heading milestone-header">
                <h3>MILESTONES TIMELINE</h3>
                {/* Only show button if a handler is provided */}
                {onAddClick && (
                    <button className="add-member-btn" onClick={onAddClick}>+ Add Milestone</button>
                )}
            </div>
            <div className="milestone-list">
                {milestones.length === 0 ? (
                    <p className="status-message">No milestones defined.</p>
                ) : (
                    milestones.map((m, index) => (
                        <MilestoneItem
                            key={m.id}
                            milestone={m}
                            index={index}
                            isLast={index === milestones.length - 1}
                            projectId={projectId}
                            onEdit={onEditClick} // Pass the edit handler down
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default MilestoneTimeline;