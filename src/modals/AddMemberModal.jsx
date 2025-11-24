import React, { useState } from 'react';
import projectMemberService from '../services/membersServices';
import Modal from '../components/Modal';

const AddMemberModal = ({ projectId, allUsers, onClose, onSuccess }) => {
    const [userId, setUserId] = useState("");
    const [role, setRole] = useState("DEVELOPER");
    const [error, setError] = useState(null); // Top error message
    const [fieldError, setFieldError] = useState({ user: "", role: "" }); // Inline errors

    const handleSubmit = async () => {
        setError(null);
        setFieldError({ user: "", role: "" });

        let hasError = false;
        let newErrors = { user: "", role: "" };

        if (!userId) {
            newErrors.user = "Required";
            hasError = true;
        }

        if (!role) {
            newErrors.role = "Required";
            hasError = true;
        }

        if (hasError) {
            setFieldError(newErrors);
            return;
        }

        try {
            await projectMemberService.addMember({ projectId, userId, role });
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to add member");
        }
    };

    const handleUserChange = (e) => {
        setUserId(e.target.value);
        if (error) setError(null);
    };

    return (
        <Modal onClose={onClose}>
            <h3>Add Member</h3>

            {/* Existing error UI unchanged */}
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

            {/* User Field */}
            <label className="required-label" >
                User
                {fieldError.user && (
                    <span className="field-error-inline" style={{ color: '#ef4444', fontSize: '12px' }}>
                        {fieldError.user}
                    </span>
                )}
            </label>
            <select
                value={userId}
                onChange={handleUserChange}
                className="modal-input"
            >
                <option value="">Select User</option>
                {allUsers.map(u => (
                    <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                    </option>
                ))}
            </select>

            {/* Role Field */}
            <label className="required-label">
                Role
                {fieldError.role && (
                    <span className="field-error-inline" style={{ color: '#ef4444', fontSize: '12px' }}>
                        {fieldError.role}
                    </span>
                )}
            </label>
            <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="modal-input"
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
