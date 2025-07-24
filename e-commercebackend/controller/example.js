// const User = require('../models/user'); // Make sure the path is correct
// const bcrypt = require('bcrypt');
// const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
// const jwt = require('jsonwebtoken');
// require('dotenv').config();
// const speakeasy = require('speakeasy');
// const qrcode = require('qrcode');
// // Admin MFA setup endpoint
// exports.setupAdminMFA = async (req, res) => {
//   const { email } = req.body;
//   const admin = await User.findOne({ email: email.trim().toLowerCase(), role: 'admin' });
//   if (!admin) return res.status(404).json({ message: 'Admin not found' });
//   // Generate secret
//   const secret = speakeasy.generateSecret({ name: 'AnkaAttire Admin' });
//   if (!secret.otpauth_url) {
//     return res.status(500).json({ message: 'Failed to generate otpauth URL for QR code.' });
//   }
//   admin.mfaSecret = secret.base32;
//   await admin.save();
//   // Generate QR code
//   qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
//     if (err || !data_url) {
//       return res.status(500).json({ message: 'QR code generation failed. Please try again or contact support.' });
//     }
//     res.json({ qr: data_url, secret: secret.base32 });
//   });
// };

// exports.loginAdmin = async (req, res) => {
//   console.log('Admin login endpoint called');
//   const { email, password, mfaCode } = req.body;
//   if (!email || !password || !mfaCode) {
//     return res.status(400).json({ message: "Email, password, and MFA code are required." });
//   }

//   try {
//     const admin = await User.findOne({ email: email.trim().toLowerCase() });
//     if (!admin || admin.role !== 'admin') {
//       return res.status(401).json({ message: "Unauthorized. Not an admin." });
//     }
//     // Ensure fields exist
//     if (typeof admin.failedLoginAttempts !== 'number') admin.failedLoginAttempts = 0;
//     // Check for account lockout
//     if (admin.lockUntil && admin.lockUntil > Date.now()) {
//       return res.status(403).json({ message: "Account is temporarily locked due to multiple failed login attempts. Try again later." });
//     }
//     const isMatch = await bcrypt.compare(password, admin.password);
//     if (!isMatch) {
//       admin.failedLoginAttempts += 1;
//       if (admin.failedLoginAttempts >= 5) {
//         admin.lockUntil = Date.now() + 15 * 60 * 1000;
//       }
//       await admin.save();
//       return res.status(401).json({ message: "Invalid credentials." });
//     }
//     // MFA verification
//     if (!admin.mfaSecret) {
//       console.log('No MFA secret found for admin:', admin.email);
//       return res.status(403).json({ message: "MFA not set up for this admin." });
//     }
//     console.log('Verifying MFA code:', {
//       secret: admin.mfaSecret,
//       token: mfaCode,
//       time: new Date().toISOString(),
//       adminEmail: admin.email
//     });
//     const verified = speakeasy.totp.verify({
//       secret: admin.mfaSecret,
//       encoding: 'base32',
//       token: mfaCode,
//       window: 1 // Accept codes from previous/next time window for tolerance
//     });
//     if (!verified) {
//       console.log('MFA verification failed:', {
//         secret: admin.mfaSecret,
//         token: mfaCode,
//         time: new Date().toISOString(),
//         adminEmail: admin.email
//       });
//       return res.status(401).json({ message: "Invalid MFA code." });
//     }
//     // Reset failed attempts on successful login
//     admin.failedLoginAttempts = 0;
//     admin.lockUntil = undefined;
//     await admin.save();
//     const token = jwt.sign(
//       { userId: admin._id, role: 'admin' },
//       process.env.JWT_SECRET || "supersecret",
//       { expiresIn: '1d' }
//     );
//     res.status(200).json({
//       message: "Admin login successful",
//       token,
//       admin: { email: admin.email, role: admin.role }
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// }

// // User registration with password policy enforcement and hashing
// exports.registerUser = async (req, res) => {
//   const { fullName, email, phone, address, password } = req.body;
//   if (!fullName || !email || !phone || !password) {
//     return res.status(400).json({ message: "All fields are required." });
//   }
//   if (!PASSWORD_REGEX.test(password)) {
//     return res.status(400).json({ message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol." });
//   }
//   try {
//     const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
//     if (existingUser) {
//       return res.status(409).json({ message: "Email already registered." });
//     }
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = new User({
//       fullName,
//       email: email.trim().toLowerCase(),
//       phone,
//       address,
//       password: hashedPassword
//     });
//     await user.save();
//     res.status(201).json({ message: "User registered successfully." });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// // ...existing code...
// };