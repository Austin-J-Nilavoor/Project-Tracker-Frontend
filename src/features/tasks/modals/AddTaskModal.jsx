import React, { useState, useEffect } from "react";
import { Trash2 } from 'lucide-react';
import taskService from "../../../services/taskServices.js";
import projectMemberService from "../../../services/membersServices.js";
import milestoneService from "../../../services/milestoneServices.js";
import Modal from "../../../components/Modal.jsx";
// import "./AddTaskModal.css"; // ← NEW CSS FILE

const AddTaskModal = ({ projectId, milestoneID, isOpen, onClose, onSuccess, taskToEdit = null }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("MEDIUM");
    const [status, setStatus] = useState("PENDING");
    const [dueDate, setDueDate] = useState("");
    const [assignedToId, setAssignedToId] = useState("");
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [maxDate, setMaxDate] = useState("");

    const today = new Date().toLocaleDateString("en-CA");
    const isEditMode = !!taskToEdit;

    useEffect(() => {
        if (!isOpen) return;

        setError(null);

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
                setError("Failed to load project data.");
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

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
            return;
        }

        setLoading(true);
        try {
            await taskService.deleteTask(taskToEdit.id);
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete task.");
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setError(null);

        if (!title.trim()) {
            setError("Task title is required.");
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
            setError(err.response?.data?.message || "Failed to save task.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal onClose={onClose}>
            <h3>{isEditMode ? "Edit Task" : "Add New Task"}</h3>

            {error && <div className="atm-error-message">{error}</div>}

            <label>Title</label>
            <input
                value={title}
                onChange={(e) => {
                    setTitle(e.target.value);
                    if (error) setError(null);
                }}
                placeholder="Enter task title"
            />

            <label>Description</label>
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the task..."
            />

            <div className="modal-row">
                <div className="modal-col">
                    <label>Priority</label>
                    <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                    </select>
                </div>

                {isEditMode && (
                    <div className="modal-col">
                        <label>Status</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="PENDING">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>
                )}
            </div>

            <label>
                Due Date{" "}
                {maxDate && (
                    <span className="atm-date-range">(Range: {today} to {maxDate})</span>
                )}
            </label>

            <input
                type="date"
                value={dueDate}
                min={today}
                max={maxDate}
                onChange={(e) => setDueDate(e.target.value)}
            />

            <label>Assign To</label>
            <select value={assignedToId} onChange={(e) => setAssignedToId(e.target.value)}>
                <option value="">Select user</option>
                {users.map((u) => (
                    <option key={u.userId} value={u.userId}>
                        {u.userName}
                    </option>
                ))}
            </select>

            <div className={`atm-modal-actions ${isEditMode ? "atm-space-between" : ""}`}>
                {isEditMode && (
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="atm-delete-btn"
                        title="Delete Task"
                    >
                        <Trash2 size={16} /> Delete
                    </button>
                )}

                <div className="atm-right-buttons">
                    <button className="btn-secondary" onClick={onClose} disabled={loading}>
                        Cancel
                    </button>
                    <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? "Saving..." : isEditMode ? "Save Changes" : "Create Task"}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AddTaskModal;
