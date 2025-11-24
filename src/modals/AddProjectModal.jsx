import React, { useState, useEffect } from 'react';
import projectService from '../services/projectServices';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';

// import './AddProjectModal.css'; // External styles if needed

const AddProjectModal = ({ onClose, onSuccess, projectToEdit = null }) => {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        status: "PENDING",
        priority: "MEDIUM",
        startDate: "",
        endDate: ""
    });

    const [touched, setTouched] = useState({
        name: false,
        startDate: false,
        endDate: false,
    });

    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const isEditMode = !!projectToEdit;

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

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
            return;
        }

        setIsSubmitting(true);
        try {
            await projectService.deleteProject(projectToEdit.id);
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

        setTouched({ name: true, startDate: true, endDate: true });

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
        <Modal onClose={onClose} className="modal-box-task">

            <h2 className="modal-title">
                {isEditMode ? "Edit Project" : "Create New Project"}
            </h2>

            {/* {error && (
                <div className="error-message-box">
                    {error}
                </div>
            )} */}

            <div className="modal-row">

                <div className="modal-col">
                    <label className="required-label">
                        Project Name
                        {touched.name && !formData.name && (
                            <span className="required-text">&nbsp;Required</span>
                        )}
                    </label>

                    <input
                        type="text"
                        name="name"
                        placeholder="Project Name"
                        className="modal-input"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                    />

                    <label className="required-label">Status</label>
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

                    <label className="required-label">Priority</label>
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

                <div className="modal-col">
                    <label>Description</label>
                    <textarea
                        name="description"
                        placeholder="Description"
                        className="modal-textarea modal-textarea-flex"
                        value={formData.description}
                        onChange={handleChange}
                    ></textarea>
                </div>

            </div>

            <div className="modal-row">
                <div className="modal-col">
                    <label className="required-label">
                        Start Date
                        {touched.startDate && !formData.startDate && (
                            <span className="required-text">&nbsp;Required</span>
                        )}
                    </label>

                    <input
                        type="date"
                        name="startDate"
                        className="modal-input"
                        value={formData.startDate}
                        onChange={handleChange}
                        onBlur={handleBlur}
                         min={new Date().toISOString().split("T")[0]}
                    />
                </div>

                <div className="modal-col">
                    <label className="required-label">
                        End Date
                        {touched.endDate && !formData.endDate && (
                            <span className="required-text">&nbsp;Required</span>
                        )}
                    </label>

                    <input
                        type="date"
                        name="endDate"
                        className="modal-input"
                        value={formData.endDate}
                        onChange={handleChange}
                        onBlur={handleBlur}
                    />
                </div>
            </div>

            <div className="modal-actions">
                <div>
                    {isEditMode && (
                        <button
                            className="btn-delete"
                            onClick={handleDelete}
                            disabled={isSubmitting}
                        >
                            Delete Project
                        </button>
                    )}
                </div>

                <div className="right-actions">
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
