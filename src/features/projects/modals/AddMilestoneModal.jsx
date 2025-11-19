import React, { useState, useEffect } from 'react';
import milestoneService from '../../../services/milestoneServices';
import Modal from '../../../components/Modal';

const AddMilestoneModal = ({ projectId, milestones, project, onClose, onSuccess, milestoneToEdit = null }) => {

    const [form, setForm] = useState({
        name: "",
        description: "",
        status: "PENDING",
        startDate: "",
        endDate: "",
        dependsOnId: null
    });

    const [error, setError] = useState(null);
    const isEditMode = !!milestoneToEdit;

    // Pre-fill form if editing
    useEffect(() => {
        if (milestoneToEdit) {
            setForm({
                name: milestoneToEdit.name || "",
                description: milestoneToEdit.description || "",
                status: milestoneToEdit.status || "PENDING",
                startDate: milestoneToEdit.startDate ? milestoneToEdit.startDate.substring(0, 10) : "",
                endDate: milestoneToEdit.endDate ? milestoneToEdit.endDate.substring(0, 10) : "",
                dependsOnId: milestoneToEdit.dependsOnId || null
            });
        }
    }, [milestoneToEdit]);

    // Auto-fill start date with dependency endDate
    useEffect(() => {
        if (!isEditMode && form.dependsOnId) {
            const parent = milestones.find(m => m.id === form.dependsOnId);
            if (parent?.endDate) {
                setForm(prev => ({
                    ...prev,
                    startDate: parent.endDate.substring(0, 10) // force YYYY-MM-DD
                }));
            }
        }
    }, [form.dependsOnId, milestones, isEditMode]);

    // ---- Project Date Constraint Values ----
    const projectStart = project?.startDate?.substring(0, 10) || "";
    const projectEnd = project?.endDate?.substring(0, 10) || "";

    // ---- Submit Handler ----
    const handleSubmit = async () => {
        setError(null);

        // VALIDATION SECTION ----------------------
        if (form.startDate < projectStart) {
            return setError(`Start date cannot be before project start date: ${projectStart}`);
        }
        if (form.endDate > projectEnd) {
            return setError(`End date cannot be after project end date: ${projectEnd}`);
        }
        if (form.endDate < form.startDate) {
            return setError("End date cannot be earlier than start date.");
        }
        // ------------------------------------------

        try {
            if (isEditMode) {
                await milestoneService.updateMilestone(milestoneToEdit.id, { ...form, projectId });
            } else {
                await milestoneService.createMilestone({ ...form, projectId });
            }
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || `Failed to ${isEditMode ? "update" : "create"} milestone.`);
        }
    };

    return (
        <Modal onClose={onClose} className="modal-box-milestone">
            <h3>{isEditMode ? "Edit Milestone" : "Add Milestone"}</h3>
            {error && <div className="error-message"><strong>Error:</strong> {error}</div>}

            <div className="modal-row">
                <input
                    type="text"
                    placeholder="Milestone Name"
                    className="modal-input"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                />

                <input
                    type="text"
                    placeholder="Description"
                    className="modal-input"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                />
            </div>

            <div className="modal-row">
                <div className="modal-col">
                    <label>Depends On</label>
                    <select
                        className="modal-input"
                        value={form.dependsOnId}
                        onChange={e => setForm({ ...form, dependsOnId: e.target.value })}
                    >
                        <option value="">None</option>
                        {milestones
                            .filter(m => m.id !== milestoneToEdit?.id)
                            .map(m => <option key={m.id} value={m.id}>{m.name}</option>)
                        }
                    </select>
                </div>

                <div className="modal-col">
                    <label>Status</label>
                    <select
                        className="modal-input"
                        value={form.status}
                        onChange={e => setForm({ ...form, status: e.target.value })}
                    >
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                    </select>
                </div>
            </div>

            {/* --- DATE FIELDS WITH CONSTRAINTS --- */}
            <div className="modal-row">
                <div className="modal-col">
                    <label>Start Date</label>
                    <input
                        type="date"
                        className="modal-input"
                        value={form.startDate}
                        min={projectStart}
                        max={projectEnd}
                        onChange={e => setForm({ ...form, startDate: e.target.value })}
                    />
                </div>

                <div className="modal-col">
                    <label>End Date</label>
                    <input
                        type="date"
                        className="modal-input"
                        value={form.endDate}
                        min={form.startDate || projectStart}
                        max={projectEnd}
                        onChange={e => setForm({ ...form, endDate: e.target.value })}
                    />
                </div>
            </div>

            <div className="modal-actions">
                <button className="btn-cancel" onClick={onClose}>Cancel</button>
                <button className="btn-primary" onClick={handleSubmit}>
                    {isEditMode ? "Save Changes" : "Add Milestone"}
                </button>
            </div>
        </Modal>
    );
};

export default AddMilestoneModal;
