import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/Auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            const res = await axios.post(`${baseUrl}/auth/forgotpassword`, { email });
            setMessage(res.data.message || 'Email sent! Check your inbox to reset your password.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset email.');
        }
    };

    return (
        <div className="auth-container">
            <h2>Forgot Password</h2>
            {message && <div style={{ color: 'green', marginBottom: '15px' }}>{message}</div>}
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button type="submit">Send Reset Link</button>
            </form>
            <div className="auth-link">
                Remembered your password? <Link to="/login">Login here</Link>
            </div>
        </div>
    );
};

export default ForgotPassword;
