import React, { useState, useEffect } from "react";
import { Trash2 } from 'lucide-react';
import taskService from "../services/taskServices.js";
import projectMemberService from "../services/membersServices.js";
import milestoneService from "../services/milestoneServices.js";
import Modal from "../components/Modal.jsx";

const AddTaskModal = ({ projectId, milestoneID, isOpen, onClose, onSuccess, taskToEdit = null, isReadOnly = false }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("MEDIUM");
    const [status, setStatus] = useState("PENDING");
    const [dueDate, setDueDate] = useState("");
    const [assignedToId, setAssignedToId] = useState("");
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [fieldErrors, setFieldErrors] = useState({});
    const [maxDate, setMaxDate] = useState("");

    const today = new Date().toLocaleDateString("en-CA");
    const isEditMode = !!taskToEdit;

    useEffect(() => {
        if (!isOpen) return;

        setFieldErrors({});

        const loadData = async () => {
            try {
                const userData = await projectMemberService.getMembersByProject(projectId);
                setUsers(userData);

                if (milestoneID) {
                    const milestoneData = await milestoneService.getMilestoneById(milestoneID);
                    if (milestoneData?.endDate) {
                        setMaxDate(milestoneData.endDate.substring(0, 10));
                    }
                }
            } catch (err) {
                setFieldErrors(prev => ({ ...prev, general: "Failed to load project data." }));
            }
        };

        loadData();

        if (isEditMode) {
            setTitle(taskToEdit.title || "");
            setDescription(taskToEdit.description || "");
            setPriority(taskToEdit.priority || "MEDIUM");
            setStatus(taskToEdit.status || "PENDING");
            setDueDate(taskToEdit.dueDate ? taskToEdit.dueDate.substring(0, 10) : "");
            setAssignedToId(taskToEdit.assignedToId || "");
        } else {
            setTitle("");
            setDescription("");
            setPriority("MEDIUM");
            setStatus("PENDING");
            setDueDate("");
            setAssignedToId("");
        }
    }, [isOpen, projectId, milestoneID, taskToEdit, isEditMode]);

    const validateFields = () => {
        const errors = {};
        if (!title.trim()) errors.title = "Required";
        if (!dueDate) errors.dueDate = "Required";
        if (!assignedToId) errors.assignedToId = "Required";
        return errors;
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;

        setLoading(true);
        try {
            await taskService.deleteTask(taskToEdit.id);
            onSuccess();
            onClose();
        } catch (err) {
            setFieldErrors({ general: err.response?.data?.message || "Failed to delete task." });
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (isReadOnly) return;

        const errors = validateFields();
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setLoading(true);

        try {
            const taskData = {
                title,
                description,
                priority,
                status,
                dueDate,
                projectId,
                assignedToId,
                milestoneID,
            };

            isEditMode
                ? await taskService.updateTask(taskToEdit.id, taskData)
                : await taskService.createTask(taskData);

            onSuccess();
            onClose();
        } catch (err) {
            setFieldErrors({ general: err.response?.data?.message || "Failed to save task." });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    let modalTitle = isReadOnly ? "View Task Details" : isEditMode ? "Edit Task" : "Add New Task";

    return (
        <Modal onClose={onClose} className="modal-box-task">
            <h3>{modalTitle}</h3>

            {fieldErrors.general && (
                <div className="atm-error-message">{fieldErrors.general}</div>
            )}

            <div className="modal-row">
                <div className="modal-col">
                    <div className="label-row">
                        <label className="required-label">Title {fieldErrors.title && <span className="atm-inline-error">{fieldErrors.title}</span>}</label>

                    </div>
                    <input
                        value={title}
                        disabled={isReadOnly}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            setFieldErrors(prev => ({ ...prev, title: null }));
                        }}
                        placeholder="Enter task title"
                    />

                    <div className="modal-row">
                        <div className="modal-col">
                            <label className="required-label">Priority </label>
                            <select
                                value={priority}
                                disabled={isReadOnly}
                                onChange={(e) => setPriority(e.target.value)}
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>

                        {isEditMode && (
                            <div className="modal-col">
                                <label className="required-label">Status </label>
                                <select
                                    value={status}
                                    disabled={isReadOnly}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    <option value="PENDING">To Do</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="COMPLETED">Completed</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="label-row">
                        <label className="required-label">Due Date {fieldErrors.dueDate && <span className="atm-inline-error">{fieldErrors.dueDate}</span>}</label>

                    </div>

                    <input
                        type="date"
                        value={dueDate}
                        min={today}
                        max={maxDate}
                        disabled={isReadOnly}
                        onChange={(e) => {
                            setDueDate(e.target.value);
                            setFieldErrors(prev => ({ ...prev, dueDate: null }));
                        }}
                    />
                </div>

                <div className="modal-col">
                    <label >Description</label>
                    <textarea
                        value={description}
                        disabled={isReadOnly}
                        className="modal-textarea modal-textarea-task"
                        placeholder="Describe the task..."
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <div className="label-row">
                        <label className="required-label">Assign To {fieldErrors.assignedToId && <span className="atm-inline-error">{fieldErrors.assignedToId}</span>}</label>
                    </div>

                    <select
                        value={assignedToId}
                        disabled={isReadOnly}
                        onChange={(e) => {
                            setAssignedToId(e.target.value);
                            setFieldErrors(prev => ({ ...prev, assignedToId: null }));
                        }}
                    >
                        <option value="">Select user</option>
                        {users.map((u) => (
                            <option key={u.userId} value={u.userId}>
                                {u.userName} ({u.role.toLowerCase()})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div
                className={`atm-modal-actions ${isEditMode && !isReadOnly ? "atm-space-between" : "atm-right-aligned"
                    }`}
            >
                {isEditMode && !isReadOnly && (
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="atm-delete-btn"
                    >
                        <Trash2 size={16} /> Delete
                    </button>
                )}

                <div className="atm-right-buttons">
                    <button className="btn-secondary" onClick={onClose}>
                        {isReadOnly ? "Close" : "Cancel"}
                    </button>

                    {!isReadOnly && (
                        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                            {loading ? "Saving..." : isEditMode ? "Save Changes" : "Create Task"}
                        </button>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default AddTaskModal;
