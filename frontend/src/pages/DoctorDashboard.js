import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';

const DoctorDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userString = localStorage.getItem('user');
        if (userString) {
            const user = JSON.parse(userString);
            if (!user.isDoctor) {
                navigate('/'); // block non-doctors
            }
        } else {
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        fetchClinicAppointments();
    }, []);

    const fetchClinicAppointments = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/appointments/doctor', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAppointments(res.data.appointments || []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch clinic appointments');
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        if (window.confirm(`Are you sure you want to mark this appointment as ${status}?`)) {
            try {
                const token = localStorage.getItem('token');
                await axios.put(`http://localhost:5000/api/appointments/${id}/status`, { status }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert(`Appointment marked as ${status}`);
                fetchClinicAppointments();
            } catch (err) {
                alert('Failed to update appointment status');
            }
        }
    };

    const thStyle = { padding: '10px', border: '1px solid #ddd', backgroundColor: '#f4f4f4', color: '#333', textAlign: 'left' };
    const tdStyle = { padding: '10px', border: '1px solid #ddd', color: '#555' };
    const btnStyle = { border: 'none', padding: '8px 15px', color: '#fff', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold', marginRight: '10px' };

    return (
        <div className="admin-container" style={{ padding: '2rem', minHeight: '80vh', color: '#333', maxWidth: '1000px', margin: '0 auto' }}>
            <h1>Doctor Dashboard</h1>
            <p>Manage pending appointments for your clinic.</p>

            {loading && <div>Loading clinic appointments...</div>}
            {error && <div style={{ color: '#ffcccc' }}>{error}</div>}

            {!loading && !error && (
                <div style={{ overflowX: 'auto', marginTop: '20px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Date & Time</th>
                                <th style={thStyle}>Patient Info</th>
                                <th style={thStyle}>Notes</th>
                                <th style={thStyle}>Status</th>
                                <th style={thStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map(a => (
                                <tr key={a._id} style={{ background: a.status === 'pending' ? '#fff9e6' : '#fff' }}>
                                    <td style={tdStyle}>{new Date(a.date).toLocaleDateString()} at {a.time}</td>
                                    <td style={tdStyle}>
                                        {a.patientId?.name ? (
                                            <span 
                                                onClick={() => setSelectedPatient(a.patientId)}
                                                style={{ color: '#01d8d1', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
                                            >
                                                {a.patientId.name}
                                            </span>
                                        ) : (
                                            <strong>Unknown Patient</strong>
                                        )}
                                    </td>
                                    <td style={tdStyle}>{a.notes}</td>
                                    <td style={tdStyle}>
                                        <span style={{ 
                                            padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
                                            backgroundColor: a.status === 'pending' ? '#ffc107' : a.status === 'confirmed' ? '#28a745' : '#dc3545',
                                            color: a.status === 'pending' ? '#333' : '#fff'
                                        }}>
                                            {a.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        {a.status === 'pending' && (
                                            <>
                                                <button onClick={() => handleUpdateStatus(a._id, 'confirmed')} style={{ ...btnStyle, backgroundColor: '#01d8d1' }}>Approve</button>
                                                <button onClick={() => handleUpdateStatus(a._id, 'cancelled')} style={{ ...btnStyle, backgroundColor: '#dc3545', marginRight: 0 }}>Deny</button>
                                            </>
                                        )}
                                        {a.status === 'confirmed' && (
                                            <button onClick={() => handleUpdateStatus(a._id, 'completed')} style={{ ...btnStyle, backgroundColor: '#28a745', marginRight: 0 }}>Mark Completed</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {appointments.length === 0 && <tr><td colSpan="5" style={{ ...tdStyle, textAlign: 'center' }}>No appointments booked for your clinic yet.</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedPatient && (
                <>
                    <div 
                        onClick={() => setSelectedPatient(null)}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.5)', zIndex: 999
                        }}
                    />
                    <div style={{
                        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        background: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                        zIndex: 1000, color: '#333', width: '300px'
                    }}>
                        <h2 style={{marginTop: 0, borderBottom: '1px solid #ddd', paddingBottom: '10px'}}>Patient Details</h2>
                        <p style={{marginBottom: '5px'}}><strong>Name:</strong> {selectedPatient.name}</p>
                        <p style={{marginBottom: '15px'}}><strong>Email:</strong> {selectedPatient.email}</p>
                        <button onClick={() => setSelectedPatient(null)} style={{ ...btnStyle, backgroundColor: '#dc3545', width: '100%', marginRight: 0 }}>Close</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default DoctorDashboard;
