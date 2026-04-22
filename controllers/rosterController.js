const Employee = require('../models/Employee');
const AdminUser = require('../models/AdminUser');

exports.getRoster = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ crew: 1, role: 1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addLeave = async (req, res) => {
  const { employeeId, leave } = req.body;
  try {
    const employee = await Employee.findOne({ empId: employeeId });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    employee.leaves.push(leave);
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOneAndUpdate(
      { empId: req.params.empId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const empId = req.params.empId;
    
    // 1. Delete from Roster (Employee Model)
    const employee = await Employee.findOneAndDelete({ empId });
    
    // 2. Delete associated system account (AdminUser Model)
    // We match by the empId which is now part of the user model
    await AdminUser.findOneAndDelete({ empId });

    if (!employee) return res.status(404).json({ message: 'Personnel not found' });
    
    res.json({ message: 'Personnel and associated account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeLeave = async (req, res) => {
  const { employeeId, leaveId } = req.params;
  try {
    const employee = await Employee.findOne({ empId: employeeId });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    
    employee.leaves = employee.leaves.filter(l => l._id.toString() !== leaveId);
    await employee.save();
    res.json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
