const moment = require("moment");
const Appointment = require("../models/Appointment");

// Helper: Vérifie si une heure est dans une plage autorisée
const isWithinAllowedTime = (time) => {
  const start = moment("08:00 AM", "h:mm A");
  const end = moment("06:00 PM", "h:mm A");
  return moment(time, "h:mm A").isBetween(start, end, null, "[]");
};

// Helper: Vérifie si une heure est pendant la pause déjeuner
const isLunchBreak = (time) => {
  const start = moment("12:00 PM", "h:mm A");
  const end = moment("02:00 PM", "h:mm A");
  return moment(time, "h:mm A").isBetween(start, end, null, "[]");
};

// Helper: Vérifie si un créneau est disponible
const isTimeSlotAvailable = async (date, time) => {
  const appointment = await Appointment.findOne({ date, time });
  return !appointment;
};

// GET /appointments
const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ date: 1, time: 1 });
    res.status(200).json({ appointments });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving appointments.", error });
  }
};

// POST /appointments
const createAppointment = async (req, res) => {
  const { title, date, time } = req.body;

  // Valide les champs requis
  if (!title || !date || !time) {
    return res
      .status(400)
      .json({ message: "Title, date, and time are required." });
  }

  const currentDate = moment().format("YYYY-MM-DD");
  const currentTime = moment().add(2, "hours").format("h:mm A");

  // Vérifie si l'heure est dans la plage autorisée
  if (!isWithinAllowedTime(time)) {
    return res
      .status(400)
      .json({ message: "Time must be between 8 AM and 6 PM." });
  }

  // Vérifie si l'heure est pendant la pause déjeuner
  if (isLunchBreak(time)) {
    return res
      .status(400)
      .json({ message: "Time falls within lunch break (12 PM - 2 PM)." });
  }

  // Vérifie la règle des 2 heures si la date est aujourd'hui
  if (
    date === currentDate &&
    moment(time, "h:mm A").isBefore(moment(currentTime, "h:mm A"))
  ) {
    return res
      .status(400)
      .json({ message: "Time must be at least 2 hours from now." });
  }

  // Vérifie si le créneau est disponible
  if (!(await isTimeSlotAvailable(date, time))) {
    return res.status(400).json({ message: "Time slot is already taken." });
  }

  try {
    const newAppointment = await Appointment.create({ title, date, time });
    res
      .status(201)
      .json({ message: "Appointment created successfully.", newAppointment });
  } catch (error) {
    res.status(500).json({ message: "Error creating appointment.", error });
  }
};

// PUT /appointments/:id
const updateAppointment = async (req, res) => {
  const { id } = req.params;
  const { title, date, time } = req.body;

  try {
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { title, date, time },
      { new: true, runValidators: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    res
      .status(200)
      .json({
        message: "Appointment updated successfully.",
        updatedAppointment,
      });
  } catch (error) {
    res.status(500).json({ message: "Error updating appointment.", error });
  }
};

// DELETE /appointments/:id
const deleteAppointment = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedAppointment = await Appointment.findByIdAndDelete(id);

    if (!deletedAppointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    res
      .status(200)
      .json({
        message: "Appointment deleted successfully.",
        deletedAppointment,
      });
  } catch (error) {
    res.status(500).json({ message: "Error deleting appointment.", error });
  }
};

module.exports = {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};
