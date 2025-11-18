import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userServices';
import { Search, User, Briefcase, Trash2, Edit, HelpCircle, ChevronDown, Plus } from 'lucide-react';

// --- Static Lookups for Filters ---
const STATIC_IBUS = ['All', 'Corporate', 'Innovations', 'Product Dev', 'Marketing', 'Sales'];
const STATIC_ROLES = ['All', 'ADMIN', 'MANAGER', 'EMPLOYEE'];

const AdminDashboard = () => {
    // --- State and Hooks ---
    const { user, logout } = useAuth();
    const [allUsers, setAllUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filtering State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('All');
    const [selectedIbu, setSelectedIbu] = useState('All');

    // --- Core API Fetch Function ---
    const fetchAllUsersData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const fetchedUsers = await userService.getAllUsers();

            setAllUsers(fetchedUsers.map(u => ({
                ...u,
                avatarColor: ['blue', 'orange', 'yellow', 'green', 'red'][u.id.charCodeAt(0) % 5]
            })));

        } catch (err) {
            const errorMessage = err.response?.data?.message || "Failed to fetch user list. Check backend API status.";
            setError(errorMessage);
            setAllUsers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // 1. Filtering Logic 
    useEffect(() => {
        let filtered = allUsers;

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(u =>
                u.name.toLowerCase().includes(lowerSearch) ||
                u.email.toLowerCase().includes(lowerSearch)
            );
        }

        if (selectedRole !== 'All') {
            filtered = filtered.filter(u => u.role === selectedRole);
        }

        if (selectedIbu !== 'All') {
            filtered = filtered.filter(u => u.ibuName === selectedIbu);
        }

        setUsers(filtered);
    }, [allUsers, searchTerm, selectedRole, selectedIbu]);

    // 2. Initial load hook
    useEffect(() => {
        fetchAllUsersData();
    }, [fetchAllUsersData]);

    const handleDelete = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            return;
        }

        try {
            await userService.deleteUser(userId);
            await fetchAllUsersData();
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Error deleting user.";
            alert(`Deletion failed: ${errorMessage}`);
        }
    };

    // --- UI/Helper Sub-Components ---

    const UserAvatar = ({ name, color }) => {
        const initial = name.charAt(0).toUpperCase();
        const colorMap = {
            blue: 'bg-avatar-blue',
            orange: 'bg-avatar-orange',
            yellow: 'bg-avatar-yellow',
            green: 'bg-avatar-green',
            red: 'bg-avatar-red',
        };
        return (
            <div className={`user-avatar ${colorMap[color] || 'bg-avatar-default'}`}>
                {initial}
            </div>
        );
    };

    const UserRow = ({ user }) => (
        <div className="user-row grid-cols-user-table">
            {/* NAME */}
            <div className="user-name-cell">
                <UserAvatar name={user.name} color={user.avatarColor} />
                <span>{user.name}</span>
            </div>

            {/* EMAIL */}
            <div className="user-cell user-email">{user.email}</div>

            {/* ROLE */}
            <div className="user-cell user-role">{user.role}</div>

            {/* IBU */}
            <div className="user-cell user-ibu">{user.ibuName || 'N/A'}</div>

            {/* ACTIONS */}
            <div className="user-actions-cell">
                <button
                    onClick={() => console.log(`Editing user: ${user.id}`)}
                    title="Edit User"
                    className="action-button action-edit"
                >
                    <Edit size={18} />
                </button>
                <button
                    onClick={() => handleDelete(user.id)}
                    title="Delete User"
                    className="action-button action-delete"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );

    const Dropdown = ({ title, options, selected, onSelect }) => (
        <div className="dropdown-container">
            <select
                value={selected}
                onChange={(e) => onSelect(e.target.value)}
                className="dropdown-select"
            >
                <option value="All">{title}: All</option>
                {options.filter(o => o !== 'All').map(option => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );

    // --- Main Render ---

    if (user.role !== 'ADMIN') {
        return (
            <div className="access-denied-message">
                Access Denied (403 Forbidden). Only Administrators can access this page.
            </div>
        );
    }

    return (
        <div className="dashboard-wrapper">
            {/* --- Header/Navbar ---
            <header className="dashboard-header">
                <div className="logo-section">
                    <Briefcase className="logo-icon" />
                    <span className="logo-text">Project Tracker</span>
                </div>
                <div className="header-actions">
                    <HelpCircle className="action-icon" />
                    <button onClick={logout} className="user-avatar-button">
                         {user.name.charAt(0)}
                    </button>
                </div>
            </header> */}

            {/* --- Main Content Area --- */}
            <main className="main-content">
                {/* Greeting & Subtitle */}
                <h1 className="greeting-title">Welcome, Admin!</h1>

                <div className="admin-sub-actions">

                    <p className="greeting-subtitle">
                        Manage users and oversee project assignments across the organization efficiently.
                    </p>
                    <div className="action-bar">
                        <button
                            onClick={() => console.log("Create IBU")}
                            className="btn btn-secondary"
                        >
                            <Plus size={18} />
                            <span>Create IBU</span>
                        </button>
                        <button
                            onClick={() => console.log("Create User")}
                            className="btn btn-primary"
                        >
                            <User size={18} />
                            <span>Create User</span>
                        </button>
                    </div></div>
                {/* --- Action Buttons --- */}


                {/* --- Filter and Search Bar --- */}
                <div className="filter-bar-container">

                    {/* Search Input */}
                    <div className="search-container">
                        <Search className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    {/* Filters */}
                    <div className="filter-dropdowns">
                        <Dropdown title="Role" options={STATIC_ROLES} selected={selectedRole} onSelect={setSelectedRole} />
                        <Dropdown title="IBU" options={STATIC_IBUS} selected={selectedIbu} onSelect={setSelectedIbu} />
                    </div>
                </div>

                {/* --- User Table --- */}
                <div className="user-table-card">

                    {/* Table Header */}
                    {/* NOTE: The grid layout class 'grid-cols-user-table' must be defined in the external CSS. */}
                    <div className="table-header grid-cols-user-table">
                        <span>NAME</span>
                        <span>EMAIL</span>
                        <span>ROLE</span>
                        <span>IBU</span>
                        <span className="text-right">ACTIONS</span>
                    </div>

                    {/* Table Body */}
                    <div className="table-body">
                        {loading ? (
                            <div className="status-message">Loading users...</div>
                        ) : error ? (
                            <div className="error-box">{error}</div>
                        ) : users.length === 0 ? (
                            <div className="status-message">No users found matching your criteria.</div>
                        ) : (
                            users.map(user => <UserRow key={user.id} user={user} />)
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
};

export default AdminDashboard;