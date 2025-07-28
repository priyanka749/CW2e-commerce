// Example: Audit logging for adding to cart
exports.addToCart = async (req, res) => {
  // ...existing logic to add item to cart...
  const userId = req.user._id || req.user.id || 'unknown';
  logAudit('ADD_TO_CART', userId, `Product: ${req.body.productId}, Quantity: ${req.body.quantity}`);
  res.status(200).json({ message: 'Item added to cart' });
};
// Example: Audit logging for payment
exports.makePayment = async (req, res) => {
  // ...existing logic to process payment...
  const userId = req.user._id || req.user.id || 'unknown';
  logAudit('PAYMENT', userId, `Amount: ${req.body.amount}, Method: ${req.body.method}`);
  res.status(200).json({ message: 'Payment successful' });
};
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const sendOTP = require('../utils/sendOtp');
const mongoose = require('mongoose');
const logAudit = require('../utils/auditLogger');
const Session = require('../models/session');


// // User Registration
// exports.registerUser = async (req, res) => {
//   const { fullName, email, phone, address, password } = req.body;

//   try {
//     const existing = await User.findOne({ email });
//     if (existing) return res.status(400).json({ message: 'User already exists' });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();

//     const user = new User({
//       fullName, email, phone, address,
//       password: hashedPassword,
//       otp,
//       role: 'user',
//       isVerified: false
//     });

//     await user.save();
//     await sendOTP(email, otp);

//     res.status(200).json({ message: 'OTP sent', userId: user._id });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


const { validationResult } = require('express-validator');
const axios = require('axios');

exports.registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array().map(e => e.msg).join(', ') });
  }

  const { fullName, email, phone, address, password, lat, lon, captchaToken } = req.body;

  // Verify reCAPTCHA
  if (!captchaToken) {
    return res.status(400).json({ message: 'Captcha token is required' });
  }
  try {
    const secretKey = '6Lc4iJIrAAAAAMGW_g390TyeNfYsc8mVXO8JRuqD';
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;
    const captchaRes = await axios.post(verifyUrl);
    if (!captchaRes.data.success) {
      return res.status(400).json({ message: 'Captcha verification failed' });
    }
  } catch (captchaErr) {
    return res.status(500).json({ message: 'Captcha verification error' });
  }

  // ...existing registration logic...

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = new User({
      fullName, email, phone, address,
      password: hashedPassword,
      otp,
      role: 'user',
      isVerified: false
    });

    await user.save();
// Save location if provided
    if (lat && lon && address) {
      await Location.create({
        userId: user._id,
        address,
        lat,
        lon
      });
    }

    await sendOTP(email, otp);

    res.status(200).json({ message: 'OTP sent', userId: user._id });
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: errors.join(", ") });
    }
    res.status(500).json({ message: err.message });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  const { userId, otp } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user || user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

    user.isVerified = true;
    user.otp = null;
    await user.save();

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// controllers/userController.js

exports.loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array().map(e => e.msg).join(', ') });
  }
  const { email, password } = req.body;
  const cleanEmail = email.trim().toLowerCase();
  try {
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      logAudit('LOGIN_FAILED', 'unknown', 'Reason: User not found');
      return res.status(400).json({ message: "User not found" });
    }
    if (!user.isVerified) {
      logAudit('LOGIN_FAILED', user._id, 'Reason: User not verified');
      return res.status(403).json({ message: "User not verified" });
    }
    // Account lockout logic
    if (user.lockUntil && user.lockUntil > Date.now()) {
      logAudit('LOGIN_FAILED', user._id, 'Reason: Account locked');
      return res.status(403).json({ message: "Account is temporarily locked due to multiple failed login attempts. Try again later." });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000;
      }
      await user.save();
      // Log failed login attempt
      logAudit('LOGIN_FAILED', user._id, 'Reason: Incorrect password');
      return res.status(400).json({ message: "Incorrect password" });
    }
    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();
    // Generate access and refresh tokens
    const accessToken = jwt.sign({ userId: user._id, role: user.role }, "supersecret", { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user._id, role: user.role }, "refreshsecret", { expiresIn: '7d' });
    // Set refresh token as HTTP-only cookie
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  maxAge: 7 * 24 * 60 * 60 * 1000
});
    req.session.userId = user._id; // Save user ID in session
    // Log successful login
    logAudit('LOGIN_SUCCESS', user._id);
    // Create session record
    const session = new Session({
      userId: user._id,
      sessionId: req.sessionID || accessToken,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      lastActive: new Date(),
      isValid: true
    });
    await session.save();
    res.status(200).json({ token: accessToken, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// List active sessions/devices for user
exports.listSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user._id, isValid: true })
      .sort({ lastActive: -1 })
      .limit(5); // Show up to 5 most recent devices
    res.status(200).json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Logout from all devices
