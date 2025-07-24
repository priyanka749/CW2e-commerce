const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const { protect, adminOnly } = require('../middleware/auth');

// Admin MFA setup route - protected and admin only
router.post('/admin/setup-mfa',  authController.setupAdminMFA);

// Admin login route - public
router.post('/login', authController.loginAdmin);

// Admin logout route - protected and admin only
router.post('/admin/logout', authController.logoutAdmin);

module.exports = router;
