import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import '../styles/Auth.css';

const Login = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            const res = await axios.post(`${baseUrl}/auth/login`, formData);
            
            if (res.data.token && res.data.user) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                navigate('/UserProfile');
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Login error:', error.response?.data || error.message);
            if (error.response?.data?.requiresOtp) {
                setStep(2);
                setError(error.response.data.message);
            } else {
                setError(error.response?.data?.message || 'Login failed. Please try again.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
    };

    const handleVerifySubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            const res = await axios.post(`${baseUrl}/auth/verify-otp`, { 
                email: formData.email, 
                otp 
            });
            
            if (res.data.token && res.data.user) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                alert('Verification successful!');
                navigate('/UserProfile');
            }
        } catch (error) {
            console.error(error.response?.data || error.message);
            setError(error.response?.data?.message || 'Verification failed. Please try again.');
        }
    };

    const handleResendOtp = async () => {
        setError('');
        try {
            const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            await axios.post(`${baseUrl}/auth/resend-otp`, { email: formData.email });
            alert('A new OTP has been sent to your email.');
        } catch (error) {
            console.error(error.response?.data || error.message);
            setError(error.response?.data?.message || 'Failed to resend OTP.');
        }
    };

    return (
        <div className="auth-container">
            {step === 1 ? (
                <>
                    <h2>Login</h2>
                    {error && <div className="auth-error">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                            <button 
                                type="button" 
                                className="password-toggle-icon"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        <button type="submit">Login</button>
                    </form>
                    <div className="auth-link" style={{ marginTop: '15px' }}>
                        <Link to="/forgot-password">Forgot Password?</Link>
                    </div>
                    <div className="auth-link">
                        Not registered yet? <Link to="/register">Signup now</Link>
                    </div>
                </>
            ) : (
                <>
                    <h2>Verify Your Email</h2>
                    {error && <div className="auth-error">{error}</div>}
                    <p style={{marginBottom: "20px", textAlign: "center", color: "#666"}}>
                        We need to verify your email. Please check your inbox for the OTP.
                    </p>
                    <form onSubmit={handleVerifySubmit}>
                        <input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength="6"
                            required
                        />
                        <button type="submit">Verify & Login</button>
                    </form>
                    <div className="auth-link" style={{marginTop: "15px"}}>
                        Didn't receive code? <span onClick={handleResendOtp} style={{color: "#007bff", cursor: "pointer", textDecoration: "underline"}}>Resend OTP</span>
                    </div>
                    <div className="auth-link">
                        <span onClick={() => { setStep(1); setError(''); }} style={{color: "#007bff", cursor: "pointer", textDecoration: "underline"}}>Back to Login</span>
                    </div>
                </>
            )}
        </div>
    );
};

export default Login;