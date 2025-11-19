import React from 'react';
import { ChevronDown, Trash2 } from 'lucide-react';
import UserAvatar from '../../../components/UserAvatar';
// Import the new widget
import InProgressTasksWidget from './InProgressTasksWidget';

const MemberItem = ({ name, id, onRemove }) => {
    return (
        <div className="member-card">
            <UserAvatar name={name} id={id} />
            <div className="member-details">
                <p className="member-name">{name}</p>
            </div>
            {onRemove && (
                <button 
                    onClick={() => onRemove(id)} 
                    style={{ 
                        marginLeft: 'auto', 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer', 
                        color: '#94a3b8',
                        padding: '4px'
                    }}
                    className="remove-member-btn"
                    title="Remove Member"
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                >
                    <Trash2 size={16} />
                </button>
            )}
        </div>
    );
};

// Updated props to accept milestones and remove handler
const TeamSidebar = ({ members, onAddClick, onRemoveClick, milestones }) => {
    const managers = members.filter(m => m.role === 'PROJECT_MANAGER');
    const team = members.filter(m => m.role !== 'PROJECT_MANAGER');

    return (
        <div className="project-sidebar">
            <InProgressTasksWidget milestones={milestones} />
            {/* 1. Team Section */}
            <div className="team-section sidebar-card">
                <div className="section-heading">
                    <h3>TEAM</h3>
                    {onAddClick && (
                        <button className="add-member-btn" onClick={onAddClick}>+ Add Member</button>
                    )}
                </div>

                {managers.length > 0 && (
                    <div className="project-manager-info">
                        <h4>Project Managers ({managers.length})</h4>
                        {managers.map(pm => (
                            <MemberItem 
                                key={pm.userId} 
                                id={pm.userId} 
                                name={pm.userName}
                                // Typically managers might require stricter permissions to remove
                                // You can pass onRemoveClick here if desired, or null to disable
                                onRemove={onRemoveClick} 
                            />
                        ))}
                    </div>
                )}

                <h4 className="team-members-title">Team Members ({team.length})</h4>
                <div className="team-members-list">
                    {team.length === 0 ? (
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic', padding: '10px 0' }}>
                            No team members assigned.
                        </p>
                    ) : (
                        team.map(m => (
                            <MemberItem 
                                key={m.userId} 
                                id={m.userId} 
                                name={m.userName} 
                                onRemove={onRemoveClick}
                            />
                        ))
                    )}
                </div>
            </div>
            
            {/* 2. New In Progress Tasks Widget */}
            

        </div>
    );
};

export default TeamSidebar;