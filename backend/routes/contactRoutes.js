const express = require('express');
const router = express.Router();
const { submitContactForm, getAllContacts, deleteContact } = require('../controllers/contactController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.post('/', submitContactForm);
router.get('/', authMiddleware, adminMiddleware, getAllContacts);
router.delete('/:id', authMiddleware, adminMiddleware, deleteContact);

module.exports = router;
