const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const sendOTP = require('../utils/sendOtp');
const mongoose = require('mongoose');


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

exports.registerUser = async (req, res) => {
  const { fullName, email, phone, address, password, lat, lon } = req.body;

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
  const { email, password } = req.body;
  const cleanEmail = email.trim().toLowerCase();
  try {
    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (!user.isVerified) return res.status(403).json({ message: "User not verified" });
    // Account lockout logic
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(403).json({ message: "Account is temporarily locked due to multiple failed login attempts. Try again later." });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000;
      }
      await user.save();
      return res.status(400).json({ message: "Incorrect password" });
    }
    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role }, "supersecret", { expiresIn: '7d' });
    res.status(200).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

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

// controllers/userController.js
exports.changePassword = async (req, res) => {
  const user = await User.findById(req.user.id);
  const { currentPassword, newPassword } = req.body;


  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ message: 'Password updated successfully' });
};

