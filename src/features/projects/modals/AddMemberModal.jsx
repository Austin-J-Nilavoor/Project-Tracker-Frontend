import React, { useState } from 'react';
import projectMemberService from '../../../services/membersServices';
import Modal from '../../../components/Modal';

const AddMemberModal = ({ projectId, allUsers, onClose, onSuccess }) => {
    const [userId, setUserId] = useState("");
    const [role, setRole] = useState("DEVELOPER");

    const handleSubmit = async () => {
        if (!userId) return;
        try {
            await projectMemberService.addMember({ projectId, userId, role });
            onSuccess();
            onClose();
        } catch (err) {
            alert("Failed to add member");
        }
    };

    return (
       <Modal onClose={onClose}>
                <h3>Add Member</h3>
                <label>User</label>
                <select value={userId} onChange={e => setUserId(e.target.value)}>
                    <option value="">Select User</option>
                    {allUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                </select>
                <label>Role</label>
                <select value={role} onChange={e => setRole(e.target.value)}>
                    <option value="PROJECT_MANAGER">Project Manager</option>
                    <option value="DEVELOPER">Developer</option>
                </select>
                <div className="modal-actions">
                    <button className="btn btn-primary" onClick={handleSubmit}>Add</button>
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                </div>
           </Modal>
    );
};

export default AddMemberModal;