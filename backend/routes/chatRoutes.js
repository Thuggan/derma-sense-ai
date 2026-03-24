const express = require('express');
const { chatWithPsychiatrist } = require('../controllers/chatController');

const router = express.Router();

// Route to handle therapist chat messages
router.post('/', chatWithPsychiatrist);

module.exports = router;
