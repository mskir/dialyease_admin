require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

//Import models
const Patient = require('./models/Patient');
const Admin = require('./models/Admin');
const Schedule = require('./models/Schedule')

// Initialize Express app
const app = express();

const scheduleRoutes = require('./routes/scheduleRoutes');

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Your React app's URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json()); // Parse JSON request bodies

app.use('/api/schedules', scheduleRoutes);

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://trustcapstonegroup:aiB1Yi1zEYoApS2L@cluster0.xo1g1st.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Patient Login Endpoint
const loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if patient exists
    const patient = await Patient.findOne({ email });
    if (!patient || !(await bcrypt.compare(password, patient.password))) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: patient._id }, process.env.JWT_SECRET || 'your_jwt_secret', {
      expiresIn: '30d'
    });

    const patientData = patient.toObject();
    delete patientData.password;

    res.json({
      patient: patientData,
      token
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin Login Endpoint
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }

    const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '30d' });

    res.json({ 
      admin: { email: admin.email }, 
      token 
    });

  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Patient Registration Endpoint
app.post('/api/patients/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, address, password } = req.body;

    if (!firstName || !lastName || !email || !phone || !address || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({ message: 'Patient already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const patient = await Patient.create({
      firstName,
      lastName,
      email,
      phone,
      address,
      password: hashedPassword
    });

    const token = jwt.sign({ id: patient._id }, process.env.JWT_SECRET || 'your_jwt_secret', {
      expiresIn: '30d'
    });

    const patientData = patient.toObject();
    delete patientData.password;

    res.status(201).json({
      patient: patientData,
      token
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login Route
app.post('/api/patients/login', loginPatient);

// Fetch all patients (Add this route)
app.get('/api/patients', async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ message: 'Error fetching patients' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
