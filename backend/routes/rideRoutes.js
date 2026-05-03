const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
  createRide,
  getAvailableRides,
  getMyRides,
  searchRide,
  updateRide,
  cancelRide,
  completeRide,
  startRide
} = require("../controllers/rideController");

router.post("/create", auth, createRide);
router.get("/available", auth, getAvailableRides);
router.get("/my-rides", auth, getMyRides);
router.post("/search", auth, searchRide);
router.put("/start/:rideId", auth, startRide);
router.put("/complete/:rideId", auth, completeRide);
router.put("/:rideId", auth, updateRide);
router.delete("/:rideId", auth, cancelRide);

module.exports = router;