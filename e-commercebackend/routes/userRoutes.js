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
  updateProfile,
  sendForgotPasswordOTP,
  verifyForgotPasswordOTP,
  resetPassword,
  changePassword
} = userController;

// ✅ Routes
router.post('/register', registerUser);
router.post('/verify-otp', verifyOTP);
router.post('/login', loginUser);
router.get('/:id', getUser);

router.post('/forgot-password/send-otp', sendForgotPasswordOTP);
router.post('/forgot-password/verify-otp', verifyForgotPasswordOTP);
router.post('/forgot-password/reset', resetPassword);
// routes/userRoutes.js

router.put('/change-password', protect, changePassword);


// ✅ Update profile (with image upload)
router.put(
  '/profile',
  protect,
  upload.single('image'),
  updateProfile
);

module.exports = router;
