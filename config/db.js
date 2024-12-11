const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.URI_MONGODB);
  } catch (err) {
    console.error(`Error: ${err.message} at ${new Date().toLocaleString()}`);
    process.exit(1);
  }
};

module.exports = connectDB;
