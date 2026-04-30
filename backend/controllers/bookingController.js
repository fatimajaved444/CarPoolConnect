const Booking = require("../models/Booking");
const Ride = require("../models/Ride");

exports.bookRide = async (req, res) => {
  const { rideId, seats } = req.body;

  try {
    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    if (ride.seats < seats) {
      return res.status(400).json({ error: "Not enough seats" });
    }

    ride.seats -= seats;
    await ride.save();

    const booking = await Booking.create({
      user: req.user.id,
      ride: rideId,
      seatsBooked: seats
    });

    res.json({ message: "Ride booked", booking });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("ride");

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  const { bookingId } = req.body;

  try {
    const booking = await Booking.findById(bookingId);
    const ride = await Ride.findById(booking.ride);

    // restore seats
    ride.seats += booking.seatsBooked;
    await ride.save();

    await booking.deleteOne();

    res.json({ message: "Booking cancelled" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};