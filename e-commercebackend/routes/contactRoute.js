const express = require('express');
const router = express.Router();
const contactController = require('../controller/contactController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/contact/all', protect, adminOnly, contactController.getAllMessages);
router.get('/contact', protect, contactController.getUserMessages);
router.post('/contact', contactController.submitContactForm);

module.exports = router;