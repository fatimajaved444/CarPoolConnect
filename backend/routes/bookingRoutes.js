const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const { 
  bookRide, 
  getMyBookings, 
  cancelBooking,
  getRideBookings,
  rateBooking
} = require("../controllers/bookingController");

router.post("/book", auth, bookRide);
router.get("/my", auth, getMyBookings);
router.post("/cancel", auth, cancelBooking);
router.get("/ride/:rideId", auth, getRideBookings);
router.post("/rate/:bookingId", auth, rateBooking);

module.exports = router;