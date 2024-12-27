const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true, // "Close Month" or "Close Year"
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    details: {
      type: String, // Any additional details like success/failure messages
      default: '',
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt timestamps
);

const AuditLog = mongoose.model('AuditLog', AuditLogSchema);

module.exports = AuditLog;