const express = require('express');
const router = express.Router();
const clinicController = require('../controllers/clinicController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Public/User routes
router.get('/', authMiddleware, clinicController.getClinics);
router.get('/:id', authMiddleware, clinicController.getClinicDetails);

// Doctor/Admin route for updating availability
router.put('/update-availability', authMiddleware, clinicController.updateDoctorAvailability);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, clinicController.createClinic);
router.put('/:id', authMiddleware, adminMiddleware, clinicController.updateClinic);
router.delete('/:id', authMiddleware, adminMiddleware, clinicController.deleteClinic);

module.exports = router;