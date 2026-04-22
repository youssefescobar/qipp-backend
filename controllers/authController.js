const AdminUser = require('../models/AdminUser');
const Employee = require('../models/Employee');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { email, password, name, empId, crew, role, accessRole } = req.body;
  
  if (!email || !password || !name || !empId || !crew || !role) {
    return res.status(400).json({ message: 'All personnel fields are required.' });
  }

  const existing = await AdminUser.findOne({ email });
  if (existing) return res.status(409).json({ message: 'Email already registered.' });

  const passwordHash = await bcrypt.hash(password, 10);
  
  const user = new AdminUser({ 
    email, 
    passwordHash, 
    name,
    empId,
    crew,
    role,
    accessRole: accessRole || 'viewer' 
  });
  
  await user.save();

  // Also ensure they exist in the Employee roster for Leave Planner
  const existingEmployee = await Employee.findOne({ empId });
  if (!existingEmployee) {
    const newEmployee = new Employee({
      name,
      empId,
      crew,
      role,
      leaves: []
    });
    await newEmployee.save();
  }

  res.status(201).json({ message: 'Personnel registered successfully.', role: user.accessRole });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await AdminUser.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials.' });
  
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials.' });
  
  const token = jwt.sign({ 
    id: user._id, 
    email: user.email,
    role: user.accessRole,
    name: user.name,
    empId: user.empId
  }, process.env.JWT_SECRET, { expiresIn: '1d' });
  
  res.json({ token, role: user.accessRole });
};

exports.verify = (req, res) => {
  res.json({ ok: true, user: req.user });
};
