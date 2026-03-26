import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Helper to convert arbitrary time strings to "HH:mm" (24h) for <input type="time">
const convertTo24Hour = (timeStr) => {
    if (!timeStr) return '';
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM|am|pm)?/);
    if (!match) return timeStr.trim(); // fallback
    let [ , hours, minutes, modifier ] = match;
    hours = parseInt(hours, 10);
    if (modifier) {
        modifier = modifier.toUpperCase();
        if (hours === 12 && modifier === 'AM') hours = 0;
        if (hours < 12 && modifier === 'PM') hours += 12;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
};

// Helper to convert "HH:mm" to "hh:mm AM/PM"
const convertTo12Hour = (time24) => {
    if (!time24) return '';
    let [hours, minutes] = time24.split(':');
    hours = parseInt(hours, 10);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const hours12 = ((hours + 11) % 12 + 1);
    return `${hours12.toString().padStart(2, '0')}:${minutes} ${suffix}`;
};

const parseSlotToTimes = (slotString) => {
    const parts = slotString.split('-');
    if (parts.length === 2) {
        return { start: convertTo24Hour(parts[0].trim()), end: convertTo24Hour(parts[1].trim()) };
    }
    return { start: convertTo24Hour(parts[0].trim()), end: '' }; // single time
};

const initializeWeeklySchedule = (availabilityArray) => {
    return weekDays.map(day => {
        const existing = (availabilityArray || []).find(a => a.day === day);
        const timeSlots = existing && existing.slots 
            ? existing.slots.map(parseSlotToTimes) 
            : [];
        return { day, timeSlots };
    });
};

const DoctorDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [clinic, setClinic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const navigate = useNavigate();

    // Availability State
    const [selectedDoctorName, setSelectedDoctorName] = useState('');
    const [doctorAvailability, setDoctorAvailability] = useState([]);
    const [isSavingAvailability, setIsSavingAvailability] = useState(false);

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
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch appointments
            const aptRes = await axios.get('http://localhost:5000/api/appointments/doctor', { headers });
            setAppointments(aptRes.data.appointments || []);

            // Fetch user profile to get the clinicId safely
            const userRes = await axios.get('http://localhost:5000/api/auth/user', { headers });
            const clinicId = userRes.data.clinicId;

            if (clinicId) {
                const clinicRes = await axios.get(`http://localhost:5000/api/clinics/${clinicId}`, { headers });
                const clinicData = clinicRes.data.data;
                setClinic(clinicData);

                if (clinicData.doctors && clinicData.doctors.length > 0) {
                    // Pre-select doctor based on name
                    const userName = userRes.data.name;
                    const match = clinicData.doctors.find(
                        d => d.name === userName || d.name.includes(userName) || userName.includes(d.name)
                    );
                    const selectedDoc = match || clinicData.doctors[0];
                    setSelectedDoctorName(selectedDoc.name);
                    setDoctorAvailability(initializeWeeklySchedule(selectedDoc.availability));
                }
            }

            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch dashboard data');
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
                fetchDashboardData();
            } catch (err) {
                alert('Failed to update appointment status');
            }
        }
    };

    // --- Availability Handlers ---
    const handleDoctorChange = (e) => {
        const name = e.target.value;
        setSelectedDoctorName(name);
        const doc = clinic.doctors.find(d => d.name === name);
        setDoctorAvailability(initializeWeeklySchedule(doc ? doc.availability : []));
    };

    const handleAddSlot = (dayIndex) => {
        const newAvail = [...doctorAvailability];
        newAvail[dayIndex].timeSlots.push({ start: '', end: '' });
        setDoctorAvailability(newAvail);
    };

    const handleRemoveSlot = (dayIndex, slotIndex) => {
        const newAvail = [...doctorAvailability];
        newAvail[dayIndex].timeSlots.splice(slotIndex, 1);
        setDoctorAvailability(newAvail);
    };

    const handleTimeChange = (dayIndex, slotIndex, field, value) => {
        const newAvail = [...doctorAvailability];
        newAvail[dayIndex].timeSlots[slotIndex][field] = value;
        setDoctorAvailability(newAvail);
    };

    const saveAvailability = async () => {
        try {
            setIsSavingAvailability(true);
            const token = localStorage.getItem('token');
            
            // Format back to string arrays and keep only valid days
            const dataToSave = doctorAvailability.map(dayObj => {
                const formattedSlots = dayObj.timeSlots
                    .filter(slot => slot.start) // start time is completely required
                    .map(slot => {
                        const start12 = convertTo12Hour(slot.start);
                        if (slot.end) {
                            const end12 = convertTo12Hour(slot.end);
                            return `${start12} - ${end12}`;
                        }
                        return start12;
                    });
                
                return {
                    day: dayObj.day,
                    slots: formattedSlots
                };
            }).filter(d => d.slots.length > 0);

            await axios.put(`http://localhost:5000/api/clinics/update-availability`, 
                { doctorName: selectedDoctorName, availability: dataToSave },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Availability saved successfully!');
            fetchDashboardData();
        } catch (err) {
            console.error(err);
            alert('Failed to save availability');
        } finally {
            setIsSavingAvailability(false);
        }
    };

    const thStyle = { padding: '10px', border: '1px solid #ddd', backgroundColor: '#f4f4f4', color: '#333', textAlign: 'left' };
    const tdStyle = { padding: '10px', border: '1px solid #ddd', color: '#555' };
    const btnStyle = { border: 'none', padding: '8px 15px', color: '#fff', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold', marginRight: '10px' };

    return (
        <div className="admin-container" style={{ padding: '2rem', minHeight: '80vh', color: '#333', maxWidth: '1000px', margin: '0 auto' }}>
            <h1>Doctor Dashboard</h1>
            <p>Manage your pending appointments and your weekly schedule.</p>

            {loading && <div>Loading clinic details and appointments...</div>}
            {error && <div style={{ color: '#ffcccc' }}>{error}</div>}

            {!loading && !error && clinic && (
                <div style={{ marginBottom: '40px', padding: '20px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd' }}>
                    <h2>My Weekly Schedule</h2>
                    <p style={{ marginBottom: '15px' }}>Add consultation time windows for your available days. Leave a day without slots to mark it as unavailable.</p>
                    
                    {clinic.doctors && clinic.doctors.length > 0 ? (
                        <>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Select Doctor Profile:</label>
                                <select 
                                    value={selectedDoctorName} 
                                    onChange={handleDoctorChange}
                                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                >
                                    {clinic.doctors.map(d => (
                                        <option key={d.name} value={d.name}>{d.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {doctorAvailability.map((avail, dayIndex) => (
                                    <div key={avail.day} style={{ display: 'flex', flexDirection: 'column', gap: '5px', background: '#fff', padding: '15px', border: '1px solid #eee', borderRadius: '4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ fontWeight: 'bold', width: '100px', fontSize: '16px' }}>
                                                {avail.day}
                                            </div>
                                            <button 
                                                onClick={() => handleAddSlot(dayIndex)} 
                                                style={{ ...btnStyle, backgroundColor: '#01d8d1', color: '#333', margin: 0, padding: '6px 12px', fontSize: '13px' }}
                                            >
                                                + Add Time Slot
                                            </button>
                                        </div>
                                        
                                        {avail.timeSlots.length === 0 ? (
                                            <span style={{ fontSize: '14px', color: '#888', fontStyle: 'italic', marginTop: '5px' }}>Not Available</span>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                                                {avail.timeSlots.map((slot, slotIndex) => (
                                                    <div key={slotIndex} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <span style={{ fontSize: '14px', color: '#555', fontWeight: 'bold' }}>Start:</span>
                                                        <input 
                                                            type="time" 
                                                            value={slot.start} 
                                                            onChange={(e) => handleTimeChange(dayIndex, slotIndex, 'start', e.target.value)}
                                                            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontFamily: 'monospace' }}
                                                        />
                                                        <span style={{ fontSize: '14px', color: '#555', fontWeight: 'bold', marginLeft: '10px' }}>End (Optional):</span>
                                                        <input 
                                                            type="time" 
                                                            value={slot.end} 
                                                            onChange={(e) => handleTimeChange(dayIndex, slotIndex, 'end', e.target.value)}
                                                            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontFamily: 'monospace' }}
                                                        />
                                                        <button 
                                                            onClick={() => handleRemoveSlot(dayIndex, slotIndex)} 
                                                            style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', marginLeft: '10px' }}
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                <button 
                                    onClick={saveAvailability} 
                                    disabled={isSavingAvailability}
                                    style={{ ...btnStyle, backgroundColor: '#28a745', padding: '10px 20px', fontSize: '16px' }}
                                >
                                    {isSavingAvailability ? 'Saving Schedule...' : 'Save Schedule'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <p>No doctors associated with this clinic.</p>
                    )}
                </div>
            )}

            {!loading && !error && (
                <div style={{ overflowX: 'auto', marginTop: '20px' }}>
                    <h2>Pending Appointments</h2>
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
                                                <button onClick={() => handleUpdateStatus(a._id, 'confirmed')} style={{ ...btnStyle, backgroundColor: '#01d8d1', color: '#333' }}>Approve</button>
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
