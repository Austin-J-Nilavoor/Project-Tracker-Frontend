import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Briefcase, Plus, LogOut, Search, Settings } from 'lucide-react';

/**
 * CommonHeader component provides consistent navigation, logo, and profile actions.
 * @param {Object} props
 * @param {string} props.title - The text for the main button (e.g., "Add New Project").
 * @param {Function} props.onClick - Handler for the main button click.
 * @param {boolean} [props.showSearch=false] - If true, displays a search bar (for pages like TaskBoard/Dashboard).
 */
const Header = ({ title,btnIcon = <Plus size={18} />, onClick, showSearch = false }) => {
    const { user, logout } = useAuth();
    const [showMenu, setShowMenu] = useState(false);

    const handleLogout = () => {
        // Simple delay for UX before clearing state
        setTimeout(() => logout(), 100); 
    };

    return (
        <header className="dashboard-header">
            {/* LEFT SIDE: Logo and Title */}
            <div className="logo-section">
                <Briefcase className="logo-icon" />
                <span className="logo-text">Project Tracker</span>
            </div>

            {/* CENTER: Search Bar (Conditional) */}
            {showSearch && (
                <div className="search-container header-search-bar">
                    <Search className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search projects or tasks..."
                        className="search-input"
                    />
                </div>
            )}

            {/* RIGHT SIDE: Action Button & Profile */}
            <div className="header-actions">
                
                {/* Dynamic Action Button (if title and onClick are provided) */}
                {title && onClick && (
                    <button 
                        onClick={onClick}
                        className="btn btn-primary"
                    >
                        {btnIcon}
                        <span>{title}</span>
                    </button>
                )}

                {/* Profile/Settings Icon (Non-functional placeholders) */}
                {/* <Settings className="action-icon" /> */}

                {/* User Profile Avatar with Clickable Menu */}
                <div className="profile-dropdown">
                    <button 
                        className="user-avatar-button" 
                        onClick={() => setShowMenu(!showMenu)}
                        title={user ? user.name : 'Guest'}
                    >
                        {user ? user.name.charAt(0).toUpperCase() : 'G'}
                    </button>

                    {/* Dropdown Menu */}
                    {showMenu && (
                        <div className="dropdown-menu">
                            <div className="user-info">
                                <p className="user-info-name">{user ? user.name : 'Guest'}</p>
                                <p className="user-info-role">({user ? user.role : 'Guest'})</p>
                            </div>
                            <button onClick={handleLogout} className="menu-item logout-item">
                                <LogOut size={16} />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;