const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule'); // Adjust path if necessary
const Patient = require('../models/Patient'); // Required for validation

// ✅ POST /api/schedules - Create schedule with validation
router.post('/', async (req, res) => {
  try {
    const { patientId, day, time, notes } = req.body;

    // Validate required fields
    if (!patientId || !day || !time) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID, day, and time are required'
      });
    }

    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const newSchedule = new Schedule({
      patientId,
      day,
      time,
      notes: notes || ''
    });

    await newSchedule.save();
    res.status(201).json({
      success: true,
      data: newSchedule
    });
    
  } catch (err) {
    console.error('Error creating schedule:', err);

    // More specific error messages
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: err.errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// GET /api/schedules - Fetch all or filtered by patientId
router.get('/', async (req, res) => {
  try {
    const { patientId } = req.query;
    const schedules = patientId
      ? await Schedule.find({ patientId })
      : await Schedule.find();
    res.json(schedules);
  } catch (err) {
    console.error('Error fetching schedules:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/schedules/:id - Get specific schedule
router.get('/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }
    res.json(schedule);
  } catch (err) {
    console.error('Error fetching schedule:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/schedules/:id - Edit schedule
router.put('/:id', async (req, res) => {
  try {
    const { patientId, day, time, notes } = req.body;
    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      { patientId, day, time, notes },
      { new: true }
    );
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }
    res.json(schedule);
  } catch (err) {
    console.error('Error updating schedule:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/schedules/:id - Delete schedule
router.delete('/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }
    res.json({ success: true, message: 'Schedule deleted successfully' });
  } catch (err) {
    console.error('Error deleting schedule:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
