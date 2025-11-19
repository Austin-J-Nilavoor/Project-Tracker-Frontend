import React, { useState, useEffect } from "react";
import taskService from "../../../services/taskServices.js";
import userService from "../../../services/userServices.js";
import milestoneService from "../../../services/milestoneServices.js";
import projectMemberService from "../../../services/membersServices.js";
import Modal from "../../../components/Modal.jsx";

const AddTaskModal = ({ projectId,milestoneID, isOpen, onClose, onTaskCreated }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("MEDIUM");
    const [status, setStatus] = useState("PENDING");
    const [dueDate, setDueDate] = useState("");
    const [assignedToId, setAssignedToId] = useState("");
    // const [milestoneID, setMilestoneID] = useState("");
    const [loading, setLoading] = useState(false);

    const [users, setUsers] = useState([]);
    // const [milestones, setMilestones] = useState([]);

    // Load users & milestones for dropdowns
    useEffect(() => {
        if (!isOpen) return;

        const loadData = async () => {
            try {
                const userData = await projectMemberService.getMembersByProject(projectId);
                // const milestoneData = await milestoneService.getMilestonesByProject(projectId);

                setUsers(userData);
              
                // setMilestones(milestoneData);
            } catch (err) {
                console.error("Failed to load dropdown data", err);
            }
        };

        loadData();
    }, [isOpen, projectId]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const newTask = {
                title,
                description,
                priority,
                status,
                dueDate,
                projectId,
                assignedToId,
                milestoneID,
            };

            await taskService.createTask(newTask);
            onTaskCreated();       // Refresh parent board
            onClose();             // Close modal
        } catch (err) {
            console.error("Failed to create task", err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
       <Modal onClose={onClose}>

                <h3>Add New Task</h3>

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

                <label>Priority</label>
                <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                </select>

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
                       console.log(u),
                        <option key={u.userId} value={u.userId}>
                            {u.userName}
                        </option>
                    ))}
                </select>

                {/* <label>Milestone</label>
                <select
                    value={milestoneID}
                    onChange={(e) => setMilestoneID(e.target.value)}
                >
                    <option value="">Select milestone</option>
                    {milestones.map(m => (
                         console.log(m),
                        <option key={m.id} value={m.id}>
                            {m.name}
                        </option>
                    ))}
                </select> */}

                <div className="modal-actions">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button
                        className="btn-primary"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Create Task"}
                    </button>
                </div>
       </Modal>
    );
};

export default AddTaskModal;
