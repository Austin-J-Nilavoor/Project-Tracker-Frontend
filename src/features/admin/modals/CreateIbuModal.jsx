import React, { useState } from 'react';
import ibuService from '../../../services/ibuServices';
import Modal from '../../../components/Modal';

const CreateIbuModal = ({ onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError("IBU Name is required.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await ibuService.createIbu({ name });
            onSuccess(); // Refresh data
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to create IBU.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal onClose={onClose} className="modal-box-small">
            <h3>Create New IBU</h3>
            
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

            <label>IBU Name</label>
            <input 
                type="text" 
                className="modal-input" 
                placeholder="Enter IBU Name (e.g., Cloud Services)"
                value={name} 
                onChange={(e) => {
                    setName(e.target.value);
                    if(error) setError(null);
                }} 
            />

            <div className="modal-actions">
                <button 
                    className="btn-secondary" 
                    onClick={onClose} 
                    disabled={loading}
                >
                    Cancel
                </button>
                <button 
                    className="btn-primary" 
                    onClick={handleSubmit} 
                    disabled={loading}
                >
                    {loading ? "Creating..." : "Create"}
                </button>
            </div>
        </Modal>
    );
};

export default CreateIbuModal;