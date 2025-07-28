const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const { protect, adminOnly } = require('../middleware/auth');
const AuditLog = require('../models/auditLog');

// Admin MFA setup route - protected and admin only
router.post('/admin/setup-mfa',  authController.setupAdminMFA);

// Admin login route - public
router.post('/login', authController.loginAdmin);

// Admin logout route - protected and admin only
router.post('/admin/logout', authController.logoutAdmin);

// Middleware to check admin role here
// Fetch all activity logs with user profile info (name, email, role, image)
router.get('/activity-log', async (req, res) => {
  const logs = await AuditLog.find()
    .sort({ timestamp: -1 })
    .limit(100)
    .populate('userId', 'fullName email role image'); // Add image field
  res.json(logs);
});

module.exports = router;
