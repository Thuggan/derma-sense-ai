import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [clinics, setClinics] = useState([]);
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
    description: ''
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

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // Just passing Colombo to get clinics or fetching all...
      // Since our clinicRoute requires location, we pass empty to get all if backend supports it, 
      // or just pass 'Colombo' since that's what seedClinics populated.
      const response = await axios.get('http://localhost:5000/api/clinics?location=Colombo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClinics(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch clinics');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddClinic = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/clinics', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/clinics/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Clinic deleted');
        fetchClinics();
      } catch (err) {
        console.error(err);
        alert('Failed to delete clinic');
      }
    }
  };

  if (loading) return <div>Loading Admin Dashboard...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;

  return (
    <div className="admin-container" style={{ padding: '2rem', minHeight: '80vh' }}>
      <h1>Admin Dashboard</h1>
      <p>Manage clinics and platform settings.</p>
      
      <button 
        style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '20px' }}
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? 'Cancel' : '+ Add New Clinic'}
      </button>

      {showForm && (
        <form onSubmit={handleAddClinic} style={{ display: 'flex', flexDirection: 'column', maxWidth: '400px', gap: '10px', marginBottom: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h3>Add Clinic</h3>
          <input type="text" name="name" placeholder="Clinic Name" value={formData.name} onChange={handleInputChange} required />
          <input type="text" name="location" placeholder="Location e.g. Colombo (Required for search)" value={formData.location} onChange={handleInputChange} required />
          <input type="text" name="address" placeholder="Full Address" value={formData.address} onChange={handleInputChange} required />
          <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleInputChange} />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} />
          <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }}>Create Clinic</button>
        </form>
      )}

      <h3>Existing Clinics</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f4f4f4', textAlign: 'left' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Name</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Location</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Address</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clinics.map(clinic => (
            <tr key={clinic._id}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{clinic.name}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{clinic.location}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{clinic.address}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                <button 
                  onClick={() => handleDeleteClinic(clinic._id)}
                  style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '3px' }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
