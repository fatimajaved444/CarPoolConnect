const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: { type: String, default: "" },
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 }
});

module.exports = mongoose.model("User", userSchema);