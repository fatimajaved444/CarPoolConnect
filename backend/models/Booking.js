const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  ride: { type: mongoose.Schema.Types.ObjectId, ref: "Ride" },
  seatsBooked: Number,
  date: { type: Date, default: Date.now },
  
  status: {
    type: String,
    enum: ["confirmed", "cancelled", "completed"],
    default: "confirmed"
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  pickupPoint: {
    name: String,
    lat: Number,
    lng: Number
  },
  dropPoint: {
    name: String,
    lat: Number,
    lng: Number
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "online"],
    default: "cash"
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending"
  },
  rating: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Booking", bookingSchema);