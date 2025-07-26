const mongoose = require('mongoose');
const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionId: String,
  userAgent: String,
  ip: String,
  createdAt: { type: Date, default: Date.now },
  lastActive: Date,
  isValid: { type: Boolean, default: true }
});
module.exports = mongoose.model('Session', sessionSchema);
