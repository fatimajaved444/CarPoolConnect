const Ride    = require("../models/Ride");
const Booking = require("../models/Booking");

function calculateDuration(startTime, endTime) {
  if (!startTime || !endTime) return "";
  const start = new Date(`2000-01-01 ${startTime}`);
  const end   = new Date(`2000-01-01 ${endTime}`);
  const diffHours = (end - start) / (1000 * 60 * 60);
  return `${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
}

exports.createRide = async (req, res) => {
  try {
    const {
      pickup, drop, seats, price, date,
      startTime, endTime,
      vehicleType, vehicleName, vehicleColor, vehicleNumber,
      etaMins
    } = req.body;

    const ride = await Ride.create({
      driver:       req.user.id,
      pickup,
      drop,
      seats:        Number(seats),
      totalSeats:   Number(seats),
      price:        Number(price),
      date,
      startTime:    startTime  || "",
      endTime:      endTime    || "",
      duration:     calculateDuration(startTime, endTime),
      vehicleType:  vehicleType  || "",
      vehicleName:  vehicleName  || "",
      vehicleColor: vehicleColor || "",
      vehicleNumber: vehicleNumber ? vehicleNumber.toUpperCase() : "",
      etaMins:      etaMins || null,
      status:       "active",
      passengers:   []
    });

    res.status(201).json(ride);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getAvailableRides = async (req, res) => {
  try {
    const rides = await Ride.find({
      driver: { $ne: req.user.id },
      seats:  { $gt: 0 },
      status: "active"          
    })
      .populate("driver", "name email phone")
      .sort({ date: 1 });

    res.json(rides);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.searchRide = async (req, res) => {
  const { pickup, drop } = req.body;
  try {
    const rides = await Ride.find({
      driver: { $ne: req.user.id },
      seats:  { $gt: 0 },
      status: "active"          
    }).populate("driver", "name email phone");

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

exports.getMyRides = async (req, res) => {
  try {
    const rides = await Ride.find({ driver: req.user.id })
      .populate("passengers.user", "name email phone")
      .sort({ createdAt: -1 });
    res.json(rides);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const {
      pickup, drop, seats, price, date,
      startTime, endTime, etaMins,
      vehicleType, vehicleName, vehicleColor, vehicleNumber
    } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ error: "Ride not found" });
    if (ride.driver.toString() !== req.user.id)
      return res.status(403).json({ error: "Not authorized" });

    if (pickup) ride.pickup = pickup;
    if (drop)   ride.drop   = drop;
    if (seats) {
      const diff = Number(seats) - ride.totalSeats;
      ride.seats      += diff;
      ride.totalSeats  = Number(seats);
    }
    if (price)      ride.price      = Number(price);
    if (date)       ride.date       = date;
    if (startTime)  ride.startTime  = startTime;
    if (endTime)    ride.endTime    = endTime;
    if (startTime || endTime)
      ride.duration = calculateDuration(ride.startTime, ride.endTime);
    if (etaMins !== undefined) ride.etaMins = etaMins || null;
    if (vehicleType)   ride.vehicleType   = vehicleType;
    if (vehicleName)   ride.vehicleName   = vehicleName;
    if (vehicleColor)  ride.vehicleColor  = vehicleColor;
    if (vehicleNumber) ride.vehicleNumber = vehicleNumber.toUpperCase();

    await ride.save();
    res.json(ride);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.cancelRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ error: "Ride not found" });
    if (ride.driver.toString() !== req.user.id)
      return res.status(403).json({ error: "Not authorized" });

    await Booking.updateMany({ ride: rideId }, { status: "cancelled" });
    ride.status = "cancelled";
    await ride.save();

    res.json({ message: "Ride cancelled successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.startRide = async (req, res) => {
  try {
    const { rideId } = req.params;

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ error: "Ride not found" });

    const isDriver = ride.driver.toString() === req.user.id;
    if (!isDriver)
      return res.status(403).json({ error: "Only driver can start the ride" });

    ride.status = "in_progress";
    ride.driverStarted = true;

    await ride.save();
    res.json(ride);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.completeRide = async (req, res) => {
  try {
    const { rideId } = req.params;

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ error: "Ride not found" });

    const isDriver = ride.driver.toString() === req.user.id;
    if (!isDriver)
      return res.status(403).json({ error: "Only driver can complete the ride" });

    ride.status = "completed";
    ride.driverCompleted = true;
    
    await Booking.updateMany({ ride: rideId }, { status: "completed" });

    await ride.save();
    res.json(ride);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
