
const Booking = require("../models/Booking");
const Ride = require("../models/Ride");
exports.completeRide = async (req, res) => {
  try {
    const { rideId } = req.params;

    const ride = await Ride.findByIdAndUpdate(
      rideId,
      { status: "completed" },
      { new: true }
    );
    if (!ride) return res.status(404).json({ error: "Ride not found" });

    await Booking.updateMany(
      { ride: rideId, status: "confirmed" },
      { status: "completed" }
    );

    res.json({ message: "Ride and all bookings marked as completed", ride });
  } catch (err) {
    console.error("completeRide error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.bookRide = async (req, res) => {
  const { rideId, seats, paymentMethod = "cash" } = req.body;

  try {
    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    if (ride.driver.toString() === req.user.id) {
      return res.status(400).json({ error: "Cannot book your own ride" });
    }

    if (ride.seats < seats) {
      return res.status(400).json({ error: "Not enough seats" });
    }

    const existingBooking = await Booking.findOne({
      user: req.user.id,
      ride: rideId,
      status: "confirmed"
    });

    if (existingBooking) {
      return res.status(400).json({ error: "You have already booked this ride" });
    }

    ride.seats = 0;
    ride.status = "assigned";
    
    const booking = await Booking.create({
      user: req.user.id,
      ride: rideId,
      seatsBooked: seats,
      totalPrice: ride.price * seats,
      status: "confirmed",
      paymentMethod,
      paymentStatus: paymentMethod === "online" ? "completed" : "pending"
    });
    
    ride.passengers.push({
      user: req.user.id,
      seats: seats,
      bookingId: booking._id,
      bookedAt: new Date()
    });
    
    await ride.save();

    res.json({ message: "Ride booked", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate({
        path: "ride",
        populate: {
          path: "driver",
          select: "name email averageRating"
        }
      })
      .sort({ createdAt: -1 });

    console.log("Bookings found:", bookings.length); 
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  const { bookingId } = req.body;

  try {
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }
    
    const ride = await Ride.findById(booking.ride);
   
    ride.seats += booking.seatsBooked;
    
    ride.passengers = ride.passengers.filter(
      p => p.bookingId.toString() !== bookingId
    );
    
    await ride.save();
    
    booking.status = "cancelled";
    await booking.save();

    res.json({ message: "Booking cancelled" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRideBookings = async (req, res) => {
  try {
    const { rideId } = req.params;
    
    const ride = await Ride.findById(rideId);
    
    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }
    
    if (ride.driver.toString() !== req.user.id) {
      return res.status(403).json({ error: "Only driver can view bookings" });
    }
    
    const bookings = await Booking.find({ ride: rideId, status: "confirmed" })
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.rateBooking = async (req, res) => {
  const { bookingId } = req.params;
  const { rating } = req.body;

  try {
    const booking = await Booking.findById(bookingId).populate("ride");
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.user.toString() !== req.user.id) return res.status(403).json({ error: "Not authorized" });
    if (booking.rating > 0) return res.status(400).json({ error: "Already rated" });

    booking.rating = rating;
    await booking.save();

    const driver = await require("../models/User").findById(booking.ride.driver);
    if (driver) {
      const total = driver.totalRatings || 0;
      const currentAvg = driver.averageRating || 0;
      
      const newTotal = total + 1;
      const newAvg = ((currentAvg * total) + rating) / newTotal;
      
      driver.totalRatings = newTotal;
      driver.averageRating = Number(newAvg.toFixed(1));
      await driver.save();
    }

    res.json({ message: "Rating saved successfully", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};