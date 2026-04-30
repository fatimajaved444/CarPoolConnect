const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  pickup: {
    name: String,
    lat: Number,
    lng: Number
  },

  drop: {
    name: String,
    lat: Number,
    lng: Number
  },

  seats: Number,
  price: Number,
  date: String
});

module.exports = mongoose.model("Ride", rideSchema);