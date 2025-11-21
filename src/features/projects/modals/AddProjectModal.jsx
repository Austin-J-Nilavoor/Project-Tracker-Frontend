import React, { useState, useEffect } from 'react';
import projectService from '../../../services/projectServices';
import Modal from '../../../components/Modal';
import { useNavigate } from 'react-router-dom';

const AddProjectModal = ({ onClose, onSuccess, projectToEdit = null }) => {
    // Local state for form inputs
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        status: "PENDING",
        priority: "MEDIUM",
        startDate: "",
        endDate: ""
    });
const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Determine mode based on prop
    const isEditMode = !!projectToEdit;

    // Pre-fill form if in Edit Mode
    useEffect(() => {
        if (projectToEdit) {
            setFormData({
                name: projectToEdit.name || "",
                description: projectToEdit.description || "",
                status: projectToEdit.status || "PENDING",
                priority: projectToEdit.priority || "MEDIUM",
                startDate: projectToEdit.startDate ? projectToEdit.startDate.substring(0, 10) : "",
                endDate: projectToEdit.endDate ? projectToEdit.endDate.substring(0, 10) : ""
            });
        }
    }, [projectToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError(null);
    };

    // --- NEW: DELETE HANDLER ---
    const handleDelete = async () => {
        // 1. Confirmation check
        if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
            return;
        }

        setIsSubmitting(true);
        try {
            // 2. Call service
            await projectService.deleteProject(projectToEdit.id);
            
            // 3. Handle success
            if (onSuccess) onSuccess();
            onClose();
            navigate('/projects');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to delete project");
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async () => {
        setError(null);

        if (!formData.name || !formData.startDate || !formData.endDate) {
            setError("Please fill in the required fields (Name, Start Date, End Date)");
            return;
        }

        setIsSubmitting(true);
        try {
            if (isEditMode) {
                await projectService.updateProject(projectToEdit.id, formData);
            } else {
                await projectService.createProject(formData);
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} project`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal onClose={onClose}>

            <h2 className="modal-title">
                {isEditMode ? "Edit Project" : "Create New Project"}
            </h2>

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

            <input
                type="text"
                name="name"
                placeholder="Project Name"
                className="modal-input"
                value={formData.name}
                onChange={handleChange}
            />

            <textarea
                name="description"
                placeholder="Description"
                className="modal-textarea"
                value={formData.description}
                onChange={handleChange}
            />

            <div className="modal-row" style={{ display: 'flex', gap: '10px' }}>
                <select
                    name="status"
                    className="modal-input"
                    value={formData.status}
                    onChange={handleChange}
                >
                    <option value="PENDING">PENDING</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                </select>

                <select
                    name="priority"
                    className="modal-input"
                    value={formData.priority}
                    onChange={handleChange}
                >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                </select>
            </div>

            <label>Start Date</label>
            <input
                type="date"
                name="startDate"
                className="modal-input"
                value={formData.startDate}
                onChange={handleChange}
            />

            <label>End Date</label>
            <input
                type="date"
                name="endDate"
                className="modal-input"
                value={formData.endDate}
                onChange={handleChange}
            />

            {/* --- UPDATED ACTIONS FOOTER --- */}
            <div className="modal-actions" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', // Pushes Delete to left, Actions to right
                alignItems: 'center',
                marginTop: '20px'
            }}>
                
                {/* LEFT: Delete Button (Only in Edit Mode) */}
                <div>
                    {isEditMode && (
                        <button
                            className="btn-delete"
                            onClick={handleDelete}
                            disabled={isSubmitting}
                            style={{
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                fontWeight: '500'
                            }}
                        >
                            Delete Project
                        </button>
                    )}
                </div>

                {/* RIGHT: Standard Actions */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        className="btn-cancel"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Saving..." : (isEditMode ? "Save Changes" : "Create")}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AddProjectModal;