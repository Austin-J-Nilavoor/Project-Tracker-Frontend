import React, { useState } from 'react';
import register from '../../../services/authServices';
import Modal from '../../../components/Modal';

const CreateUserModal = ({ onClose, onSuccess, ibuOptions }) => {
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        role: 'EMPLOYEE',
        ibuName: ''
    });

    const handleCreateUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.password) {
            alert("Please fill all fields.");
            return;
        }
        try {
            await register.register(newUser);
            onSuccess(); // Trigger parent refresh
            onClose();
        } catch {
            alert("Failed to create user.");
        }
    };

    return (
        <Modal onClose={onClose}>
                <h2>Create User</h2>
                
                <input
                    type="text"
                    placeholder="Name"
                    className="modal-input" // Added class for consistency
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
                <input
                    type="email"
                    placeholder="Email"
                    className="modal-input"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="modal-input"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />

                <label>Role</label>
                <select
                    className="modal-input"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                    <option value="ADMIN">ADMIN</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="EMPLOYEE">EMPLOYEE</option>
                </select>

                <label>IBU</label>
                <select
                    className="modal-input"
                    value={newUser.ibuName}
                    onChange={(e) => setNewUser({ ...newUser, ibuName: e.target.value })}
                >
                    <option value="">Select IBU</option>
                    {ibuOptions.filter(i => i !== "All").map(ibu => (
                        <option key={ibu} value={ibu}>{ibu}</option>
                    ))}
                </select>

                <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleCreateUser}>Create</button>
                </div>
           </Modal>
    );
};

export default CreateUserModal;