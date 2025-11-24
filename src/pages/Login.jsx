import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authServices'; // Corrected filename to standard convention
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react'; // Import icons for password toggle
import '../styles/LoginPage.css'

const Login = () => {
    const { isAuthenticated, login: authLogin, user} = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // New state for password visibility

    // NOTE: This redirect logic should ideally be handled by DashboardRouter in App.jsx
    // but preserving your inline logic here for current functionality.
    useEffect(() => {
        if (isAuthenticated && user) {
            
            redirectUser(user.role);
        }
    }, [isAuthenticated, user, navigate]);
    
    const redirectUser = (role) => {
        // Using the router logic established in App.jsx for specific roles
        switch (role) {
            case 'ADMIN':
                navigate('/admin');
                break;
            case 'MANAGER':
                navigate('/manager');
                break;
            case 'EMPLOYEE':
                navigate('/projects'); // Employee typically lands on the main dashboard/task view
                break;
            default:
                navigate('/');
        }
    };
    
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const authResponse = await authService.login(formData.email, formData.password);
            authLogin(authResponse); // Updates context and triggers redirect

        } catch (err) {
            // Accesses the message provided by the GlobalExceptionHandler
            const errorMessage = err.response?.data?.message || 'Login failed due to an unexpected error.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (isAuthenticated) {
        return <div className="loading-redirect">Redirecting...</div>;
    }

    // --- New Two-Column Layout UI ---
    return (
        <div className="split-login-wrapper">
            <div className="split-login-container">
                
                
                <div className="promo-panel">
                    <div className="promo-content">
                        <h1>Project Tracker</h1>
                        <p>Unlock your team's potential. Streamline workflows, track progress, and deliver projects on time, every time.</p>
                    </div>
                </div>

            
                <div className="form-panel">
                    <div className="form-panel-inner">
                    <h2 className="form-title">Welcome Back</h2>
                    <p className="form-subtitle">Please enter your details to sign in.</p>

                    <form onSubmit={handleSubmit} className="login-form">

                        {/* Error Message */}
                        {error && <p className="error-message">{error}</p>}
                        
                   
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <div className="input-with-icon">
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email || ''}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                   
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-with-icon">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password || ''}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    required
                                    disabled={loading}
                                />
                                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        
          
                        <button type="submit" disabled={loading} className="login-button btn-primary">
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                    
                
                </div></div>
            </div>
        </div>
    );
};

export default Login;