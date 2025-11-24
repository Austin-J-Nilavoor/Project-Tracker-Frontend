import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/NotFound.css';
import Header from '../components/Header';
const NotFound = () => {
    const navigate = useNavigate();

    const handleGoToHomepage = () => {
        // Navigating to '/' will trigger the DashboardRouter in App.jsx,
        // ensuring the user lands on their correct role-based dashboard if logged in.
        navigate('/');
    };

    const handleContactSupport = () => {
        // Placeholder for a real support link or modal
        alert("Please contact support at support@projecttracker.com for assistance.");
    };

    return (<>  <Header/>
        <div className="not-found-wrapper">
          
            <div className="not-found-card">
                
                <h1 className="error-code">404</h1>
                <h2 className="error-title">Page Not Found</h2>
                
                <p className="error-message-NF">
                    The page you are looking for might have been removed, 
                    had its name changed, or is temporarily unavailable.
                </p>
                
                <div className="button-group-404">
                    <button 
                        className="btn btn-primary btn-homepage" 
                        onClick={handleGoToHomepage}
                    >
                        Go to Homepage
                    </button>
                </div>
            </div>
        </div></>
    );
};

export default NotFound;