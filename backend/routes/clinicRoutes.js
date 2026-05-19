const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const clinicController = require('../controllers/clinicController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const clinicImagesDir = path.join(__dirname, '../../frontend/public/images/clinics');
fs.mkdirSync(clinicImagesDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, clinicImagesDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase();
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image uploads are allowed'));
    }
    cb(null, true);
  }
});

// Public/User routes
router.get('/', clinicController.getClinics);
router.get('/:id', clinicController.getClinicDetails);

// Doctor/Admin route for updating availability
router.put('/update-availability', authMiddleware, clinicController.updateDoctorAvailability);

// Admin routes
router.post('/upload-images', authMiddleware, adminMiddleware, upload.array('images', 5), clinicController.uploadClinicImages);
router.post('/', authMiddleware, adminMiddleware, clinicController.createClinic);
router.put('/:id', authMiddleware, adminMiddleware, clinicController.updateClinic);
router.delete('/:id', authMiddleware, adminMiddleware, clinicController.deleteClinic);

module.exports = router;
