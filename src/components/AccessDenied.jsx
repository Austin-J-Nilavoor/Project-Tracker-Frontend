import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react'; // Padlock icon
import '../styles/AccessDenied.css';

const AccessDenied = () => {
    const navigate = useNavigate();

    const handleGoToDashboard = () => {
        // Navigating to '/' or '/dashboard' will trigger the DashboardRouter logic in App.jsx
        // which sends the user to their correct homepage (e.g., /manager or /employee).
        navigate('/');
    };

    const handleContactAdmin = () => {
        // In a real application, this would open a support chat or copy an admin email
        alert("Please contact your system administrator for access privileges.");
    };

    return (
        <div className="access-denied-wrapper">
            <div className="access-denied-card">
                <div className="icon-lock-wrapper">
                    <Lock size={32} />
                </div>
                
                <h1 className="denied-title">Access Denied</h1>
                
                <p className="denied-message">
                    You do not have the necessary permissions to view this page. Please 
                    contact your administrator if you believe this is an an error.
                </p>
                
                <div className="button-group">
                    <button 
                        className="btn btn-secondary btn-contact-admin" 
                        onClick={handleContactAdmin}
                    >
                        Contact Admin...
                    </button>
                    <button 
                        className="btn btn-primary" 
                        onClick={handleGoToDashboard}
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccessDenied;