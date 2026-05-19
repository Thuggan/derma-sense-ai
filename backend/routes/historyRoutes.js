const express = require('express');
const router = express.Router();
const { getUserHistory, saveUserHistory, getHistoryEntry, deleteHistoryEntry } = require('../controllers/historyController');
const authMiddleware = require('../middleware/authMiddleware'); // Ensure user is authenticated

// Fetch user history
router.get('/', authMiddleware, getUserHistory);
router.post('/', authMiddleware, saveUserHistory);
router.get('/:id', authMiddleware, getHistoryEntry);
router.delete('/:id', authMiddleware, deleteHistoryEntry);

module.exports = router;
