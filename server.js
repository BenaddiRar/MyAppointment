const express = require('express');
const bodyParser = require('body-parser');
const appointmentsRoutes = require('./routes/appointments');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/appointments', appointmentsRoutes);

// Nouvelle route pour "Hello autodealersdigital"
app.get('/', (req, res) => {
  res.send('Hello autodealersdigital');
});

// Serveur
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
