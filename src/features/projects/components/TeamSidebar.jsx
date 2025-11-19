import React from 'react';
import { ChevronDown } from 'lucide-react';
import UserAvatar from '../../../components/UserAvatar';
// Import the new widget
import InProgressTasksWidget from './InProgressTasksWidget';

const MemberItem = ({ name, id }) => {
    return (
        <div className="member-card">
            <UserAvatar name={name} id={id} />
            <div className="member-details">
                <p className="member-name">{name}</p>
            </div>
        </div>
    );
};

// Updated props to accept milestones
const TeamSidebar = ({ members, onAddClick, milestones }) => {
    const managers = members.filter(m => m.role === 'PROJECT_MANAGER');
    const team = members.filter(m => m.role !== 'PROJECT_MANAGER');

    return (
        <div className="project-sidebar">
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
                            <MemberItem key={pm.userId} id={pm.userId} name={pm.userName} />
                        ))}
                    </div>
                )}

                <h4 className="team-members-title">Team Members ({team.length})</h4>
                <div className="team-member-avatars">
                    {team.slice(0, 5).map(m => (
                        <UserAvatar key={m.userId} id={m.userId} name={m.userName} />
                    ))}
                    
                    {team.length > 5 && (
                        <div className="user-avatar small extra-members">
                            +{team.length - 5}
                        </div>
                    )}
                </div>
            </div>
            
            {/* 2. New In Progress Tasks Widget (Replaces Placeholders) */}
            <InProgressTasksWidget milestones={milestones} />

        </div>
    );
};

export default TeamSidebar;