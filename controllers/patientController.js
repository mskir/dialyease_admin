const Patient = require('../models/Patient');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const registerPatient = async (req, res) => {
    try {
      const { firstName, lastName, email, phone, address, password } = req.body;
  
      // Validation
      if (!firstName || !lastName || !email || !phone || !address || !password) {
        return res.status(400).json({ message: 'All fields are required' });
      }
  
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
  
      const patientExists = await Patient.findOne({ email });
      if (patientExists) {
        return res.status(400).json({ message: 'Patient already exists' });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const patient = await Patient.create({ 
        firstName, lastName, email, phone, address, 
        password: hashedPassword 
      });
  
      res.status(201).json({
        patient: {
          _id: patient._id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          email: patient.email,
          phone: patient.phone,
          address: patient.address
        },
        token: generateToken(patient._id)
      });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ 
        message: err.message || 'Server error occurred' 
      });
    }
  };

const loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const patient = await Patient.findOne({ email });
    
    if (patient && (await patient.comparePassword(password))) {
      res.json({
        _id: patient._id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        token: generateToken(patient._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

module.exports = {
  registerPatient,
  loginPatient
};