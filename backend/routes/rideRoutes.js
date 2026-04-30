const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const { createRide,searchRide } = require("../controllers/rideController");

router.post("/create", auth, createRide);
router.post("/search", searchRide);
module.exports = router;