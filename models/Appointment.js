const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
}, {
  timestamps: true, // Ajoute createdAt et updatedAt automatiquement
});

module.exports = mongoose.model('Appointment', appointmentSchema);
