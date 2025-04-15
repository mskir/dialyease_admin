const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',  // Linking the schedule to the patient
    required: true,
  },
  day: {
    type: Date,
    required: true,
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