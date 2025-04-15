const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',  // Linking the schedule to the patient
    required: true,
  },
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],  // Limiting the days to weekdays
  },
  time: {
    type: String,
    required: true,
    enum: ['Morning', 'Afternoon', 'Evening'],  // Limiting the time slots
  },
  notes: {
    type: String,
  },
}, { timestamps: true });

const Schedule = mongoose.model('Schedule', ScheduleSchema);

module.exports = Schedule;
