import React, { useState, useEffect } from 'react';
import register from '../services/authServices';
import userService from '../services/userServices'; // Import user service
import Modal from '../components/Modal';

const CreateUserModal = ({ onClose, onSuccess, ibuOptions, userToEdit = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: 'securePass123',
        role: 'EMPLOYEE',
        ibuName: ''
    });
    const [error, setError] = useState(null);

    const isEditMode = !!userToEdit;

    // Pre-fill form if editing
    useEffect(() => {
        if (userToEdit) {
            setFormData({
                name: userToEdit.name || '',
                email: userToEdit.email || '',
                password: '', // Keep blank for security
                role: userToEdit.role || 'EMPLOYEE',
                ibuName: userToEdit.ibuName || ''
            });
        }
    }, [userToEdit]);

    const handleSubmit = async () => {
        setError(null);
        
        // Basic Validation
        if (!formData.name || !formData.email) {
            setError("Name and Email are required.");
            return;
        }
        // Password required only for new users
        if (!isEditMode && !formData.password) {
            setError("Password is required for new users.");
            return;
        }

        try {
            if (isEditMode) {
                // Filter out empty password so we don't overwrite it with blank
                const updatePayload = { ...formData };
                if (!updatePayload.password) delete updatePayload.password;

                await userService.updateUser(userToEdit.id, updatePayload);
            } else {
                await register.register(formData);
            }
            
            onSuccess(); // Refresh parent list
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} user.`);
        }
    };

    return (
        <Modal onClose={onClose}>
            <h2>{isEditMode ? "Edit User" : "Create User"}</h2>
            
            {error && (
                <div className="error-message" style={{ 
                    padding: '10px', 
                    backgroundColor: '#fee2e2', 
                    color: '#ef4444', 
                    borderRadius: '6px', 
                    fontSize: '0.875rem', 
                    marginBottom: '1rem' 
                }}>
                    {error}
                </div>
            )}

            <input
                type="text"
                placeholder="Name"
                className="modal-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
                type="email"
                placeholder="Email"
                className="modal-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <input
                type="password"
                placeholder={isEditMode ? "Password (leave blank to keep current)" : "Password"}
                className="modal-input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            <label>Role</label>
            <select
                className="modal-input"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
                <option value="ADMIN">ADMIN</option>
                <option value="MANAGER">MANAGER</option>
                <option value="EMPLOYEE">EMPLOYEE</option>
            </select>

            <label>IBU</label>
            <select
                className="modal-input"
                value={formData.ibuName}
                onChange={(e) => setFormData({ ...formData, ibuName: e.target.value })}
            >
                <option value="">Select IBU</option>
                {ibuOptions.filter(i => i !== "All").map(ibu => (
                    <option key={ibu} value={ibu}>{ibu}</option>
                ))}
            </select>

            <div className="modal-actions">
                <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSubmit}>
                    {isEditMode ? "Save Changes" : "Create"}
                </button>
            </div>
        </Modal>
    );
};

export default CreateUserModal;