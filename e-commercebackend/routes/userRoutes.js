const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const upload = require('../middleware/upload');
const { protect, refreshToken } = require('../middleware/auth');
const { body } = require('express-validator');

// ✅ Destructure functions from controller
const {
  registerUser,
  verifyOTP,
  loginUser,
  getUser,
  getAllUsers,
  updateProfile,
  sendForgotPasswordOTP,
  verifyForgotPasswordOTP,
  resetPassword,
  changePassword,
  logoutUser,
  listSessions,
  logoutAllDevices
} = userController;

// ✅ Routes
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('fullName').isString().trim().notEmpty(),
    // Add more validators as needed
  ],
  registerUser
);
router.post('/verify-otp', verifyOTP);
// Do NOT protect login route
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isString().notEmpty(),
  ],
  loginUser
);
router.get('/all', protect, getAllUsers); // Get all users (protected admin route)

// ✅ Update profile (with image upload)

// Update profile (with image upload and validation)
router.put(
  '/profile',
  protect,
  upload.single('image'),
  [
    body('fullName').optional().isString().trim().escape(),
    body('email').optional().isEmail().normalizeEmail(),
    body('address').optional().isString().trim().escape(),
    body('phone').optional().isString().trim().escape(),
    // Add more validators as needed
  ],
  updateProfile
);

// ✅ Get logged-in user's profile
router.get('/profile', protect, (req, res) => {
  res.json({ user: req.user });
});

// List active sessions/devices
router.get('/sessions', protect, listSessions);

// Logout from all devices
router.post('/logout-all', protect, logoutAllDevices);


// Get user by ID with validation (NoSQL injection protection)
const { param } = require('express-validator');
router.get('/:id', [param('id').isMongoId()], getUser);

router.post('/logout', logoutUser);
router.post('/forgot-password/send-otp', sendForgotPasswordOTP);
router.post('/forgot-password/verify-otp', verifyForgotPasswordOTP);
router.post('/forgot-password/reset', resetPassword);
// routes/userRoutes.js


// Refresh token endpoint (public, not protected)
router.post('/refresh-token', refreshToken);

router.put('/change-password', protect, changePassword);

module.exports = router;
