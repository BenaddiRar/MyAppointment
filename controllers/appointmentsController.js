const fs = require("fs");
const path = require("path");
const moment = require("moment");

// Chemin du fichier JSON
const appointmentsFile = path.join(__dirname, "../data.json");

// Charge les rendez-vous depuis le fichier JSON
const loadAppointments = () => {
  try {
    if (!fs.existsSync(appointmentsFile)) {
      // Crée un fichier vide s'il n'existe pas
      fs.writeFileSync(appointmentsFile, JSON.stringify([]));
    }
    const data = fs.readFileSync(appointmentsFile, "utf-8");
    return data.trim() ? JSON.parse(data) : []; // Retourne un tableau vide si le fichier est vide
  } catch (error) {
    console.error(`Error loading appointments: ${error.message}`);
    throw new Error("Could not load appointments.");
  }
};

// Sauvegarde les rendez-vous dans le fichier JSON
const saveAppointments = (appointments) => {
  try {
    fs.writeFileSync(appointmentsFile, JSON.stringify(appointments, null, 2));
  } catch (error) {
    console.error(`Error saving appointments: ${error.message}`);
    throw new Error("Could not save appointments.");
  }
};

// Vérifie si une heure est dans une plage autorisée
const isWithinAllowedTime = (time) => {
  const start = moment("08:00 AM", "h:mm A");
  const end = moment("06:00 PM", "h:mm A");
  return moment(time, "h:mm A").isBetween(start, end, null, "[]");
};

// Vérifie si une heure est pendant la pause déjeuner
const isLunchBreak = (time) => {
  const start = moment("12:00 PM", "h:mm A");
  const end = moment("02:00 PM", "h:mm A");
  return moment(time, "h:mm A").isBetween(start, end, null, "[]");
};

// Vérifie si un créneau est disponible
const isTimeSlotAvailable = (appointments, date, time) => {
  return !appointments.some((appt) => appt.date === date && appt.time === time);
};

// GET /appointments
const getAppointments = (req, res) => {
  try {
    const appointments = loadAppointments();
    res.status(200).json({ appointments });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving appointments.", error });
  }
};

// POST /appointments
const createAppointment = (req, res) => {
  const { title, date, time } = req.body;

  if (!title || !date || !time) {
    return res.status(400).json({ message: "Title, date, and time are required." });
  }

  const currentDate = moment().format("YYYY-MM-DD");
  const currentTime = moment().add(2, "hours").format("h:mm A");

  if (!moment(date, "YYYY-MM-DD", true).isValid()) {
    return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." });
  }

  if (!moment(time, "h:mm A", true).isValid()) {
    return res.status(400).json({ message: "Invalid time format. Use h:mm A." });
  }

  if (!isWithinAllowedTime(time)) {
    return res.status(400).json({ message: "Time must be between 8 AM and 6 PM." });
  }

  if (isLunchBreak(time)) {
    return res.status(400).json({ message: "Time falls within lunch break (12 PM - 2 PM)." });
  }

  if (
    date === currentDate &&
    moment(time, "h:mm A").isBefore(moment(currentTime, "h:mm A"))
  ) {
    return res.status(400).json({ message: "Time must be at least 2 hours from now." });
  }

  const appointments = loadAppointments();

  if (!isTimeSlotAvailable(appointments, date, time)) {
    return res.status(400).json({ message: "Time slot is already taken." });
  }

  const newAppointment = {
    id: Date.now(),
    title,
    date,
    time,
    createdAt: moment().toISOString(),
  };

  appointments.push(newAppointment);
  saveAppointments(appointments);

  res.status(201).json({
    message: "Appointment created successfully.",
    newAppointment,
  });
};

// PUT /appointments/:id
const updateAppointment = (req, res) => {
  const { id } = req.params;
  const { title, date, time } = req.body;

  const appointments = loadAppointments();
  const appointmentIndex = appointments.findIndex(
    (appt) => appt.id === parseInt(id, 10)
  );

  if (appointmentIndex === -1) {
    return res.status(404).json({ message: "Appointment not found." });
  }

  if (date && !moment(date, "YYYY-MM-DD", true).isValid()) {
    return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." });
  }

  if (time && !moment(time, "h:mm A", true).isValid()) {
    return res.status(400).json({ message: "Invalid time format. Use h:mm A." });
  }

  const updatedAppointment = {
    ...appointments[appointmentIndex],
    title: title || appointments[appointmentIndex].title,
    date: date || appointments[appointmentIndex].date,
    time: time || appointments[appointmentIndex].time,
    updatedAt: moment().toISOString(),
  };

  appointments[appointmentIndex] = updatedAppointment;
  saveAppointments(appointments);

  res.status(200).json({
    message: "Appointment updated successfully.",
    updatedAppointment,
  });
};

// DELETE /appointments/:id
const deleteAppointment = (req, res) => {
  const { id } = req.params;

  const appointments = loadAppointments();
  const filteredAppointments = appointments.filter(
    (appt) => appt.id !== parseInt(id, 10)
  );

  if (appointments.length === filteredAppointments.length) {
    return res.status(404).json({ message: "Appointment not found." });
  }

  saveAppointments(filteredAppointments);

  res.status(200).json({ message: "Appointment deleted successfully." });
};

module.exports = {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};
