// utils/auditLogger.js
const fs = require('fs');
const path = require('path');

function logAudit(event, userId, details = '') {
  const logLine = `[${new Date().toISOString()}] [${event}] User: ${userId} ${details}\n`;
  fs.appendFileSync(path.join(__dirname, '../logs/audit.log'), logLine);
}

module.exports = logAudit;