import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import '../styles/Auth.css';

const Register = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [otp, setOtp] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            const res = await axios.post(`${baseUrl}/auth/register`, formData);
            alert('Registration successful! Please check your email for the OTP.');
            setStep(2);
        } catch (error) {
            console.error(error.response?.data || error.message);
            alert(error.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    const handleVerifySubmit = async (e) => {
        e.preventDefault();
        try {
            const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            const res = await axios.post(`${baseUrl}/auth/verify-otp`, { 
                email: formData.email, 
                otp 
            });
            console.log(res.data);
            alert('Verification successful! You can now log in.');
            navigate('/login'); // Redirect to login page after successful registration & verification
        } catch (error) {
            console.error(error.response?.data || error.message);
            alert(error.response?.data?.message || 'Verification failed. Please try again.');
        }
    };

    const handleResendOtp = async () => {
        try {
            const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            await axios.post(`${baseUrl}/auth/resend-otp`, { email: formData.email });
            alert('A new OTP has been sent to your email.');
        } catch (error) {
            console.error(error.response?.data || error.message);
            alert(error.response?.data?.message || 'Failed to resend OTP.');
        }
    };

    return (
        <div className="auth-container">
            {step === 1 ? (
                <>
                    <h2>Register</h2>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
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
                        <button type="submit">Register</button>
                    </form>
                    <div className="auth-link">
                        Already have an account? <Link to="/login">Login</Link>
                    </div>
                </>
            ) : (
                <>
                    <h2>Verify Your Email</h2>
                    <p style={{marginBottom: "20px", textAlign: "center", color: "#666"}}>
                        We've sent a 6-digit code to <strong>{formData.email}</strong>
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
                        <button type="submit">Verify Email</button>
                    </form>
                    <div className="auth-link" style={{marginTop: "15px"}}>
                        Didn't receive code? <span onClick={handleResendOtp} style={{color: "#007bff", cursor: "pointer", textDecoration: "underline"}}>Resend OTP</span>
                    </div>
                </>
            )}
        </div>
    );
};

export default Register;