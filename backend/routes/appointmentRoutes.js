const express = require('express');
const router = express.Router();
const {
  getUserAppointments,
  cancelAppointment,
  getAllAppointments,
  getClinicAppointments,
  updateAppointmentStatus
} = require('../controllers/appointmentController');
const {
  bookAppointment
} = require('../controllers/clinicController'); // Import from clinicController
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/', authMiddleware, getUserAppointments);
router.get('/all', authMiddleware, adminMiddleware, getAllAppointments); // Admin route
router.get('/doctor', authMiddleware, getClinicAppointments); // Doctor route
router.post('/', authMiddleware, bookAppointment); // Add this route
router.delete('/:id', authMiddleware, cancelAppointment);
router.put('/:id/status', authMiddleware, updateAppointmentStatus);

module.exports = router;