import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Plus } from 'lucide-react';
import '../styles/AdminDashboard.css';

// Logic
import { useAdminDashboard } from '../features/admin/hooks/useAdminDashboard';

// Components
import CommonHeader from '../components/Header';
import UserFilters from '../features/admin/components/UserFilters';
import UserTable from '../features/admin/components/UserTable';
import CreateUserModal from '../features/admin/modals/CreateUserModal';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [showAddModal, setShowAddModal] = useState(false);

    // Use Custom Hook
    const { 
        users, ibus, loading, error, filters, 
        updateFilter, deleteUser, refreshData 
    } = useAdminDashboard();

    if (user.role !== 'ADMIN') {
        return <div className="access-denied-message">Access Denied. Admins only.</div>;
    }

    return (
        <div className="dashboard-wrapper">
            <CommonHeader showSearch={false} />
            
            <main className="main-content-admin">
                {/* Header Section */}
                <h1 className="greeting-title">Welcome, Admin!</h1>
                <div className="admin-sub-actions">
                    <p className="greeting-subtitle">
                        Manage users and oversee project assignments efficiently.
                    </p>
                    <div className="action-bar">
                        <button onClick={() => console.log("Create IBU")} className="btn btn-secondary">
                            <Plus size={18} /> <span>Create IBU</span>
                        </button>
                        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
                            <User size={18} /> <span>Create User</span>
                        </button>
                    </div>
                </div>

                {/* Filters Section */}
                <UserFilters 
                    filters={filters} 
                    updateFilter={updateFilter} 
                    ibuOptions={ibus} 
                />

                {/* Table Section */}
                <UserTable 
                    users={users} 
                    loading={loading} 
                    error={error} 
                    onDelete={deleteUser} 
                />
            </main>

            {/* Modal Section */}
            {showAddModal && (
                <CreateUserModal 
                    onClose={() => setShowAddModal(false)} 
                    onSuccess={refreshData} 
                    ibuOptions={ibus}
                />
            )}
        </div>
    );
};

export default AdminDashboard;