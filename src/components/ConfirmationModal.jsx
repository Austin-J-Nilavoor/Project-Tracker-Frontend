import React from "react";
import Modal from "./Modal";

/**
 * A reusable confirmation modal with safe backdrop handling.
 */
const ConfirmationModal = ({
    isOpen,
    onClose,
    title = "Alert",
    message,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDanger = false,
    showCancel = true
}) => {
    if (!isOpen) return null;

    const handleCancel = () => {
        if (onCancel) onCancel();
        else onClose();
    };

    return (
        <Modal
            // ❗ Prevent automatic closing when clicking background
            onClose={() => {}}
            className="modal-box-small"
        >
            {/* ❗ Prevent clicks inside modal from triggering backdrop close */}
            <div onClick={(e) => e.stopPropagation()}>
                
                <h3
                    style={{
                        marginBottom: "0.75rem",
                        fontSize: "1.25rem",
                        fontWeight: "600",
                        color: isDanger ? "#ef4444" : "#1f2937",
                    }}
                >
                    {title}
                </h3>

                {message && (
                    <p
                        style={{
                            marginBottom: "1.5rem",
                            color: "#4b5563",
                            fontSize: "0.95rem",
                            lineHeight: "1.5",
                        }}
                    >
                        {message}
                    </p>
                )}

                <div
                    className="modal-actions"
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "0.75rem",
                    }}
                >
                    {showCancel && (
                        <button className="btn-secondary" onClick={handleCancel}>
                            {cancelText}
                        </button>
                    )}

                    {onConfirm && (
                        <button
                            className={isDanger ? "" : "btn-primary"}
                            onClick={onConfirm}
                            style={
                                isDanger
                                    ? {
                                          backgroundColor: "#ef4444",
                                          color: "white",
                                          border: "none",
                                          padding: "0.5rem 1rem",
                                          borderRadius: "0.375rem",
                                          fontWeight: "600",
                                          cursor: "pointer",
                                      }
                                    : {}
                            }
                        >
                            {confirmText}
                        </button>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmationModal;
