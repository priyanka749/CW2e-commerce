const AuditLog = require('../models/auditLog');
const mongoose = require('mongoose');

async function logAudit(action, userId, details = '') {
  let log = { action, details, timestamp: new Date() };
  if (mongoose.Types.ObjectId.isValid(userId)) {
    log.userId = userId;
  }
  await AuditLog.create(log);
}

module.exports = logAudit;