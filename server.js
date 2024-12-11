const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const appointmentsRoutes = require('./routes/appointments');``
require('dotenv').config();


// Connect to MongoDB
connectDB();

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/appointments', appointmentsRoutes);

// New route for "Hello autodealersdigital"
app.get('/', (req, res) => {
  res.send('Hello autodealersdigital');
});

// Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
