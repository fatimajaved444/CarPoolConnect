const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  ride: { type: mongoose.Schema.Types.ObjectId, ref: "Ride" },
  seatsBooked: Number,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Booking", bookingSchema);