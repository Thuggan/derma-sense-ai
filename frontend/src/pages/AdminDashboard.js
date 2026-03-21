import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('clinics');
  const [clinics, setClinics] = useState([]);
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', address: '', location: '', phone: '', email: '', description: ''
  });

  const navigate = useNavigate();

  // Verify Admin
  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      if (!user.isAdmin) {
        navigate('/'); // redirect non-admins
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (activeTab === 'clinics') fetchClinics();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'appointments') fetchAppointments();
    if (activeTab === 'contacts') fetchContacts();
  }, [activeTab]);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // --- Fetches ---
  const fetchClinics = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/clinics?location=Colombo', getHeaders());
      setClinics(res.data.data || res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch clinics');
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/auth/users', getHeaders());
      setUsers(res.data.users || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch users');
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/appointments/all', getHeaders());
      setAppointments(res.data.appointments || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch appointments');
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/contact', getHeaders());
      setContacts(res.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch contacts');
      setLoading(false);
    }
  };

  // --- Handlers ---
  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddClinic = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/clinics', formData, getHeaders());
      alert('Clinic added successfully!');
      setShowForm(false);
      setFormData({ name: '', address: '', location: '', phone: '', email: '', description: '' });
      fetchClinics();
    } catch (err) {
      console.error(err);
      alert('Failed to add clinic');
    }
  };

  const handleDeleteClinic = async (id) => {
    if (window.confirm('Are you sure you want to delete this clinic?')) {
      try {
        await axios.delete(`http://localhost:5000/api/clinics/${id}`, getHeaders());
        alert('Clinic deleted');
        fetchClinics();
      } catch (err) {
        alert('Failed to delete clinic');
      }
    }
  };

  const handleToggleAdminStatus = async (id, isAdmin) => {
    try {
      await axios.put(`http://localhost:5000/api/auth/users/${id}/admin`, { isAdmin }, getHeaders());
      alert('User status updated');
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleAssignDoctor = async (id, clinicId) => {
    try {
      await axios.put(`http://localhost:5000/api/auth/users/${id}/admin`, { 
        isDoctor: clinicId ? true : false,
        clinicId: clinicId || null 
      }, getHeaders());
      alert('User doctor assignment updated');
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign doctor');
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:5000/api/auth/users/${id}`, getHeaders());
        alert('User deleted');
        fetchUsers();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleDeleteContact = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact message?')) {
      try {
        await axios.delete(`http://localhost:5000/api/contact/${id}`, getHeaders());
        alert('Message deleted');
        fetchContacts();
      } catch (err) {
        alert('Failed to delete message');
      }
    }
  };

  // --- Styles ---
  const tabStyle = (isActive) => ({
    padding: '10px 20px',
    backgroundColor: isActive ? '#01d8d1' : '#f0f0f0',
    color: isActive ? '#fff' : '#333',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: '0.3s'
  });

  const btnStyle = { border: 'none', padding: '5px 10px', color: '#fff', cursor: 'pointer', borderRadius: '3px' };
  const thStyle = { padding: '10px', border: '1px solid #ddd', backgroundColor: '#f4f4f4', color: '#333', textAlign: 'left' };
  const tdStyle = { padding: '10px', border: '1px solid #ddd', color: '#555' };

  return (
    <div className="admin-container" style={{ padding: '2rem', minHeight: '80vh', color: '#333' }}>
      <h1>Admin Dashboard</h1>
      <p>Manage clinics, users, appointments, and contact messages.</p>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('clinics')} style={tabStyle(activeTab === 'clinics')}>Clinics</button>
        <button onClick={() => setActiveTab('users')} style={tabStyle(activeTab === 'users')}>Users</button>
        <button onClick={() => setActiveTab('appointments')} style={tabStyle(activeTab === 'appointments')}>Appointments</button>
        <button onClick={() => setActiveTab('contacts')} style={tabStyle(activeTab === 'contacts')}>Contacts</button>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div style={{color:'#ffcccc'}}>{error}</div>}

      {/* CLINCIS TAB */}
      {!loading && !error && activeTab === 'clinics' && (
        <div>
          <button 
            style={{ padding: '10px 20px', backgroundColor: '#01d8d1', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' }}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ Add New Clinic'}
          </button>

          {showForm && (
            <form onSubmit={handleAddClinic} style={{ display: 'flex', flexDirection: 'column', maxWidth: '400px', gap: '10px', marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: '#f9f9f9' }}>
              <h3 style={{color:'#333'}}>Add Clinic</h3>
              <input type="text" name="name" placeholder="Clinic Name" value={formData.name} onChange={handleInputChange} required style={{padding:'10px'}}/>
              <input type="text" name="location" placeholder="Location e.g. Colombo" value={formData.location} onChange={handleInputChange} required style={{padding:'10px'}}/>
              <input type="text" name="address" placeholder="Full Address" value={formData.address} onChange={handleInputChange} required style={{padding:'10px'}}/>
              <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleInputChange} style={{padding:'10px'}}/>
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} style={{padding:'10px'}}/>
              <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }}>Create Clinic</button>
            </form>
          )}

          <h3>Existing Clinics</h3>
          <div style={{overflowX: 'auto'}}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Location</th>
                  <th style={thStyle}>Address</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clinics.map(clinic => (
                  <tr key={clinic._id}>
                    <td style={tdStyle}>{clinic.name}</td>
                    <td style={tdStyle}>{clinic.location}</td>
                    <td style={tdStyle}>{clinic.address}</td>
                    <td style={tdStyle}>
                      <button onClick={() => handleDeleteClinic(clinic._id)} style={{ ...btnStyle, backgroundColor: '#dc3545' }}>Delete</button>
                    </td>
                  </tr>
                ))}
                {clinics.length === 0 && <tr><td colSpan="4" style={{...tdStyle, textAlign: 'center'}}>No clinics found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {!loading && !error && activeTab === 'users' && (
        <div>
          <h3>Registered Users</h3>
          <div style={{overflowX: 'auto'}}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Role</th>
                  <th style={thStyle}>Assign Clinic (DoctorRole)</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td style={tdStyle}>{u.name}</td>
                    <td style={tdStyle}>{u.email}</td>
                    <td style={tdStyle}>{u.isAdmin ? 'Admin' : (u.isDoctor ? 'Doctor' : 'User')}</td>
                    <td style={tdStyle}>
                      <select 
                        defaultValue={u.clinicId || ""} 
                        onChange={(e) => handleAssignDoctor(u._id, e.target.value)}
                        style={{ padding: '5px', borderRadius: '3px', border: '1px solid #ddd' }}
                      >
                        <option value="">None (Standard User)</option>
                        {clinics.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    </td>
                    <td style={tdStyle}>
                      <button onClick={() => handleToggleAdminStatus(u._id, !u.isAdmin)} style={{ ...btnStyle, backgroundColor: u.isAdmin ? '#ffc107' : '#28a745', marginRight: '5px' }}>
                        {u.isAdmin ? 'Remove Admin' : 'Make Admin'}
                      </button>
                      <button onClick={() => handleDeleteUser(u._id)} style={{ ...btnStyle, backgroundColor: '#dc3545' }}>Delete</button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan="5" style={{...tdStyle, textAlign: 'center'}}>No users found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* APPOINTMENTS TAB */}
      {!loading && !error && activeTab === 'appointments' && (
        <div>
          <h3>Global Appointments</h3>
          <div style={{overflowX: 'auto'}}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Patient Name</th>
                  <th style={thStyle}>Clinic</th>
                  <th style={thStyle}>Doctor</th>
                  <th style={thStyle}>Date & Time</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a._id}>
                    <td style={tdStyle}>{a.patientId?.name || 'Unknown'}</td>
                    <td style={tdStyle}>{a.clinicId?.name || 'Unknown Clinic'}</td>
                    <td style={tdStyle}>{a.doctorName}</td>
                    <td style={tdStyle}>{new Date(a.date).toLocaleDateString()} at {a.time}</td>
                    <td style={tdStyle}>{a.status}</td>
                  </tr>
                ))}
                {appointments.length === 0 && <tr><td colSpan="5" style={{...tdStyle, textAlign: 'center'}}>No appointments found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTACTS TAB */}
      {!loading && !error && activeTab === 'contacts' && (
        <div>
          <h3>Contact Us Submissions</h3>
          <div style={{overflowX: 'auto'}}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Message</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map(c => (
                  <tr key={c._id}>
                    <td style={tdStyle}>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td style={tdStyle}>{c.name}</td>
                    <td style={tdStyle}>{c.email}</td>
                    <td style={tdStyle}>{c.message}</td>
                    <td style={tdStyle}>
                      <button onClick={() => handleDeleteContact(c._id)} style={{ ...btnStyle, backgroundColor: '#dc3545' }}>Delete</button>
                    </td>
                  </tr>
                ))}
                {contacts.length === 0 && <tr><td colSpan="5" style={{...tdStyle, textAlign: 'center'}}>No messages found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
