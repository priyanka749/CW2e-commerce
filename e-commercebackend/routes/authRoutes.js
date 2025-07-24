const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');


// Admin MFA setup route
router.post('/admin/setup-mfa', authController.setupAdminMFA);

// Admin login route
router.post('/login', authController.loginAdmin);

module.exports = router;
