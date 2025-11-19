import React, { useState, useEffect } from "react";
import taskService from "../../../services/taskServices.js";
import projectMemberService from "../../../services/membersServices.js";
import Modal from "../../../components/Modal.jsx";

const AddTaskModal = ({ projectId, milestoneID, isOpen, onClose, onSuccess, taskToEdit = null }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("MEDIUM");
    const [status, setStatus] = useState("PENDING");
    const [dueDate, setDueDate] = useState("");
    const [assignedToId, setAssignedToId] = useState("");
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);

    const isEditMode = !!taskToEdit;

    // Load users & Reset/Pre-fill form
    useEffect(() => {
        if (!isOpen) return;

        // 1. Fetch Users
        const loadData = async () => {
            try {
                const userData = await projectMemberService.getMembersByProject(projectId);
                setUsers(userData);
            } catch (err) {
                console.error("Failed to load dropdown data", err);
            }
        };
        loadData();

        // 2. Handle Edit Mode vs Create Mode
        if (isEditMode) {
            setTitle(taskToEdit.title || "");
            setDescription(taskToEdit.description || "");
            setPriority(taskToEdit.priority || "MEDIUM");
            setStatus(taskToEdit.status || "PENDING");
            setDueDate(taskToEdit.dueDate ? taskToEdit.dueDate.substring(0, 10) : "");
            setAssignedToId(taskToEdit.assignedToId || "");
        } else {
            // Reset form for new task
            setTitle("");
            setDescription("");
            setPriority("MEDIUM");
            setStatus("PENDING");
            setDueDate("");
            setAssignedToId("");
        }

    }, [isOpen, projectId, taskToEdit, isEditMode]);

    const handleSubmit = async () => {
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

            if (isEditMode) {
                await taskService.updateTask(taskToEdit.id, taskData);
            } else {
                await taskService.createTask(taskData);
            }

            onSuccess();       // Refresh parent
            onClose();         // Close modal
        } catch (err) {
            console.error("Failed to save task", err);
            alert("Failed to save task.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
       <Modal onClose={onClose}>
            <h3>{isEditMode ? "Edit Task" : "Add New Task"}</h3>

            <label>Title</label>
            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
                
                {/* Only show status dropdown in Edit mode, typically new tasks start as Pending */}
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

            <label>Due Date</label>
            <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
            />

            <label>Assign To</label>
            <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
            >
                <option value="">Select user</option>
                {users.map(u => (
                    <option key={u.userId} value={u.userId}>
                        {u.userName}
                    </option>
                ))}
            </select>

            <div className="modal-actions">
                <button className="btn-secondary" onClick={onClose}>Cancel</button>
                <button
                    className="btn-primary"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? "Saving..." : (isEditMode ? "Save Changes" : "Create Task")}
                </button>
            </div>
       </Modal>
    );
};

export default AddTaskModal;