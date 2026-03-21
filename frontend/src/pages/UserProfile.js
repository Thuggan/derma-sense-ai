import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/UserProfile.css';
import profileImage from '../assets/profile.png';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Reuse eye icons

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState('');
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
                const res = await axios.get(`${baseUrl}/auth/user`, {
                    headers: { 
                        Authorization: `Bearer ${token}`
                    }
                });
                
                if (!res.data) throw new Error('No user data received');

                setUser(res.data);
                setFormData({ name: res.data.name, email: res.data.email, password: '' });
                localStorage.setItem('user', JSON.stringify(res.data));
            } catch (err) {
                console.error('Profile fetch error:', err);
                setError(err.response?.data?.message || 'Failed to load profile. Please login again.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleUpdateChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setError('');
        setUpdateSuccess('');

        try {
            const token = localStorage.getItem('token');
            const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            
            // Only send password if it's filled
            const payload = { name: formData.name, email: formData.email };
            if (formData.password.trim() !== '') {
                payload.password = formData.password;
            }

            const res = await axios.put(`${baseUrl}/auth/user`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
            }

            setFormData({ name: res.data.name, email: res.data.email, password: '' });
            setIsEditing(false);
            setUpdateSuccess('Profile updated successfully!');
            setTimeout(() => setUpdateSuccess(''), 3000);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to update profile.');
        }
    };

    if (loading) return <div className="user-profile-container">Loading profile...</div>;
    if (error && !user) return <div className="user-profile-container">{error}</div>;

    return (
        <div className="user-profile-container">
            <div className="user-profile-frame">
                <h1>User Profile</h1>
                
                {updateSuccess && <div style={{ color: '#01d8d1', marginBottom: '15px' }}>{updateSuccess}</div>}
                {error && <div style={{ color: '#ffcccc', marginBottom: '15px' }}>{error}</div>}

                <div className="profile-content">
                    <div className="profile-image">
                        <img src={profileImage} alt="Profile" />
                    </div>
                    
                    {!isEditing ? (
                        <div className="profile-details">
                            <h2>{user?.name}</h2>
                            <p>Email: {user?.email}</p>
                            
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button onClick={() => setIsEditing(true)} style={{ padding: '10px 20px', borderRadius: '5px', background: '#01d8d1', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                                    Edit Profile
                                </button>
                                <button onClick={handleLogout} className="logout-button">
                                    Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', maxWidth: '300px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                                <label style={{ color: '#fff', marginBottom: '5px' }}>Name</label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={handleUpdateChange} 
                                    style={{ padding: '10px', borderRadius: '5px', border: 'none' }}
                                    required
                                />
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                                <label style={{ color: '#fff', marginBottom: '5px' }}>Email</label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={formData.email} 
                                    onChange={handleUpdateChange} 
                                    style={{ padding: '10px', borderRadius: '5px', border: 'none' }}
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', position: 'relative' }}>
                                <label style={{ color: '#fff', marginBottom: '5px' }}>New Password (Leave blank to keep current)</label>
                                <div style={{ display: 'flex', position: 'relative' }}>
                                    <input 
                                        type={showPassword ? 'text' : 'password'} 
                                        name="password" 
                                        value={formData.password} 
                                        onChange={handleUpdateChange} 
                                        style={{ padding: '10px', borderRadius: '5px', border: 'none', flex: 1, paddingRight: '40px' }}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#333', cursor: 'pointer' }}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="submit" style={{ padding: '10px 20px', borderRadius: '5px', background: '#01d8d1', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                                    Save Changes
                                </button>
                                <button type="button" onClick={() => { setIsEditing(false); setError(''); }} style={{ padding: '10px 20px', borderRadius: '5px', background: '#444', color: '#fff', border: 'none', cursor: 'pointer' }}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;