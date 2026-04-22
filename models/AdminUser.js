const mongoose = require('mongoose');

const AdminUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  empId: { type: String, required: true },
  crew: { type: String, required: true, enum: ['A', 'B', 'C', 'D', 'General', 'S'] },
  role: { type: String, required: true },
  accessRole: { type: String, enum: ['admin', 'viewer'], default: 'viewer' }
}, { timestamps: true });

module.exports = mongoose.model('AdminUser', AdminUserSchema);
