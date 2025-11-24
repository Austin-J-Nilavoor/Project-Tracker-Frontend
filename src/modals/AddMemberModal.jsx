import React, { useState } from 'react';
import projectMemberService from '../services/membersServices';
import Modal from '../components/Modal';

const AddMemberModal = ({ projectId, allUsers, onClose, onSuccess }) => {
    const [userId, setUserId] = useState("");
    const [role, setRole] = useState("DEVELOPER");
    const [error, setError] = useState(null); // 1. Add Error State

    const handleSubmit = async () => {
        setError(null); // Reset error on new attempt

        // 2. Basic Validation
        if (!userId) {
            setError("Please select a user.");
            return;
        }

        try {
            await projectMemberService.addMember({ projectId, userId, role });
            onSuccess();
            onClose();
        } catch (err) {
            // 3. Set API Error message
            console.error(err);
            setError(err.response?.data?.message || "Failed to add member");
        }
    };

    const handleUserChange = (e) => {
        setUserId(e.target.value);
        if (error) setError(null); // Clear error when user interacts
    };

    return (
        <Modal onClose={onClose}>
            <h3>Add Member</h3>

            {/* 4. Error Message UI */}
            {error && (
                <div className="error-message" style={{
                    padding: '10px',
                    backgroundColor: '#fee2e2',
                    color: '#ef4444',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    marginBottom: '1rem'
                }}>
                    {error}
                </div>
            )}

            <label>User</label>
            <select
                value={userId}
                onChange={handleUserChange}
                className="modal-input" // Added for consistent styling
            >
                <option value="">Select User</option>
                {allUsers.map(u => (
                    <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                    </option>
                ))}
            </select>

            <label>Role</label>
            <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="modal-input" // Added for consistent styling
            >
                <option value="PROJECT_MANAGER">Project Manager</option>
                <option value="DEVELOPER">Developer</option>
                <option value="TESTER">Tester</option>
                <option value="DESIGNER">Designer</option>
                <option value="ANALYST">Analyst</option>
            </select>

            <div className="modal-actions">
                <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSubmit}>Add</button>
            </div>
        </Modal>
    );
};

export default AddMemberModal;