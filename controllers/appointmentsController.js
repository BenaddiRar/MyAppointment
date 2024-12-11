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

  res.status(201).json({ message: "Appointment created successfully." });
};

// PUT /appointments/:id
// PUT /appointments/:id
const updateAppointment = (req, res) => {
    const { id } = req.params;
    const { title, date, time } = req.body;
  
    // Vérifie que le titre, la date et l'heure sont fournis
    if (!title || !date || !time) {
      return res.status(400).json({ message: "Title, date, and time are required." });
    }
  
    // Vérifie si le format de la date est valide
    if (!moment(date, "YYYY-MM-DD", true).isValid()) {
      return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." });
    }
  
    // Vérifie si le format de l'heure est valide
    if (!moment(time, "h:mm A", true).isValid()) {
      return res.status(400).json({ message: "Invalid time format. Use h:mm A." });
    }
  
    // Vérifie que l'heure est dans la plage horaire autorisée
    if (!isWithinAllowedTime(time)) {
      return res.status(400).json({ message: "Time must be between 8 AM and 6 PM." });
    }
  
    // Vérifie si l'heure tombe pendant la pause déjeuner
    if (isLunchBreak(time)) {
      return res.status(400).json({ message: "Time falls within lunch break (12 PM - 2 PM)." });
    }
  
    // Charge les rendez-vous existants
    const appointments = loadAppointments();
    // console.log("appointments",appointments)
    console.log("appointmentIndex",id)
  
    // Vérifie si le rendez-vous existe
    const appointmentIndex = appointments.findIndex((appt) => appt.id == id);
    console.log("appointmentIndex",appointmentIndex)
    if (appointmentIndex === -1) {
      return res.status(404).json({ message: "Appointment not found." });
    }
  
    // Vérifie si le créneau horaire est déjà pris (si la date ou l'heure sont modifiées)
    const existingAppointment = appointments[appointmentIndex];
    if (existingAppointment.date !== date || existingAppointment.time !== time) {
      if (!isTimeSlotAvailable(appointments, date, time)) {
        return res.status(400).json({ message: "Time slot is already taken." });
      }
    }
  
    // Si toutes les vérifications sont passées, répondre avec un succès
    res.status(200).json({ message: "Appointment updated successfully." });
  };
  

// DELETE /appointments/:id
const deleteAppointment = (req, res) => {
  const { id } = req.params;

  res.status(200).json({ message: "Appointment deleted successfully." });
};

module.exports = {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};
