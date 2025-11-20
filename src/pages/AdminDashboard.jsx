import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Plus } from 'lucide-react';
import '../styles/AdminDashboard.css';
import { useAdminDashboard } from '../features/admin/hooks/useAdminDashboard';
import CommonHeader from '../components/Header';
import UserFilters from '../features/admin/components/UserFilters';
import UserTable from '../features/admin/components/UserTable';
import CreateUserModal from '../features/admin/modals/CreateUserModal';
import CreateIbuModal from '../features/admin/modals/CreateIbuModal'; // Import
import ConfirmationModal from '../components/ConfirmationModal';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showIbuModal, setShowIbuModal] = useState(false); // New State
    const [userToEdit, setUserToEdit] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, userId: null });

    const { 
        users, ibus, loading, error, filters, 
        updateFilter, deleteUser, refreshData 
    } = useAdminDashboard();

    if (user.role !== 'ADMIN') {
        return <div className="access-denied-message">Access Denied. Admins only.</div>;
    }

    // Handlers
    const handleEditClick = (userData) => {
        setUserToEdit(userData);
        setShowAddModal(true);
    };

    const handleCreateClick = () => {
        setUserToEdit(null);
        setShowAddModal(true);
    };

    const handleDeleteClick = (userId) => {
        setDeleteConfirm({ show: true, userId });
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirm.userId) return;
        try {
            await deleteUser(deleteConfirm.userId);
            setDeleteConfirm({ show: false, userId: null });
        } catch (err) {
            console.error(err);
            setDeleteConfirm({ show: false, userId: null });
        }
    };

    return (
        <div className="dashboard-wrapper">
            <CommonHeader showSearch={false} />
            
            <main className="main-content-admin">
                <h1 className="greeting-title">Welcome, Admin!</h1>
                <div className="admin-sub-actions">
                    <p className="greeting-subtitle">
                        Manage users and oversee project assignments efficiently.
                    </p>
                    <div className="action-bar">
                        {/* Wired up the IBU Button */}
                        <button onClick={() => setShowIbuModal(true)} className="btn btn-primary">
                            <Plus size={18} /> <span>Create IBU</span>
                        </button>
                        <button onClick={handleCreateClick} className="btn btn-primary">
                            <User size={18} /> <span>Create User</span>
                        </button>
                    </div>
                </div>

                <UserFilters 
                    filters={filters} 
                    updateFilter={updateFilter} 
                    ibuOptions={ibus} 
                />

                <UserTable 
                    users={users} 
                    loading={loading} 
                    error={error} 
                    onDelete={handleDeleteClick} 
                    onEdit={handleEditClick}
                />
            </main>

            {/* User Modal */}
            {showAddModal && (
                <CreateUserModal 
                    onClose={() => setShowAddModal(false)} 
                    onSuccess={refreshData} 
                    ibuOptions={ibus}
                    userToEdit={userToEdit}
                />
            )}

            {/* IBU Modal */}
            {showIbuModal && (
                <CreateIbuModal 
                    onClose={() => setShowIbuModal(false)} 
                    onSuccess={refreshData} 
                />
            )}

            <ConfirmationModal 
                isOpen={deleteConfirm.show}
                onClose={() => setDeleteConfirm({ show: false, userId: null })}
                title="Delete User?"
                message="Are you sure you want to delete this user? This action cannot be undone."
                confirmText="Delete"
                isDanger={true}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
};

export default AdminDashboard;