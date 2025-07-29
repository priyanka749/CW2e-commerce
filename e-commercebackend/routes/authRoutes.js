const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const { protect, adminOnly } = require('../middleware/auth');
const AuditLog = require('../models/auditLog');

// Handle preflight OPTIONS for CORS (if needed)
router.options('/all-activity-logs', (req, res) => {
  res.set('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Authorization,Content-Type');
  res.set('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.status(200).end();
});

// Simple route to fetch all audit logs for admin dashboard
router.get('/all-activity-logs', protect, adminOnly, async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .sort({ timestamp: -1 })
      .populate('userId', 'fullName email role image');
    res.json({ success: true, logs: logs || [] });
  } catch (err) {
    console.error('Error fetching all activity logs:', err);
    res.status(500).json({ message: 'Failed to fetch all activity logs', error: err.message });
  }
});

// Admin MFA setup route - protected and admin only
router.post('/admin/setup-mfa',  authController.setupAdminMFA);

// Admin login route - public
router.post('/login', authController.loginAdmin);

// Admin logout route - protected and admin only
router.post('/admin/logout', authController.logoutAdmin);

// Middleware to check admin role here
// Fetch all activity logs with user profile info (name, email, role, image)
// Fetch all activity logs with user profile info (no limit)
// Paginated activity log route for admin
// Paginated activity log route for admin (secured)
router.get('/activity-log', protect, adminOnly, async (req, res) => {
  try {
    if (!AuditLog) {
      throw new Error('AuditLog model not found');
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;
    const logs = await AuditLog.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'fullName email role image');
    const total = await AuditLog.countDocuments();
    res.json({ total, page, logs });
  } catch (err) {
    console.error('Error fetching activity logs:', err);
    res.status(500).json({ message: 'Failed to fetch activity logs', error: err.message });
  }
});

module.exports = router;
