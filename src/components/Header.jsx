import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Briefcase, Plus, LogOut, Search, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/Header.css';

const Header = ({ title, btnIcon = <Plus size={18} />, onClick, showSearch = false }) => {
    const { user, logout } = useAuth();
    const [showMenu, setShowMenu] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        setTimeout(() => logout(), 100);
    };

    return (
        <header className="dashboard-header">

            {/* LEFT SIDE: Logo and Title */}
            <div 
                className="logo-section"
                onClick={() => navigate('/')}
                style={{ cursor: "pointer" }}
                title="Go to Dashboard"
            >
                <Briefcase className="logo-icon" />
                <span className="logo-text">Project Tracker</span>
            </div>

            {/* CENTER: Search Bar */}
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

            {/* RIGHT SIDE */}
            <div className="header-actions">
                {title && onClick && (
                    <button 
                        onClick={onClick}
                        className="btn btn-primary"
                    >
                        {btnIcon}
                        <span>{title}</span>
                    </button>
                )}

                {/* Profile */}
                <div className="profile-dropdown">
                    <button 
                        className="user-avatar-button" 
                        onClick={() => setShowMenu(!showMenu)}
                        title={user ? user.name : 'Guest'}
                    >
                        {user ? user.name.charAt(0).toUpperCase() : 'G'}
                    </button>

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
