const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  vehicleType:   { type: String, default: "" },
  vehicleName:   { type: String, default: "" },
  vehicleColor:  { type: String, default: "" },
  vehicleNumber: { type: String, default: "" },

  pickup: { name: String, lat: Number, lng: Number },
  drop:   { name: String, lat: Number, lng: Number },

  seats:      Number,
  totalSeats: { type: Number, default: 0 },
  price:      Number,
  date:       String,

  startTime: { type: String, default: "" },
  endTime:   { type: String, default: "" },
  duration:  { type: String, default: "" },

  etaMins: { type: Number, default: null },

  status: {
    type: String,
    enum: ["active", "assigned", "in_progress", "completed", "cancelled"],
    default: "active"
  },

  assignedPassenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  driverStarted:    { type: Boolean, default: false },
  passengerStarted: { type: Boolean, default: false },

  driverCompleted:    { type: Boolean, default: false },
  passengerCompleted: { type: Boolean, default: false },

  passengers: [{
    user:      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    seats:     Number,
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    bookedAt:  { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model("Ride", rideSchema);
