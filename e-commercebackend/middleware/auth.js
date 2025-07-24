const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Make sure the path is correct
require('dotenv').config();

// Protect middleware: checks for valid token and attaches user to req
// exports.protect = async (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ message: "Not authorized, token missing." });
//   }

//   try {
//     const token = authHeader.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const user = await User.findById(decoded.userId).select('-password');
//     if (!user) return res.status(401).json({ message: "User not found." });

//     req.user = user;
//     next();
//   } catch (error) {
//     return res.status(401).json({ message: "Invalid or expired token." });
//   }
// };

exports.protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, token missing." });
   }

  try {
    const token = authHeader.split(" ")[1];
    console.log('Token:', token);
    const decoded = jwt.verify(token, "supersecret"); // hardcoded match

    const userId = decoded.id || decoded.userId || decoded._id;
    if (!userId) return res.status(401).json({ message: "Invalid token payload." });

    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(401).json({ message: "User not found." });

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT verification error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};
// Admin only middleware: allows only admin users
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admins only." });
  }
};