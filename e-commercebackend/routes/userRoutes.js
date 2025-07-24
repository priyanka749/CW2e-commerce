const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

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
  logoutUser
} = userController;

// ✅ Routes
router.post('/register', registerUser);
router.post('/verify-otp', verifyOTP);
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

// Place this AFTER /profile routes!
router.get('/:id', getUser);

router.post('/logout', logoutUser);
router.post('/forgot-password/send-otp', sendForgotPasswordOTP);
router.post('/forgot-password/verify-otp', verifyForgotPasswordOTP);
router.post('/forgot-password/reset', resetPassword);
// routes/userRoutes.js

router.put('/change-password', protect, changePassword);


module.exports = router;
