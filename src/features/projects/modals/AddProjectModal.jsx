import React, { useState, useEffect } from 'react';
import projectService from '../../../services/projectServices';
import Modal from '../../../components/Modal';

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

    const [isSubmitting, setIsSubmitting] = useState(false);

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
                // Ensure dates are in YYYY-MM-DD format for input[type="date"]
                startDate: projectToEdit.startDate ? projectToEdit.startDate.substring(0, 10) : "",
                endDate: projectToEdit.endDate ? projectToEdit.endDate.substring(0, 10) : ""
            });
        }
    }, [projectToEdit]);

    // Generic handler for input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        // Basic validation
        if (!formData.name || !formData.startDate || !formData.endDate) {
            alert("Please fill in the required fields (Name, Start Date, End Date)");
            return;
        }

        setIsSubmitting(true);
        try {
            if (isEditMode) {
                // Update existing project
                await projectService.updateProject(projectToEdit.id, formData);
                alert("Project updated successfully!");
            } else {
                // Create new project
                await projectService.createProject(formData);
                alert("Project created successfully!");
            }

            // Trigger parent refresh and close modal
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} project`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal onClose={onClose}>

            <h2 className="modal-title">
                {isEditMode ? "Edit Project" : "Create New Project"}
            </h2>

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

            <div className="modal-actions">
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
        </Modal>
    );
};

export default AddProjectModal;