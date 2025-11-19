import React, { useEffect, useRef } from 'react';

const Modal = ({ onClose, children, className = "" }) => {
    const modalContentRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalContentRef.current && !modalContentRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <div className="modal-overlay">
            {/* Append the custom class here to override width/styles */}
            <div className={`modal-box ${className}`} ref={modalContentRef}>
                {children}
            </div>
        </div>
    );
};

export default Modal;