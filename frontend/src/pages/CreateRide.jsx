import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import LocationPicker from "../components/LocationPicker";
// Added Hash icon for Vehicle Number
import { Calendar, Users, IndianRupee, Clock, Car, ArrowLeft, AlertCircle, Palette, Info, Hash } from "lucide-react";

const CreateRide = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    pickup: null,
    drop: null,
    seats: "",
    price: "",
    date: "",
    startTime: "",
    endTime: "",
    vehicleType: "Car",
    vehicleName: "",
    vehicleColor: "",
    vehicleNumber: "" // Naya field
  });

  const handlePickupSelect = (location) => {
    setForm({ ...form, pickup: location });
  };

  const handleDropSelect = (location) => {
    setForm({ ...form, drop: location });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.pickup || !form.drop) {
      alert("Please select both pickup and drop locations from the map");
      return;
    }
    
    setLoading(true);
    try {
      await API.post("/rides/create", {
        pickup: {
          name: form.pickup.name,
          lat: form.pickup.lat,
          lng: form.pickup.lng
        },
        drop: {
          name: form.drop.name,
          lat: form.drop.lat,
          lng: form.drop.lng
        },
        seats: Number(form.seats),
        price: Number(form.price),
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        // Sending Vehicle Data to Backend
        vehicleType: form.vehicleType,
        vehicleName: form.vehicleName,
        vehicleColor: form.vehicleColor,
        vehicleNumber: form.vehicleNumber.toUpperCase() // Number plate hamesha caps mein achi lagti hay
      });
      alert("✓ Ride created successfully!");
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.error || "Error creating ride");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Offer a Ride</h1>
        
        <div className="mb-6 p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-blue-500" />
          <p className="text-sm text-blue-700">Currently serving Lahore city only. Please select locations within Lahore.</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <LocationPicker onLocationSelect={handlePickupSelect} title="Pickup Location" initialLocation={form.pickup} />
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <LocationPicker onLocationSelect={handleDropSelect} title="Drop Location" initialLocation={form.drop} />
            </div>
          </div>
          
          {/* --- Vehicle Details Section --- */}
          <div className="bg-white rounded-xl shadow-sm border p-5 mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Vehicle Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Vehicle Type</label>
                <div className="relative">
                  <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={form.vehicleType}
                    onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                    className="w-full pl-9 p-2.5 border border-gray-200 rounded-lg appearance-none bg-white"
                  >
                    <option value="Car">Car</option>
                    <option value="Bus">Bus</option>
                    <option value="Bike">Bike/Scooty</option>
                    <option value="Rickshaw">Rickshaw</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Vehicle Model/Name</label>
                <div className="relative">
                  <Info className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="e.g. Toyota Corolla"
                    value={form.vehicleName}
                    onChange={(e) => setForm({ ...form, vehicleName: e.target.value })}
                    className="w-full pl-9 p-2.5 border border-gray-200 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Vehicle Number Plate</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="e.g. LEC-1234"
                    value={form.vehicleNumber}
                    onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
                    className="w-full pl-9 p-2.5 border border-gray-200 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Vehicle Color</label>
                <div className="relative">
                  <Palette className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="e.g. White"
                    value={form.vehicleColor}
                    onChange={(e) => setForm({ ...form, vehicleColor: e.target.value })}
                    className="w-full pl-9 p-2.5 border border-gray-200 rounded-lg"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Ride Details */}
          <div className="bg-white rounded-xl shadow-sm border p-5 mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Ride Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Seats</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="number" min="1" max="10" value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} className="w-full pl-9 p-2.5 border border-gray-200 rounded-lg" required />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Price (PKR)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="number" min="0" step="10" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full pl-9 p-2.5 border border-gray-200 rounded-lg" required />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full pl-9 p-2.5 border border-gray-200 rounded-lg" required />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="w-full pl-9 p-2.5 border border-gray-200 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="w-full pl-9 p-2.5 border border-gray-200 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium disabled:opacity-50"
          >
            {loading ? "Creating Ride..." : "Offer Ride"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRide;