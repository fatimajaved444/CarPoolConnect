import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import LocationPicker from "../components/LocationPicker";
import { Search, MapPin, Calendar, Users, IndianRupee, Clock, ArrowLeft, Navigation, AlertCircle } from "lucide-react";

const SearchRide = () => {
  const navigate = useNavigate();
  const [allRides, setAllRides] = useState([]);
  const [matchedRides, setMatchedRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState(null);
  const [searchParams, setSearchParams] = useState({
    pickup: null,
    drop: null,
    date: ""
  });
  const [searched, setSearched] = useState(false);
  const [matchType, setMatchType] = useState('all'); 

  useEffect(() => {
    fetchAllRides();
  }, []);

  const fetchAllRides = async () => {
    setLoading(true);
    try {
      const res = await API.get("/rides/available");
      setAllRides(res.data);
      if (!searched) {
        setMatchedRides(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch rides");
    } finally {
      setLoading(false);
    }
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Check if a point is on the route path (simplified version)
  const isOnRoute = (ridePickup, rideDrop, passengerPickup, passengerDrop) => {
    // Calculate distances
    const pickupToPassengerPickup = calculateDistance(
      ridePickup.lat, ridePickup.lng, 
      passengerPickup.lat, passengerPickup.lng
    );
    const passengerPickupToRideDrop = calculateDistance(
      passengerPickup.lat, passengerPickup.lng,
      rideDrop.lat, rideDrop.lng
    );
    const totalRideDistance = calculateDistance(
      ridePickup.lat, ridePickup.lng,
      rideDrop.lat, rideDrop.lng
    );
    
    // Check if passenger's pickup is within 5km of ride's route
    const isPickupNearRoute = Math.abs(pickupToPassengerPickup + passengerPickupToRideDrop - totalRideDistance) < 5;
    
    // Check if passenger's drop is near ride's drop
    const dropDistance = calculateDistance(
      passengerDrop.lat, passengerDrop.lng,
      rideDrop.lat, rideDrop.lng
    );
    
    return isPickupNearRoute && dropDistance < 3;
  };

  const findMatchingRides = async () => {
    if (!searchParams.pickup || !searchParams.drop) {
      alert("Please select both pickup and drop locations from the map");
      return;
    }
    
    setLoading(true);
    setSearched(true);
    
    try {
      // First try exact match
      const exactRes = await API.post("/rides/search", {
        pickup: {
          lat: searchParams.pickup.lat,
          lng: searchParams.pickup.lng
        },
        drop: {
          lat: searchParams.drop.lat,
          lng: searchParams.drop.lng
        },
        date: searchParams.date || undefined
      });
      
      let matches = [...exactRes.data];
      
      // Then find along-the-route matches
      const alongRouteMatches = allRides.filter(ride => {
        // Skip if already in exact matches
        if (exactRes.data.some(r => r._id === ride._id)) return false;
        
        // Check if passenger's route is along this ride's route
        return isOnRoute(
          ride.pickup, ride.drop,
          searchParams.pickup, searchParams.drop
        );
      });
      
      matches = [...matches, ...alongRouteMatches];
      
      // Calculate match percentage for each ride
      const matchesWithScore = matches.map(ride => {
        let score = 100;
        
        // Calculate distance from passenger's pickup to ride's pickup
        const pickupDistance = calculateDistance(
          searchParams.pickup.lat, searchParams.pickup.lng,
          ride.pickup.lat, ride.pickup.lng
        );
        
        // Calculate distance from passenger's drop to ride's drop
        const dropDistance = calculateDistance(
          searchParams.drop.lat, searchParams.drop.lng,
          ride.drop.lat, ride.drop.lng
        );
        
        // Reduce score based on distance
        score -= pickupDistance * 5;
        score -= dropDistance * 5;
        
        // Bonus for exact match
        if (pickupDistance < 0.5 && dropDistance < 0.5) {
          score += 20;
        }
        
        return {
          ...ride,
          matchScore: Math.max(0, Math.min(100, score)),
          pickupDistance: pickupDistance.toFixed(1),
          dropDistance: dropDistance.toFixed(1)
        };
      });
      
      // Sort by match score (highest first)
      matchesWithScore.sort((a, b) => b.matchScore - a.matchScore);
      
      setMatchedRides(matchesWithScore);
      
      if (matchesWithScore.length === 0) {
        alert("No rides found. Try:\n1. Different locations\n2. Click 'Show All Rides'");
      }
    } catch (err) {
      alert("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const showAllRides = async () => {
    setLoading(true);
    setSearched(false);
    setSearchParams({ pickup: null, drop: null, date: "" });
    try {
      const res = await API.get("/rides/available");
      setMatchedRides(res.data);
      setAllRides(res.data);
    } catch (err) {
      alert("Failed to fetch rides");
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setSearchParams({ pickup: null, drop: null, date: "" });
    setSearched(false);
    fetchAllRides();
  };

  const bookRide = async (rideId) => {
    setBookingId(rideId);
    try {
      await API.post("/bookings/book", { rideId, seats: 1 });
      alert("✓ Ride booked successfully!");
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.error || "Booking failed");
    } finally {
      setBookingId(null);
    }
  };

  const getMatchBadge = (score) => {
    if (score >= 80) return { text: "Perfect Match", color: "bg-green-100 text-green-700" };
    if (score >= 60) return { text: "Good Match", color: "bg-blue-100 text-blue-700" };
    if (score >= 40) return { text: "Nearby", color: "bg-yellow-100 text-yellow-700" };
    return { text: "Along Route", color: "bg-gray-100 text-gray-600" };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Find a Ride</h1>
        
        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm border p-5 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Navigation className="h-5 w-5 text-indigo-500" />
            Where would you like to go?
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <LocationPicker 
              onLocationSelect={(loc) => setSearchParams({...searchParams, pickup: loc})}
              title="Pickup Location (Where are you now?)"
              initialLocation={searchParams.pickup}
            />
            <LocationPicker 
              onLocationSelect={(loc) => setSearchParams({...searchParams, drop: loc})}
              title="Drop Location (Where do you want to go?)"
              initialLocation={searchParams.drop}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Travel Date (Optional)</label>
              <input
                type="date"
                value={searchParams.date}
                onChange={(e) => setSearchParams({...searchParams, date: e.target.value})}
                className="w-full p-2.5 border border-gray-200 rounded-lg"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={findMatchingRides}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              <Search className="inline h-4 w-4 mr-2" />
              Find Matching Rides
            </button>
            <button
              onClick={showAllRides}
              className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Show All Rides
            </button>
            {searched && (
              <button
                onClick={resetSearch}
                className="px-6 py-2.5 text-gray-500 hover:text-gray-700 transition"
              >
                Reset
              </button>
            )}
          </div>
        </div>
        
        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Finding best rides for you...</p>
          </div>
        ) : matchedRides.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border">
            <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No rides match your route</p>
            <p className="text-sm text-gray-400 mt-1">Try different locations or check back later</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-500">
                {searched ? `${matchedRides.length} rides match your route` : `${matchedRides.length} available rides`}
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setMatchType('all')}
                  className={`text-xs px-2 py-1 rounded ${matchType === 'all' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500'}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setMatchType('exact')}
                  className={`text-xs px-2 py-1 rounded ${matchType === 'exact' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500'}`}
                >
                  Exact Match
                </button>
                <button 
                  onClick={() => setMatchType('nearby')}
                  className={`text-xs px-2 py-1 rounded ${matchType === 'nearby' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500'}`}
                >
                  Nearby
                </button>
              </div>
            </div>
            
            {matchedRides.filter(ride => {
              if (matchType === 'exact') return ride.matchScore >= 80;
              if (matchType === 'nearby') return ride.matchScore >= 40 && ride.matchScore < 80;
              return true;
            }).map((ride) => {
              const badge = getMatchBadge(ride.matchScore);
              
              return (
                <div key={ride._id} className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition">
                  <div className="flex flex-wrap justify-between gap-4">
                    <div className="flex-1">
                      {/* Match Badge */}
                      <div className="mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${badge.color}`}>
                          {badge.text} ({Math.round(ride.matchScore)}%)
                        </span>
                      </div>
                      
                      {/* Route */}
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-indigo-500" />
                        <p className="font-semibold text-gray-800">
                          {ride.pickup?.name} → {ride.drop?.name}
                        </p>
                      </div>
                      
                      {/* Details */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" /> {new Date(ride.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {ride.startTime || "Flexible"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" /> {ride.seats} seats left
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-green-600">
                          <IndianRupee className="h-3.5 w-3.5" /> ₹{ride.price} / seat
                        </span>
                      </div>
                      
                      {/* Driver Info */}
                      <div className="mt-2 text-xs text-gray-400">
                        👨‍✈️ Driver: {ride.driver?.name || "Anonymous"}
                      </div>
                      
                      {/* Distance Info (for matches) */}
                      {ride.pickupDistance && (
                        <div className="mt-1 text-xs text-gray-400">
                          📍 {ride.pickupDistance}km from your pickup • {ride.dropDistance}km from your drop
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => bookRide(ride._id)}
                      disabled={bookingId === ride._id || ride.seats === 0}
                      className={`px-5 py-2.5 rounded-lg font-medium transition ${
                        ride.seats === 0
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {bookingId === ride._id ? (
                        <span className="flex items-center gap-1">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Booking...
                        </span>
                      ) : ride.seats === 0 ? (
                        "Full"
                      ) : (
                        "Book Ride - ₹" + ride.price
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchRide;