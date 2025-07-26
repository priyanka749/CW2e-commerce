const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const upload = require('../middleware/upload');
const { protect, refreshToken } = require('../middleware/auth');

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
router.post('/register', registerUser);
router.post('/verify-otp', verifyOTP);
// Do NOT protect login route
router.post('/login', loginUser);
router.get('/all', protect, getAllUsers); // Get all users (protected admin route)

// ✅ Update profile (with image upload)
router.put(
  '/profile',
  protect,
  upload.single('image'),
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

// Place this AFTER /sessions and /logout-all!
router.get('/:id', getUser);

router.post('/logout', logoutUser);
router.post('/forgot-password/send-otp', sendForgotPasswordOTP);
router.post('/forgot-password/verify-otp', verifyForgotPasswordOTP);
router.post('/forgot-password/reset', resetPassword);
// routes/userRoutes.js


// Refresh token endpoint (public, not protected)
router.post('/refresh-token', refreshToken);

router.put('/change-password', protect, changePassword);

module.exports = router;
