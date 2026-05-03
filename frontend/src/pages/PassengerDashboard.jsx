
import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import LocationPicker from "../components/LocationPicker";
import ChatModal from "../components/ChatModal";
import PaymentModal from "../components/PaymentModal";
import {
  Calendar, Users, MapPin, Clock, Search,
  LogOut, User, BookOpen, History, Navigation,
  AlertCircle, CheckCircle, Timer, Zap,
  MessageCircle, Phone, Car, Share2, Copy,
  ArrowRight, X, RefreshCw, ChevronDown, Locate,
  TrendingUp, Fuel, Info, Star, ShieldAlert
} from "lucide-react";
const haversine = (la1, lo1, la2, lo2) => {
  const R = 6371;
  const dLa = (la2 - la1) * Math.PI / 180;
  const dLo = (lo2 - lo1) * Math.PI / 180;
  const a = Math.sin(dLa / 2) ** 2 +
    Math.cos(la1 * Math.PI / 180) * Math.cos(la2 * Math.PI / 180) * Math.sin(dLo / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const calcFare = (dist) => {
  const fare = (dist * 35) / 2;
  return {
    totalCost: Math.ceil(fare),
    perSeat: Math.ceil(fare),
    yourCost: Math.ceil(fare),
    fuelCost: Math.ceil(fare),
    driverEarn: Math.ceil(fare),
  };
};

const shortAddr = (addr) => {
  if (!addr) return "Location";
  return addr.split(",")[0];
};
const fmtTimer = (s) => {
  if (s <= 0) return "Expired";
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

const ETAChip = ({ driverLat, driverLng, pickupLat, pickupLng }) => {
  const dist = haversine(driverLat, driverLng, pickupLat, pickupLng);
  const etaMin = Math.ceil((dist / 30) * 60); // assume avg 30 km/h city speed
  const color = etaMin <= 5
    ? "bg-green-100 text-green-700 border-green-200"
    : etaMin <= 15
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${color}`}>
      <Navigation size={10} />
      {etaMin} min away · {dist.toFixed(1)} km
    </span>
  );
};

const FareInfo = ({ dist }) => {
  const f = calcFare(dist);
  return (
    <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50 p-3">
      <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-2 flex items-center gap-1">
        <Fuel size={11} /> Fare Breakdown
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <span className="text-gray-500">Distance</span>
        <span className="font-medium text-gray-800 text-right">{dist.toFixed(1)} km</span>
        <span className="text-gray-500 pt-1 border-t border-indigo-200">Total Fare</span>
        <span className="font-bold text-indigo-700 text-right pt-1 border-t border-indigo-200">Rs {f.yourCost}</span>
      </div>
    </div>
  );
};

const LocationShareModal = ({ onClose }) => {
  const [loc, setLoc] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) { setError("Geolocation not supported"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setError("Could not get your location. Please allow location access.")
    );
  }, []);

  const googleLink = loc
    ? `https://maps.google.com/?q=${loc.lat},${loc.lng}`
    : null;

  const copyLink = () => {
    if (!googleLink) return;
    navigator.clipboard.writeText(googleLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-indigo-600 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Locate size={18} />
            <span className="font-semibold">Share Your Location</span>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">
          {error ? (
            <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl border border-red-100 text-sm text-red-700">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" /> {error}
            </div>
          ) : !loc ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Getting your location…</p>
            </div>
          ) : (
            <>
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-800 font-mono break-all mb-3">
                {googleLink}
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Share this link with your driver so they can find you easily.
              </p>
              <button
                onClick={copyLink}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${copied
                    ? "bg-green-600 text-white"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
              >
                {copied ? <><CheckCircle size={15} /> Copied!</> : <><Copy size={15} /> Copy Link</>}
              </button>
              {navigator.share && (
                <button
                  onClick={() => navigator.share({ title: "My Location", url: googleLink })}
                  className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
                >
                  <Share2 size={15} /> Share via…
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const PassengerDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [allRides, setAllRides] = useState([]);
  const [matchedRides, setMatchedRides] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [historyBookings, setHistoryBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [bookingId, setBookingId] = useState(null);
  const [activeTab, setActiveTab] = useState("search");
  const [searched, setSearched] = useState(false);
  const [showChat, setShowChat] = useState(null);
  const [showLocShare, setShowLocShare] = useState(false);
  const [showPayment, setShowPayment] = useState(null);
  const [expandedFare, setExpandedFare] = useState({});
  const [searchParams, setSearchParams] = useState({ pickup: null, drop: null });
  const [rideTimers, setRideTimers] = useState({});

  useEffect(() => {
    const id = setInterval(() => {
      setRideTimers(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(k => { if (next[k] > 0) next[k] -= 1; });
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const fetchData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const [ridesRes, bookingsRes] = await Promise.all([
        API.get("/rides/available"),
        API.get("/bookings/my"),
      ]);

      const rides = ridesRes.data || [];
      const bookings = bookingsRes.data || [];

      const timers = {};
      rides.forEach(r => {
        if (r.endTime && r.date) {
          const [h, m] = r.endTime.split(":").map(Number);
          const end = new Date(r.date);
          end.setHours(h, m, 0);
          const secs = Math.floor((end - Date.now()) / 1000);
          if (secs > 0) timers[r._id] = secs;
        }
      });
      setRideTimers(timers);
      setAllRides(rides);
      setMatchedRides(rides);

      const upcoming = bookings.filter(b =>
        b.status === "confirmed" && !["completed", "cancelled"].includes(b.ride?.status)
      );
      const history = bookings.filter(b =>
        b.status === "cancelled" || ["completed", "cancelled"].includes(b.ride?.status)
      );
      setMyBookings(upcoming);
      setHistoryBookings(history);
    } catch (err) {
      console.error("fetchData error:", err);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const findMatchingRides = async () => {
    if (!searchParams.pickup || !searchParams.drop) {
      alert("Please select both pickup and drop locations");
      return;
    }
    setLoading(true); setSearched(true);
    try {
      const { data } = await API.post("/rides/search", {
        pickup: { lat: searchParams.pickup.lat, lng: searchParams.pickup.lng },
        drop: { lat: searchParams.drop.lat, lng: searchParams.drop.lng },
      });
      const enriched = data
        .filter(r => haversine(r.pickup.lat, r.pickup.lng, searchParams.pickup.lat, searchParams.pickup.lng) <= 2)
        .map(r => ({
          ...r,
          pickupDistance: haversine(r.pickup.lat, r.pickup.lng, searchParams.pickup.lat, searchParams.pickup.lng).toFixed(1),
        }));
      setMatchedRides(enriched);
    } catch { alert("Search failed"); }
    finally { setLoading(false); }
  };

  const showAll = () => { setMatchedRides(allRides); setSearched(false); setSearchParams({ pickup: null, drop: null }); };
  const resetSrch = () => { setSearchParams({ pickup: null, drop: null }); setSearched(false); setMatchedRides(allRides); };

  const initiateBooking = (ride) => {
    setShowPayment({
      rideId: ride._id,
      seats: 1,
      totalAmount: ride.price
    });
  };

  const handlePaymentConfirm = async (method) => {
    const { rideId, seats } = showPayment;
    setBookingId(rideId);
    setShowPayment(null);
    try {
      await API.post("/bookings/book", { rideId, seats, paymentMethod: method });
      await fetchData();
      setActiveTab("bookings");
    } catch (err) { alert(err.response?.data?.error || "Booking failed"); }
    finally { setBookingId(null); }
  };

  const cancelBooking = async (bId) => {
    if (!window.confirm("Cancel your booking?")) return;
    try { await API.post("/bookings/cancel", { bookingId: bId }); fetchData(false); }
    catch (err) { alert(err.response?.data?.error || "Failed to cancel"); }
  };



  const timerCls = (s) =>
    s <= 60 ? "bg-red-50 text-red-600 border-red-200 animate-pulse" :
      s <= 300 ? "bg-amber-50 text-amber-600 border-amber-200" :
        "bg-green-50 text-green-700 border-green-200";

  if (loading && initialLoad) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Loading rides…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Car size={18} color="#fff" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-800 leading-tight">CarpoolConnect</p>
              <p className="text-xs text-slate-400">Hi, {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLocShare(true)}
              className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              <Locate size={13} /> Share Location
            </button>
            <button onClick={() => fetchData(true)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <RefreshCw size={15} />
            </button>
            <button
              onClick={() => { localStorage.removeItem("userRole"); navigate("/role-selector"); }}
              className="text-xs font-medium px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Switch Role
            </button>
            <button
              onClick={() => { localStorage.clear(); navigate("/login"); }}
              className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={13} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      
        <div className="flex gap-1 bg-slate-200 rounded-xl p-1 mb-6">
          {[
            { id: "search", icon: Search, label: "Find a Ride" },
            { id: "bookings", icon: BookOpen, label: `My Bookings (${myBookings.length})` },
            { id: "history", icon: History, label: `History (${historyBookings.length})` },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); if (id === "search") resetSrch(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === id
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
                }`}
            >
              <Icon size={14} /> <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{label.split(" ")[0]}</span>
            </button>
          ))}
        </div>

        {activeTab === "search" && (
          <div className="space-y-5">


            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <Navigation size={15} className="text-indigo-500" /> Select Your Journey
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <LocationPicker
                  onLocationSelect={loc => setSearchParams(p => ({ ...p, pickup: loc }))}
                  title="Pickup Location"
                  initialLocation={searchParams.pickup}
                />
                <LocationPicker
                  onLocationSelect={loc => setSearchParams(p => ({ ...p, drop: loc }))}
                  title="Drop Location"
                  initialLocation={searchParams.drop}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={findMatchingRides}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm"
                >
                  <Search size={14} /> Find Nearby Rides
                </button>
                <button
                  onClick={showAll}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors"
                >
                  Browse All ({allRides.length})
                </button>
                {searched && (
                  <button onClick={resetSrch} className="px-4 py-2.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
                    Reset
                  </button>
                )}
              </div>
            </div>

            {searchParams.pickup && searchParams.drop && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 border border-indigo-100 text-sm">
                <Zap size={14} className="text-indigo-500 flex-shrink-0" />
                <span className="font-medium text-indigo-800 truncate">{shortAddr(searchParams.pickup.name)}</span>
                <ArrowRight size={12} className="text-indigo-400 flex-shrink-0" />
                <span className="font-medium text-indigo-800 truncate">{shortAddr(searchParams.drop.name)}</span>
              </div>
            )}

          
            {matchedRides.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <MapPin size={40} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">
                  {searched ? "No rides found near you" : "Select pickup & drop to search"}
                </p>
                {searched && (
                  <button onClick={showAll} className="mt-3 text-indigo-600 text-sm font-medium hover:text-indigo-700">
                    Browse all rides →
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-1">
                  {searched ? `${matchedRides.length} rides near you` : `${matchedRides.length} available rides`}
                </p>
                {matchedRides.map(ride => {
                  const secs = rideTimers[ride._id] || 0;
                  const dist = searchParams.pickup
                    ? haversine(ride.pickup.lat, ride.pickup.lng, searchParams.pickup.lat, searchParams.pickup.lng)
                    : haversine(ride.pickup.lat, ride.pickup.lng, ride.drop.lat, ride.drop.lng);
                  const showFare = expandedFare[ride._id];

                  return (
                    <div key={ride._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                      <div className="p-5">
                        {/* Route */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2.5">
                              <MapPin size={14} className="text-indigo-500 flex-shrink-0" />
                              <span className="font-bold text-slate-800 text-sm truncate">
                                {shortAddr(ride.pickup?.name)}
                              </span>
                              <ArrowRight size={12} className="text-slate-300 flex-shrink-0" />
                              <span className="font-bold text-slate-800 text-sm truncate">
                                {shortAddr(ride.drop?.name)}
                              </span>
                            </div>

                            {/* Chips */}
                            <div className="flex flex-wrap gap-1.5 mb-2.5">
                              {secs > 0 ? (
                                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${timerCls(secs)}`}>
                                  <Timer size={10} /> {fmtTimer(secs)}
                                </span>
                              ) : ride.startTime ? (
                                <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                  <Clock size={10} /> {ride.startTime}
                                  {ride.endTime && ` – ${ride.endTime}`}
                                </span>
                              ) : null}
                              <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                <Calendar size={10} /> {new Date(ride.date).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                              </span>

                              {ride.pickupDistance && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                                  <Zap size={10} /> {ride.pickupDistance} km away
                                </span>
                              )}
                            </div>

                            {/* Driver */}
                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                              <span className="font-medium text-slate-600">{ride.driver?.name || "Driver"}</span>
                              <span className="flex items-center text-amber-500 font-semibold text-[10px] bg-amber-50 px-1 rounded">
                                <Star size={10} className="fill-amber-500 mr-0.5" /> 4.8
                              </span>
                              {ride.vehicleName && ` · ${ride.vehicleName}`}
                              {ride.vehicleColor && ` · ${ride.vehicleColor}`}
                              {ride.vehicleNumber && ` · ${ride.vehicleNumber}`}
                            </p>
                          </div>

                          {/* Price + Book */}
                          <div className="text-right flex-shrink-0">
                            <p className="text-xl font-bold text-indigo-600 mb-2">Rs {ride.price}</p>
                            <button
                              onClick={() => initiateBooking(ride)}
                              disabled={bookingId === ride._id || ride.seats === 0}
                              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${ride.seats === 0
                                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                  : bookingId === ride._id
                                    ? "bg-indigo-400 text-white cursor-wait"
                                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md"
                                }`}
                            >
                              {bookingId === ride._id ? "Booking…" : ride.seats === 0 ? "Full" : "Book Now"}
                            </button>
                          </div>
                        </div>

                        {/* Fare toggle */}
                        <button
                          onClick={() => setExpandedFare(p => ({ ...p, [ride._id]: !p[ride._id] }))}
                          className="mt-3 flex items-center gap-1 text-xs text-indigo-600 font-medium hover:text-indigo-700"
                        >
                          <Info size={11} />
                          {showFare ? "Hide" : "View"} fare breakdown
                          <ChevronDown size={11} className={`transition-transform ${showFare ? "rotate-180" : ""}`} />
                        </button>
                        {showFare && (
                          <FareInfo
                            dist={haversine(ride.pickup.lat, ride.pickup.lng, ride.drop.lat, ride.drop.lng)}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

       
        {activeTab === "bookings" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800">Upcoming Rides</h2>
              <button onClick={() => setShowLocShare(true)} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors">
                <Locate size={12} /> Share Location
              </button>
            </div>

            {myBookings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <BookOpen size={40} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No upcoming bookings</p>
                <button onClick={() => setActiveTab("search")} className="mt-3 text-indigo-600 text-sm font-medium">
                  Find a ride →
                </button>
              </div>
            ) : (
              myBookings.map(booking => {
                const ride = booking.ride;
                const dist = ride?.pickup && ride?.drop
                  ? haversine(ride.pickup.lat, ride.pickup.lng, ride.drop.lat, ride.drop.lng)
                  : 0;

                return (
                  <div key={booking._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Status bar */}
                    <div className={`flex items-center gap-2 px-5 py-2.5 border-b ${ride?.status === "in_progress"
                        ? "bg-amber-50 border-amber-100"
                        : "bg-green-50 border-green-100"
                      }`}>
                      <CheckCircle size={13} className={ride?.status === "in_progress" ? "text-amber-600" : "text-green-600"} />
                      <span className={`text-xs font-semibold ${ride?.status === "in_progress" ? "text-amber-700" : "text-green-700"}`}>
                        {ride?.status === "in_progress" ? "Ride In Progress" : "Confirmed Booking"}
                      </span>
                    </div>

                    <div className="p-5">
                      {/* Route */}
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin size={14} className="text-indigo-500 flex-shrink-0" />
                        <span className="font-bold text-slate-800 text-sm">{shortAddr(ride?.pickup?.name)}</span>
                        <ArrowRight size={12} className="text-slate-300 flex-shrink-0" />
                        <span className="font-bold text-slate-800 text-sm">{shortAddr(ride?.drop?.name)}</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          <Calendar size={10} /> {new Date(ride?.date).toLocaleDateString("en-PK", { weekday: "short", day: "numeric", month: "short" })}
                        </span>
                        {ride?.startTime && (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            <Clock size={10} /> {ride.startTime}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-semibold">
                          Rs {ride?.price}
                        </span>
                      </div>

                      {/* Driver info */}
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 mb-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                          {ride?.driver?.name?.charAt(0)?.toUpperCase() || "D"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold text-slate-800">{ride?.driver?.name || "Driver"}</p>
                            <span className="flex items-center text-amber-500 font-semibold text-[10px] bg-amber-50 px-1 rounded">
                              <Star size={10} className="fill-amber-500 mr-0.5" /> 4.9
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            {ride?.vehicleName && `${ride.vehicleName}`}
                            {ride?.vehicleColor && ` · ${ride.vehicleColor}`}
                            {ride?.vehicleNumber && ` · ${ride.vehicleNumber}`}
                          </p>
                        </div>
                        {ride?.driver?.phone && (
                          <a
                            href={`tel:${ride.driver.phone}`}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-medium hover:bg-green-200 transition-colors"
                          >
                            <Phone size={12} /> Call
                          </a>
                        )}
                      </div>

                      {ride?.driverStarted && !ride?.passengerCompleted && (
                        <div className="mb-3">
                          <ETAChip
                            driverLat={ride.pickup.lat} driverLng={ride.pickup.lng}
                            pickupLat={searchParams?.pickup?.lat || ride.pickup.lat}
                            pickupLng={searchParams?.pickup?.lng || ride.pickup.lng}
                          />
                        </div>
                      )}

                      {dist > 0 && (
                        <FareInfo dist={dist} />
                      )}

                      {ride?.status === "in_progress" && (
                        <div className="mt-4 mb-2">
                          <button
                            onClick={() => alert("Emergency SOS Activated! Contacting authorities and emergency contacts...")}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-100 border border-red-200 hover:bg-red-200 text-red-700 text-sm font-bold transition-colors shadow-sm"
                          >
                            <ShieldAlert size={16} /> SOS Emergency
                          </button>
                        </div>
                      )}
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => setShowChat({
                            rideId: ride._id,
                            rideTitle: `${shortAddr(ride?.pickup?.name)} → ${shortAddr(ride?.drop?.name)}`,
                            receiverId: ride?.driver?._id,
                            receiverName: ride?.driver?.name,
                          })}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
                        >
                          <MessageCircle size={14} /> Message Driver
                        </button>
                        <button
                          onClick={() => cancelBooking(booking._id)}
                          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium transition-colors"
                        >
                          <X size={14} /> Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-800">Ride History</h2>

            {historyBookings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <History size={40} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No ride history yet</p>
                <p className="text-xs text-slate-400 mt-1">Completed rides will appear here</p>
              </div>
            ) : (
              historyBookings.map(booking => {
                const ride = booking.ride;
                const isCancelled = booking.status === "cancelled";
                return (
                  <div key={booking._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
                    <div className={`w-2 h-12 rounded-full flex-shrink-0 ${isCancelled ? "bg-red-400" : "bg-green-400"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                        <span className="text-sm font-semibold text-slate-700 truncate">
                          {shortAddr(ride?.pickup?.name)} → {shortAddr(ride?.drop?.name)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-400">
                        <span>{new Date(ride?.date).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}</span>
                        <span className="font-medium text-slate-600">Rs {ride?.price}</span>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 ${isCancelled ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"
                      }`}>
                      {isCancelled ? "Cancelled" : "Completed"}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {showChat && (
        <ChatModal
          rideId={showChat.rideId}
          rideTitle={showChat.rideTitle}
          currentUserId={user?._id}
          receiverId={showChat.receiverId}
          receiverName={showChat.receiverName}
          onClose={() => setShowChat(null)}
        />
      )}

    
      {showLocShare && <LocationShareModal onClose={() => setShowLocShare(false)} />}

      <PaymentModal
        isOpen={!!showPayment}
        onClose={() => setShowPayment(null)}
        onConfirm={handlePaymentConfirm}
        totalAmount={showPayment?.totalAmount || 0}
        seats={showPayment?.seats || 1}
      />
    </div>
  );
};

export default PassengerDashboard;