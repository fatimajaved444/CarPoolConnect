const Ride = require("../models/Ride");

// CREATE RIDE
exports.createRide = async (req, res) => {
  try {
    const ride = await Ride.create({
      driver: req.user.id,
      ...req.body
    });

    res.json(ride);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.searchRide = async (req, res) => {
  const { pickup, drop } = req.body;

  try {
    const rides = await Ride.find();

    const matched = rides.filter(ride => {
      const pickupMatch =
        Math.abs(ride.pickup.lat - pickup.lat) < 0.05 &&
        Math.abs(ride.pickup.lng - pickup.lng) < 0.05;

      const dropMatch =
        Math.abs(ride.drop.lat - drop.lat) < 0.05 &&
        Math.abs(ride.drop.lng - drop.lng) < 0.05;

      return pickupMatch && dropMatch;
    });

    res.json(matched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};