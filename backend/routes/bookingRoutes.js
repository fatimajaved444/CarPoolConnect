const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const { bookRide, getMyBookings,cancelBooking } = require("../controllers/bookingController");

router.post("/book", auth, bookRide);
router.get("/my", auth, getMyBookings);
router.post("/cancel", auth, cancelBooking);
module.exports = router;