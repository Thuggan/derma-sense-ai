const express = require('express');
const router = express.Router();
const { getFAQs, addFAQ, deleteFAQ } = require('../controllers/faqController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.route('/')
  .get(getFAQs)
  .post(authMiddleware, adminMiddleware, addFAQ);

router.route('/:id')
  .delete(authMiddleware, adminMiddleware, deleteFAQ);

module.exports = router;