exports.logoutAllDevices = async (req, res) => {
  try {
    await Session.updateMany({ userId: req.user._id }, { isValid: false });
    // Optionally destroy all server-side sessions if using session store
    logAudit('LOGOUT_ALL_DEVICES', req.user._id);
    res.status(200).json({ message: 'Logged out from all devices' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get User by ID (protected route)
const Location = require('../models/location');

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -otp');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const location = await Location.findOne({ userId: user._id });

    res.status(200).json({
      ...user._doc,
      location
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get All Users (admin route) - only users with role 'user'
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('fullName email phone address image role isVerified _id');
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// controllers/userController.js
exports.verifyForgotPasswordOTP = async (req, res) => {
  const { userId, otp } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user || user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    user.otp = null; // Clear OTP after verification
    await user.save();

    res.status(200).json({ message: "OTP verified" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// controllers/userController.js
exports.sendForgotPasswordOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    await user.save();

    await sendOTP(email, otp);
    res.status(200).json({ message: "OTP sent to email", userId: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// controllers/userController.js
exports.resetPassword = async (req, res) => {
  const { userId, newPassword } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};





// exports.updateProfile = async (req, res) => {
//   try {
//     // Only allow specific fields to be updated
//     const allowedUpdates = ['fullName', 'email', 'address', 'image', 'phone'];
//     const updates = {};
//     allowedUpdates.forEach(field => {
//       if (req.body[field] !== undefined) updates[field] = req.body[field];
//     });
//     if (req.file) {
//       updates.image = `/uploads/${req.file.filename}`;
//     }
//     // Support both _id and id
//     const userId = req.user._id || req.user.id;
//     const user = await User.findByIdAndUpdate(
//       userId,
//       updates,
//       { new: true, runValidators: true }
//     ).select('-password -otp');
//     res.status(200).json(user);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


exports.updateProfile = async (req, res) => {
  try {
    const allowedUpdates = ['fullName', 'email', 'address', 'image', 'phone'];
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }

    const userId = req.user._id || req.user.id;
    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password -otp');

    res.status(200).json(user);
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: errors.join(", ") });
    }
    res.status(500).json({ message: err.message });
  }
};


exports.changePassword = async (req, res) => {
  const user = await User.findById(req.user.id);
  const { currentPassword, newPassword } = req.body;

  // Check current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });


  const maxAge = 90 * 24 * 60 * 60 * 1000; // 90 days in ms
  if (user.passwordLastChanged && Date.now() - user.passwordLastChanged.getTime() < maxAge) {
    
  }

  // Check password reuse (last 5 passwords)
  let reused = false;
  if (user.passwordHistory && user.passwordHistory.length > 0) {
    for (const oldHash of user.passwordHistory) {
      if (await bcrypt.compare(newPassword, oldHash)) {
        reused = true;
        break;
      }
    }
  }
  if (reused) {
    return res.status(400).json({ message: 'Cannot reuse previous passwords.' });
  }

  // Hash new password
  const newHash = await bcrypt.hash(newPassword, 10);
  user.password = newHash;
  user.passwordLastChanged = Date.now();
  // Add to history, keep last 5
  user.passwordHistory = user.passwordHistory || [];
  user.passwordHistory.push(newHash);
  if (user.passwordHistory.length > 5) user.passwordHistory = user.passwordHistory.slice(-5);
  await user.save();
  // Log password change
  logAudit('PASSWORD_CHANGE', user._id);
  res.json({ message: 'Password updated successfully' });
};

// Logout User
exports.logoutUser = (req, res) => {
  const userId = req.session.userId || 'unknown';
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    logAudit('LOGOUT', userId);
    console.log('User logged out and session destroyed');
    res.status(200).json({ message: 'Logged out successfully' });
  });
};

// Middleware to check if session is valid (not expired)
exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: 'Session expired or not logged in' });
};

