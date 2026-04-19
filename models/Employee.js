const mongoose = require('mongoose');

const LeaveSchema = new mongoose.Schema({
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  type: { type: String, enum: ['Applied on SAP', 'Planned'], default: 'Planned' }
});

const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  empId: { type: String, required: true, unique: true },
  crew: { type: String, required: true },
  role: { type: String, required: true },
  color: { type: String },
  leaves: [LeaveSchema]
}, { timestamps: true });

module.exports = mongoose.model('Employee', EmployeeSchema);
