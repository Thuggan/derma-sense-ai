const axios = require('axios');
const mongoose = require('mongoose');
const fs = require('fs');

const BASE_URL = 'http://localhost:5000/api';

async function runTest() {
  try {
    await mongoose.connect('mongodb://localhost:27017/skin_disease_db');
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const Clinic = mongoose.model('Clinic', new mongoose.Schema({}, { strict: false }));

    await User.deleteMany({ email: { $in: ['test_patient@example.com', 'test_doctor@example.com'] } });
    fs.appendFileSync('test_log.txt', '[1/9] Registering Patient...\n');
    let patientRes = await axios.post(`${BASE_URL}/auth/register`, { name: 'Test Patient', email: 'test_patient@example.com', password: 'password123' });
    let patientToken = patientRes.data.token;

    fs.appendFileSync('test_log.txt', '[2/9] Registering Doctor...\n');
    let docRes = await axios.post(`${BASE_URL}/auth/register`, { name: 'Dr. Saman Perera', email: 'test_doctor@example.com', password: 'password123' });
    let docToken = docRes.data.token;
    let docId = docRes.data.user.id;

    fs.appendFileSync('test_log.txt', '[3/9] Updating Doctor Role...\n');
    let clinic = await Clinic.findOne({ name: "Colombo Skin Clinic" });
    if (!clinic) throw new Error("Seed clinic not found.");
    await User.updateOne({ _id: new mongoose.Types.ObjectId(docId) }, { $set: { isDoctor: true, clinicId: clinic._id } });

    fs.appendFileSync('test_log.txt', '[4/9] Booking Appointment...\n');
    await axios.post(`${BASE_URL}/appointments`, {
      clinicId: clinic._id,
      doctorName: "Dr. Saman Perera",
      date: new Date().toISOString().split('T')[0],
      time: "14:00",
      notes: "Test appointment"
    }, { headers: { Authorization: `Bearer ${patientToken}` } });

    fs.appendFileSync('test_log.txt', '[5/9] Fetching Patient Notifications...\n');
    let patNotifRes = await axios.get(`${BASE_URL}/notifications`, { headers: { Authorization: `Bearer ${patientToken}` } });
    if (!patNotifRes.data.notifications.find(n => n.title === 'Booking Request Sent')) throw new Error('Patient missing notif');
    
    fs.appendFileSync('test_log.txt', '[6/9] Fetching Doctor Notifications...\n');
    let docNotifRes = await axios.get(`${BASE_URL}/notifications`, { headers: { Authorization: `Bearer ${docToken}` } });
    if (!docNotifRes.data.notifications.find(n => n.title === 'New Booking Request')) throw new Error('Doctor missing notif');
    
    fs.appendFileSync('test_log.txt', 'SUCCESS!');
    process.exit(0);

  } catch (error) {
    fs.appendFileSync('test_log.txt', 'ERROR: ' + JSON.stringify(error.response?.data || error.message) + '\n');
    process.exit(1);
  }
}

runTest();
