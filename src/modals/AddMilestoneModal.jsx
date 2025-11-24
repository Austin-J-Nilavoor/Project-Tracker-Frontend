import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import milestoneService from '../services/milestoneServices';
import Modal from '../components/Modal';

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

    const [fieldErrors, setFieldErrors] = useState({
        name: "",
        description: "",
        startDate: "",
        endDate: ""
    });

    const isEditMode = !!milestoneToEdit;

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

    useEffect(() => {
        if (!isEditMode && form.dependsOnId) {
            const parent = milestones.find(m => m.id === form.dependsOnId);
            if (parent?.endDate) {
                setForm(prev => ({
                    ...prev,
                    startDate: parent.endDate.substring(0, 10)
                }));
            }
        }
    }, [form.dependsOnId, milestones, isEditMode]);

    const projectStart = project?.startDate?.substring(0, 10) || "";
    const projectEnd = project?.endDate?.substring(0, 10) || "";

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this milestone?")) return;

        try {
            await milestoneService.deleteMilestone(milestoneToEdit.id);
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Delete failed", err);
            setError(err.response?.data?.message || "Failed to delete milestone.");
        }
    };

    const handleSubmit = async () => {
        setError(null);

        let newErrors = { name: "", description: "", startDate: "", endDate: "" };

        if (!form.name.trim()) newErrors.name = "Required";
        if (!form.description.trim()) newErrors.description = "Required";
        if (!form.startDate) newErrors.startDate = "Required";
        if (!form.endDate) newErrors.endDate = "Required";

        if (Object.values(newErrors).some(err => err)) {
            setFieldErrors(newErrors);
            return;
        }

        setFieldErrors({ name: "", description: "", startDate: "", endDate: "" });

        if (form.startDate < projectStart) {
            setFieldErrors(prev => ({ ...prev, startDate: "Before project start" }));
            return;
        }
        if (form.endDate > projectEnd) {
            setFieldErrors(prev => ({ ...prev, endDate: "After project end" }));
            return;
        }
        if (form.endDate < form.startDate) {
            setFieldErrors(prev => ({ ...prev, endDate: "Before start date" }));
            return;
        }

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
            {error && <div className="error-message">{error}</div>}

            <div className="modal-row">
                <div className="modal-col">
                    <label className="required-label">
                        Milestone Name
                        {fieldErrors.name && <span className="field-error-inline">{fieldErrors.name}</span>}
                    </label>
                    <input
                        type="text"
                        placeholder="Milestone Name"
                        className="modal-input"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                    />
                </div>

                <div className="modal-col">
                    <label className="required-label">
                        Description
                        {fieldErrors.description && <span className="field-error-inline">{fieldErrors.description}</span>}
                    </label>
                    <input
                        type="text"
                        placeholder="Description"
                        className="modal-input"
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                    />
                </div>
            </div>

            <div className="modal-row">
                <div className="modal-col">
                    <label>Depends On</label>
                    <select
                        className="modal-input"
                        value={form.dependsOnId || ""}
                        onChange={e => setForm({ ...form, dependsOnId: e.target.value || null })}
                    >
                        <option value="">None</option>
                        {milestones.filter(m => m.id !== milestoneToEdit?.id)
                            .map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
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

            <div className="modal-row">
                <div className="modal-col">
                    <label className="required-label">
                        Start Date
                        {fieldErrors.startDate && <span className="field-error-inline">{fieldErrors.startDate}</span>}
                    </label>
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
                    <label className="required-label">
                        End Date
                        {fieldErrors.endDate && <span className="field-error-inline">{fieldErrors.endDate}</span>}
                    </label>
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

            <div className="modal-actions" style={{ justifyContent: isEditMode ? "space-between" : "flex-end" }}>
                {isEditMode && (
                    <button
                        onClick={handleDelete}
                        style={{
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            padding: '8px 14px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#dc2626')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#ef4444')}
                    >
                        <Trash2 size={16} /> Delete
                    </button>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" onClick={handleSubmit}>
                        {isEditMode ? "Save Changes" : "Add Milestone"}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AddMilestoneModal;
