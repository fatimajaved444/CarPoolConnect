import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { Calendar, Users, IndianRupee, X } from "lucide-react";

const bookings = await Booking.find({ user: req.user.id });
console.log("All bookings for user:", bookings);

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const res = await API.get("/bookings/my");
      setBookings(res.data);
    } catch (err) {
      console.error("Failed");
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    if (!window.confirm("Cancel?")) return;
    try {
      await API.post("/bookings/cancel", { bookingId });
      alert("Cancelled");
      fetchBookings();
    } catch (err) {
      alert("Failed");
    }
  };

  if (loading) return (<><Navbar /><div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div></>);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Bookings</h1>
        {bookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">No bookings yet</div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-xl shadow-sm border p-5">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">{booking.ride?.pickup?.name} → {booking.ride?.drop?.name}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      <span><Calendar className="inline h-3 w-3 mr-1" />{booking.ride?.date}</span>
                      <span><Users className="inline h-3 w-3 mr-1" />{booking.seatsBooked} seats</span>
                      <span><IndianRupee className="inline h-3 w-3 mr-1" />{booking.ride?.price}</span>
                    </div>
                  </div>
                  <button onClick={() => cancelBooking(booking._id)} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg">Cancel</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
    
  );
};

export default MyBookings;