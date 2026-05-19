import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';
import { formatAppointmentDate } from '../utils/appointmentDate';

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
    name: '',
    address: '',
    location: '',
    phone: '',
    email: '',
    website: '',
    openingHours: '',
    description: '',
    servicesText: ''
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorDraft, setDoctorDraft] = useState({
    name: '',
    specialization: '',
    qualifications: '',
    experience: '',
    availabilityText: ''
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
      const res = await axios.get('http://localhost:5000/api/clinics', getHeaders());
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

  const resetClinicForm = () => {
    setFormData({
      name: '',
      address: '',
      location: '',
      phone: '',
      email: '',
      website: '',
      openingHours: '',
      description: '',
      servicesText: ''
    });
    setImageFiles([]);
    setDoctors([]);
    setDoctorDraft({
      name: '',
      specialization: '',
      qualifications: '',
      experience: '',
      availabilityText: ''
    });
  };

  const parseAvailability = (availabilityText) => (
    availabilityText
      .split('\n')
      .map(line => {
        const [day, slotsText] = line.split(':');
        if (!day || !slotsText) return null;
        return {
          day: day.trim(),
          slots: slotsText.split(',').map(slot => slot.trim()).filter(Boolean)
        };
      })
      .filter(Boolean)
  );

  const handleDoctorDraftChange = (e) => {
    setDoctorDraft({ ...doctorDraft, [e.target.name]: e.target.value });
  };

  const handleAddDoctorToForm = () => {
    if (!doctorDraft.name.trim()) {
      alert('Doctor name is required before adding a doctor');
      return;
    }

    setDoctors([
      ...doctors,
      {
        name: doctorDraft.name.trim(),
        specialization: doctorDraft.specialization.trim(),
        qualifications: doctorDraft.qualifications.trim(),
        experience: doctorDraft.experience.trim(),
        availability: parseAvailability(doctorDraft.availabilityText)
      }
    ]);
    setDoctorDraft({
      name: '',
      specialization: '',
      qualifications: '',
      experience: '',
      availabilityText: ''
    });
  };

  const uploadClinicImages = async () => {
    if (imageFiles.length === 0) return [];

    const uploadData = new FormData();
    imageFiles.forEach(file => uploadData.append('images', file));
    const token = localStorage.getItem('token');
    const res = await axios.post('http://localhost:5000/api/clinics/upload-images', uploadData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    return res.data.images || [];
  };

  const handleAddClinic = async (e) => {
    e.preventDefault();
    try {
      const images = await uploadClinicImages();
      const clinicPayload = {
        name: formData.name,
        address: formData.address,
        location: formData.location,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        openingHours: formData.openingHours,
        description: formData.description,
        services: formData.servicesText.split('\n').map(service => service.trim()).filter(Boolean),
        doctors,
        images
      };

      await axios.post('http://localhost:5000/api/clinics', clinicPayload, getHeaders());
      alert('Clinic added successfully!');
      setShowForm(false);
      resetClinicForm();
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
      {error && <div style={{ color: '#ffcccc' }}>{error}</div>}

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
            <form onSubmit={handleAddClinic} style={{ display: 'flex', flexDirection: 'column', maxWidth: '720px', gap: '12px', marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: '#f9f9f9' }}>
              <h3 style={{ color: '#333' }}>Add Clinic</h3>
              <input type="text" name="name" placeholder="Clinic Name" value={formData.name} onChange={handleInputChange} required style={{ padding: '10px' }} />
              <input type="text" name="location" placeholder="Location e.g. Kerala" value={formData.location} onChange={handleInputChange} required style={{ padding: '10px' }} />
              <input type="text" name="address" placeholder="Full Address" value={formData.address} onChange={handleInputChange} required style={{ padding: '10px' }} />
              <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleInputChange} required style={{ padding: '10px' }} />
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} style={{ padding: '10px' }} />
              <input type="text" name="website" placeholder="Website e.g. www.clinic.com" value={formData.website} onChange={handleInputChange} style={{ padding: '10px' }} />
              <input type="text" name="openingHours" placeholder="Opening Hours e.g. Daily: 7:00 AM - 7:00 PM" value={formData.openingHours} onChange={handleInputChange} style={{ padding: '10px' }} />
              <textarea name="description" placeholder="About the clinic" value={formData.description} onChange={handleInputChange} rows="3" style={{ padding: '10px', resize: 'vertical' }} />
              <textarea name="servicesText" placeholder={'Services offered, one per line\nGeneral Dermatology\nPsoriasis Care'} value={formData.servicesText} onChange={handleInputChange} rows="4" style={{ padding: '10px', resize: 'vertical' }} />

              <div style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '6px', background: '#fff' }}>
                <h4 style={{ marginTop: 0, color: '#333' }}>Clinic Photos</h4>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                />
                {imageFiles.length > 0 && (
                  <p style={{ marginBottom: 0, color: '#666' }}>{imageFiles.length} image(s) selected</p>
                )}
              </div>

              <div style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '6px', background: '#fff' }}>
                <h4 style={{ marginTop: 0, color: '#333' }}>Doctors</h4>
                <input type="text" name="name" placeholder="Doctor Name" value={doctorDraft.name} onChange={handleDoctorDraftChange} style={{ padding: '10px', width: '100%', marginBottom: '8px', boxSizing: 'border-box' }} />
                <input type="text" name="specialization" placeholder="Specialization" value={doctorDraft.specialization} onChange={handleDoctorDraftChange} style={{ padding: '10px', width: '100%', marginBottom: '8px', boxSizing: 'border-box' }} />
                <input type="text" name="qualifications" placeholder="Qualifications" value={doctorDraft.qualifications} onChange={handleDoctorDraftChange} style={{ padding: '10px', width: '100%', marginBottom: '8px', boxSizing: 'border-box' }} />
                <input type="text" name="experience" placeholder="Experience e.g. 10 years" value={doctorDraft.experience} onChange={handleDoctorDraftChange} style={{ padding: '10px', width: '100%', marginBottom: '8px', boxSizing: 'border-box' }} />
                <textarea
                  name="availabilityText"
                  placeholder={'Availability, one day per line\nMonday: 09:00-11:00, 14:00-16:00\nWednesday: 10:00-12:00'}
                  value={doctorDraft.availabilityText}
                  onChange={handleDoctorDraftChange}
                  rows="3"
                  style={{ padding: '10px', width: '100%', marginBottom: '8px', boxSizing: 'border-box', resize: 'vertical' }}
                />
                <button type="button" onClick={handleAddDoctorToForm} style={{ ...btnStyle, backgroundColor: '#17a2b8', padding: '8px 14px' }}>Add Doctor</button>
                {doctors.length > 0 && (
                  <ul style={{ color: '#333', paddingLeft: '20px' }}>
                    {doctors.map((doctor, index) => (
                      <li key={`${doctor.name}-${index}`} style={{ marginTop: '8px' }}>
                        {doctor.name} - {doctor.specialization || 'No specialization'}
                        <button
                          type="button"
                          onClick={() => setDoctors(doctors.filter((_, i) => i !== index))}
                          style={{ ...btnStyle, backgroundColor: '#dc3545', marginLeft: '10px' }}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }}>Create Clinic</button>
            </form>
          )}

          <h3>Existing Clinics</h3>
          <div style={{ overflowX: 'auto' }}>
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
                {clinics.length === 0 && <tr><td colSpan="4" style={{ ...tdStyle, textAlign: 'center' }}>No clinics found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {!loading && !error && activeTab === 'users' && (
        <div>
          <h3>Registered Users</h3>
          <div style={{ overflowX: 'auto' }}>
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
                {users.length === 0 && <tr><td colSpan="5" style={{ ...tdStyle, textAlign: 'center' }}>No users found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* APPOINTMENTS TAB */}
      {!loading && !error && activeTab === 'appointments' && (
        <div>
          <h3>Global Appointments</h3>
          <div style={{ overflowX: 'auto' }}>
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
                    <td style={tdStyle}>{formatAppointmentDate(a.date)} at {a.time}</td>
                    <td style={tdStyle}>{a.status}</td>
                  </tr>
                ))}
                {appointments.length === 0 && <tr><td colSpan="5" style={{ ...tdStyle, textAlign: 'center' }}>No appointments found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTACTS TAB */}
      {!loading && !error && activeTab === 'contacts' && (
        <div>
          <h3>Contact Us Submissions</h3>
          <div style={{ overflowX: 'auto' }}>
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
                {contacts.length === 0 && <tr><td colSpan="5" style={{ ...tdStyle, textAlign: 'center' }}>No messages found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;

