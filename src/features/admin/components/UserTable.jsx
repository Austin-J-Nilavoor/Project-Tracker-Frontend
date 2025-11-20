import React, { useState, useMemo } from 'react';
import { Trash2, Edit, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import UserAvatar from '../../../components/UserAvatar';

const UserRow = ({ user, onDelete, onEdit }) => (
    <div className="user-row grid-cols-user-table">
        <div className="user-name-cell">
            <UserAvatar name={user.name} id={user.id} />
            <span>{user.name}</span>
        </div>
        <div className="user-cell user-email">{user.email}</div>
        <div className="user-cell user-role">{user.role}</div>
        <div className="user-cell user-ibu">{user.ibuName || 'N/A'}</div>
        <div className="user-actions-cell">
            <button 
                onClick={() => onEdit(user)} // Call parent handler
                title="Edit" 
                className="action-button action-edit"
            >
                <Edit size={18} />
            </button>
            <button 
                onClick={() => onDelete(user.id)} 
                title="Delete" 
                className="action-button action-delete"
            >
                <Trash2 size={18} />
            </button>
        </div>
    </div>
);

const UserTable = ({ users, loading, error, onDelete, onEdit }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

    const sortedUsers = useMemo(() => {
        if (!users) return [];
        let sortableUsers = [...users];
        if (sortConfig !== null) {
            sortableUsers.sort((a, b) => {
                let aValue = a[sortConfig.key] || '';
                let bValue = b[sortConfig.key] || '';
                if (typeof aValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                }
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableUsers;
    }, [users, sortConfig]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (columnName) => {
        if (sortConfig.key !== columnName) return <ArrowUpDown size={14} style={{ opacity: 0.3, marginLeft: '4px' }} />;
        if (sortConfig.direction === 'asc') return <ArrowUp size={14} style={{ color: '#2563eb', marginLeft: '4px' }} />;
        return <ArrowDown size={14} style={{ color: '#2563eb', marginLeft: '4px' }} />;
    };

    const HeaderCell = ({ label, sortKey, alignRight = false }) => (
        <div 
            onClick={() => requestSort(sortKey)} 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', userSelect: 'none', justifyContent: alignRight ? 'flex-end' : 'flex-start' }}
            className="hover:text-blue-600 transition-colors"
        >
            {label} {getSortIcon(sortKey)}
        </div>
    );

    return (
        <div className="user-table-card">
            <div className="table-header grid-cols-user-table">
                <HeaderCell label="NAME" sortKey="name" />
                <HeaderCell label="EMAIL" sortKey="email" />
                <HeaderCell label="ROLE" sortKey="role" />
                <HeaderCell label="IBU" sortKey="ibuName" />
                <span className="text-right">ACTIONS</span>
            </div>

            <div className="table-body">
                {loading ? (
                    <div className="status-message">Loading users...</div>
                ) : error ? (
                    <div className="error-box">{error}</div>
                ) : sortedUsers.length === 0 ? (
                    <div className="status-message">No users found matching your criteria.</div>
                ) : (
                    sortedUsers.map(user => (
                        <UserRow 
                            key={user.id} 
                            user={user} 
                            onDelete={onDelete} 
                            onEdit={onEdit} // Pass it down
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default UserTable;