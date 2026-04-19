require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Models
const Employee = require('./models/Employee');
const PlantPerformance = require('./models/PlantPerformance');

// Request logging middleware
const requestLogger = (req, res, next) => {
  const shortReq = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    query: req.query,
    params: req.params,
    body: req.body,
    headers: {
      host: req.headers.host,
      origin: req.headers.origin,
      'user-agent': req.headers['user-agent'],
      accept: req.headers.accept,
    },
  };

  console.log(`➡️ [${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log(JSON.stringify(shortReq, null, 2));
  next();
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- API ROUTES ---

// 1. Roster Routes
app.get('/api/roster', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ crew: 1, role: 1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/roster/leave', async (req, res) => {
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
});

// 2. KPI Routes
app.get('/api/kpis', async (req, res) => {
  const { days } = req.query;
  try {
    let query = PlantPerformance.find().sort({ date: 1 });
    if (days && days !== '0') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - parseInt(days));
      query = query.where('date').gte(cutoff);
    }
    const data = await query.exec();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Initial Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend Server running on http://localhost:${PORT}`);
});
