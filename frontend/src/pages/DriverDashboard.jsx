// src/pages/DriverDashboard.jsx
import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import ChatModal from "../components/ChatModal";
import {
  Car, PlusCircle, Edit, Trash2, Users, Calendar,
  MapPin, Clock, CheckCircle, XCircle,
  LogOut, History, Activity, AlertCircle,
  Wallet, Timer, Phone, Mail, ChevronDown, ChevronUp,
  ArrowRight, TrendingUp, MessageCircle, Fuel, RefreshCw,
  Info
} from "lucide-react";

// ─── Haversine Distance Calculator ────────────────────────────────────────────
const haversine = (la1, lo1, la2, lo2) => {
  const R = 6371;
  const dLa = (la2 - la1) * Math.PI / 180;
  const dLo = (lo2 - lo1) * Math.PI / 180;
  const a = Math.sin(dLa / 2) ** 2 +
    Math.cos(la1 * Math.PI / 180) * Math.cos(la2 * Math.PI / 180) * Math.sin(dLo / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}; // ← THIS BRACE WAS MISSING!

const calcFare = (dist) => {
  const fare = (dist * 35) / 2;
  return {
    dist: dist.toFixed(1),
    fuelCost: Math.ceil(fare),
    totalCost: Math.ceil(fare),
    perSeat: Math.ceil(fare),
    driverEarn: Math.ceil(fare),
  };
};

// ─── Short Address Helper ──────────────────────────────────────────────────────
const shortAddr = (addr) => {
  if (!addr) return "Location";
  const landmarks = ["Devsinc", "DHA", "Gulberg", "Johar Town", "Model Town", "Mall Road", "Airport", "Liberty", "Nishat Colony", "Cantt View", "Railway Station"];
  for (const k of landmarks) if (addr.includes(k)) return k;
  return addr.split(",")[0];
};

// ─── Duration Formatter ────────────────────────────────────────────────────────
const formatDuration = (start, end) => {
  if (!start || !end) return null;
  try {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    let mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins < 0) mins += 1440;
    const h = Math.floor(mins / 60), m = mins % 60;
    return h && m ? `${h}h ${m}m` : h ? `${h}h` : m ? `${m}m` : null;
  } catch { return null; }
};

// ─── Avatar Color Palette ──────────────────────────────────────────────────────
const AVATAR_COLORS = [
  { bg: "#EDE9FE", fg: "#6D28D9" }, { bg: "#DBEAFE", fg: "#1D4ED8" },
  { bg: "#D1FAE5", fg: "#065F46" }, { bg: "#FEF3C7", fg: "#92400E" },
  { bg: "#FCE7F3", fg: "#9D174D" }, { bg: "#FFEDD5", fg: "#9A3412" },
  { bg: "#E0F2FE", fg: "#0369A1" },
];
const getAvatarColor = (name) => AVATAR_COLORS[(name?.length || 0) % AVATAR_COLORS.length];

// ─── Fare Suggestion Panel ────────────────────────────────────────────────────
const FareSuggestionPanel = ({ ride, onApply }) => {
  const distance = ride.pickup && ride.drop
    ? haversine(ride.pickup.lat, ride.pickup.lng, ride.drop.lat, ride.drop.lng)
    : 0;
  const fare = calcFare(distance);

  return (
    <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-blue-50 p-3 mb-3">
      <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-2 flex items-center gap-1">
        <Fuel size={11} /> Suggested Fare
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-2">
        <span className="text-slate-500">Distance</span>
        <span className="font-semibold text-slate-800 text-right">{fare.dist} km</span>
        <span className="text-slate-500">Total Fare</span>
        <span className="font-semibold text-slate-800 text-right">Rs {fare.perSeat}</span>
      </div>
      <button
        onClick={() => onApply(fare.perSeat)}
        className="w-full py-1.5 text-xs font-semibold rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
      >
        Apply Rs {fare.perSeat}
      </button>
    </div>
  );
};

// ─── Edit Ride Form ────────────────────────────────────────────────────────────
const EditRideForm = ({ ride, onSave, onCancel }) => {
  const [form, setForm] = useState({
    pickupName: ride.pickup.name,
    dropName: ride.drop.name,
    seats: ride.seats,
    price: ride.price,
    date: ride.date,
    startTime: ride.startTime || "",
    endTime: ride.endTime || "",
  });

  return (
    <div className="p-4 bg-slate-50 border-t border-slate-200">
      <p className="text-sm font-semibold text-slate-800 mb-3">✏️ Edit Ride Details</p>
      <FareSuggestionPanel ride={{ ...ride, seats: form.seats }} onApply={(price) => setForm(f => ({ ...f, price }))} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
        {[
          ["text", "pickupName", "Pickup Location"],
          ["text", "dropName", "Drop Location"],
          ["number", "seats", "Available Seats"],
          ["number", "price", "Price (Rs)"],
          ["date", "date", "Date"],
          ["time", "startTime", "Start Time"],
          ["time", "endTime", "End Time"],
        ].map(([type, key, placeholder]) => (
          <input
            key={key}
            type={type}
            value={form[key]}
            placeholder={placeholder}
            onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={() => onSave(ride._id, form)} className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors">
          Save Changes
        </button>
        <button onClick={onCancel} className="px-5 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
};

// ─── Main Driver Dashboard Component ───────────────────────────────────────────
const DriverDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [activeRides, setActiveRides] = useState([]);
  const [pastRides, setPastRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [passengers, setPassengers] = useState({});
  const [editingRide, setEditingRide] = useState(null);
  const [activeTab, setActiveTab] = useState("active");
  const [expanded, setExpanded] = useState({});
  const [showChat, setShowChat] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);

  const fetchData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const { data: allRides = [] } = await API.get("/rides/my-rides");
      console.log("📋 All rides from API:", allRides.length);

      const today = new Date().toISOString().split("T")[0];

      // IMPORTANT: Show ALL active rides regardless of seats
      // Only filter by date and status, NOT by seats
      const active = allRides.filter(r => r.date >= today && ["active", "assigned", "in_progress"].includes(r.status));
      const past = allRides.filter(r => r.date < today || ["completed", "cancelled"].includes(r.status));

      console.log("✅ Active rides:", active.length);
      console.log("📜 Past rides:", past.length);

      setActiveRides(active);
      setPastRides(past);

      for (const ride of active) {
        try {
          const { data } = await API.get(`/bookings/ride/${ride._id}`);
          setPassengers(p => ({ ...p, [ride._id]: data }));
          console.log(`👥 Passengers for ride ${ride._id}:`, data.length);
        } catch {
          setPassengers(p => ({ ...p, [ride._id]: [] }));
        }
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
    finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    fetchData(true);
    // Auto refresh every 10 seconds
    const interval = setInterval(() => fetchData(false), 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const cancelRide = async (id) => {
    if (!window.confirm("❌ Cancel this ride? All passengers will be notified.")) return;
    try { await API.delete(`/rides/${id}`); fetchData(); }
    catch (err) { alert(err.response?.data?.error || "Failed to cancel ride"); }
  };

  const updateRide = async (id, data) => {
    try { await API.put(`/rides/${id}`, data); setEditingRide(null); fetchData(); }
    catch (err) { alert(err.response?.data?.error || "Failed to update ride"); }
  };

  const startRide = async (id) => {
    try { await API.put(`/rides/start/${id}`, { role: "driver" }); fetchData(false); }
    catch (err) { alert(err.response?.data?.error || "Failed to start ride"); }
  };

  const completeRide = async (id) => {
    if (!window.confirm("✅ Mark as completed? This will move to history.")) return;
    try { await API.put(`/rides/complete/${id}`, { role: "driver" }); fetchData(false); }
    catch (err) { alert(err.response?.data?.error || "Failed to complete ride"); }
  };

  const totalPassengers = Object.values(passengers).flat().length;
  const totalEarnings = pastRides.reduce((sum, ride) => {
    return sum + (passengers[ride._id] || []).reduce((s, p) => s + ride.price * p.seatsBooked, 0);
  }, 0);

  if (loading && initialLoad) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <Car size={18} color="#fff" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-800 leading-tight">Driver Dashboard</p>
              <p className="text-xs text-slate-400">Welcome, {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => fetchData(true)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Refresh">
              <RefreshCw size={15} />
            </button>
            <button onClick={() => { localStorage.removeItem("userRole"); navigate("/role-selector"); }}
              className="text-xs font-medium px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
              Switch Role
            </button>
            <button onClick={() => { localStorage.clear(); navigate("/login"); }}
              className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
              <LogOut size={13} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Rides", value: activeRides.length + pastRides.length, color: "text-slate-800", Icon: Car },
            { label: "Active Rides", value: activeRides.length, color: "text-indigo-600", Icon: Activity },
            { label: "Total Passengers", value: totalPassengers, color: "text-indigo-600", Icon: Users },
            { label: "Total Earnings", value: `Rs ${totalEarnings}`, color: "text-green-600", Icon: Wallet },
          ].map(({ label, value, color, Icon }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
                <Icon size={16} className="text-slate-300" />
              </div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Create Ride CTA */}
        <Link to="/create-ride"
          className="flex items-center justify-between gap-2 w-full mb-6 py-3.5 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200">
          <span className="flex items-center gap-2"><PlusCircle size={16} /> Offer a New Ride</span>
          <ArrowRight size={14} />
        </Link>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-200 rounded-xl p-1 mb-5">
          {[
            { id: "active", Icon: Activity, label: `Active Rides (${activeRides.length})` },
            { id: "past", Icon: History, label: `Past Rides (${pastRides.length})` },
          ].map(({ id, Icon, label }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === id ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}>
              {activeTab === id && id === "active" && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Active Rides */}
        {activeTab === "active" && (
          activeRides.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <AlertCircle size={48} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No active rides</p>
              <Link to="/create-ride" className="mt-3 inline-block text-indigo-600 text-sm font-medium hover:text-indigo-700">+ Create your first ride</Link>
            </div>
          ) : (
            activeRides.map(ride => {
              const ridePassengers = passengers[ride._id] || [];
              const isFull = ride.seats === 0;
              const duration = formatDuration(ride.startTime, ride.endTime);
              const isExpanded = expanded[ride._id];
              const rideEarnings = ridePassengers.reduce((sum, p) => sum + ride.price * p.seatsBooked, 0);
              const distance = ride.pickup && ride.drop
                ? haversine(ride.pickup.lat, ride.pickup.lng, ride.drop.lat, ride.drop.lng)
                : 0;
              const fareSuggestion = calcFare(distance);

              return (
                <div key={ride._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all mb-4 overflow-hidden">
                  <div className="p-5">
                    {/* Ride Header */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2.5">
                          <MapPin size={14} className="text-indigo-500" />
                          <span className="font-bold text-slate-800 text-base">{shortAddr(ride.pickup?.name)}</span>
                          <ArrowRight size={12} className="text-slate-300" />
                          <span className="font-bold text-slate-800 text-base">{shortAddr(ride.drop?.name)}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            <Calendar size={10} /> {new Date(ride.date).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                          </span>
                          {duration && (
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                              <Timer size={10} /> {duration}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 font-semibold">
                            Rs {ride.price}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-semibold ${isFull ? "bg-red-50 text-red-600 border-red-200" : "bg-green-50 text-green-700 border-green-200"
                            }`}>
                            {isFull ? <XCircle size={10} /> : <CheckCircle size={10} />}
                            {isFull ? "Fully Booked" : `${ride.seats} seats left`}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        {!ride.driverStarted && (
                          <button onClick={() => startRide(ride._id)}
                            className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center justify-center transition-all gap-1" title="Start Ride">
                            <CheckCircle size={14} /> Start
                          </button>
                        )}
                        {ride.driverStarted && !ride.driverCompleted && (
                          <button onClick={() => completeRide(ride._id)}
                            className="px-3 py-1.5 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 text-green-700 font-semibold text-xs flex items-center justify-center transition-all gap-1" title="Complete Ride">
                            <CheckCircle size={14} /> Complete
                          </button>
                        )}
                        <button onClick={() => setEditingRide(editingRide === ride._id ? null : ride._id)}
                          className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 text-slate-500 flex items-center justify-center transition-all" title="Edit Ride">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => cancelRide(ride._id)}
                          className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-slate-500 flex items-center justify-center transition-all" title="Cancel Ride">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Fare Info Banner */}
                    {distance > 0 && (
                      <div className="mt-3 p-2.5 rounded-lg bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Fuel size={12} className="text-indigo-500" />
                            <span className="text-xs text-slate-500">{fareSuggestion.dist} km</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">Suggested:</span>
                            <span className="text-sm font-bold text-green-600">Rs {fareSuggestion.perSeat}</span>
                            <button
                              onClick={() => updateRide(ride._id, { ...ride, price: fareSuggestion.perSeat })}
                              className="px-2 py-0.5 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-700 transition"
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* No Time Warning */}
                    {!ride.startTime && !ride.endTime && (
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-2">
                        <Clock size={11} /> No departure time — add times to help passengers plan.
                      </p>
                    )}

                    {/* Passengers Section */}
                    {ridePassengers.length > 0 && (
                      <div className="border-t border-slate-100 mt-4 pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                            <Users size={12} /> Passengers ({ridePassengers.length})
                          </span>
                          {ridePassengers.length > 2 && (
                            <button onClick={() => setExpanded(p => ({ ...p, [ride._id]: !isExpanded }))}
                              className="text-xs text-indigo-600 font-medium flex items-center gap-1 hover:text-indigo-700">
                              {isExpanded ? <><ChevronUp size={11} /> Show Less</> : <><ChevronDown size={11} /> View All ({ridePassengers.length})</>}
                            </button>
                          )}
                        </div>
                        <div className="space-y-2">
                          {(isExpanded ? ridePassengers : ridePassengers.slice(0, 2)).map(passenger => {
                            const { bg, fg } = getAvatarColor(passenger.user?.name);
                            return (
                              <div key={passenger._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                                  style={{ background: bg, color: fg }}>
                                  {passenger.user?.name?.charAt(0)?.toUpperCase() || "U"}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-slate-800">{passenger.user?.name || "Anonymous"}</p>
                                  <div className="flex flex-wrap gap-x-3 text-xs text-slate-400 mt-0.5">
                                    {passenger.user?.phone && <span className="flex items-center gap-1"><Phone size={9} />{passenger.user.phone}</span>}
                                    {passenger.user?.email && <span className="flex items-center gap-1 truncate"><Mail size={9} />{passenger.user.email}</span>}
                                  </div>
                                  <p className="text-xs text-slate-400 mt-0.5">Rs {ride.price * passenger.seatsBooked}</p>
                                </div>
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => setShowChat({
                                      rideId: ride._id,
                                      rideTitle: `${shortAddr(ride.pickup?.name)} → ${shortAddr(ride.drop?.name)}`,
                                      receiverId: passenger.user?._id,
                                      receiverName: passenger.user?.name,
                                    })}
                                    className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition-all"
                                    title="Message Passenger">
                                    <MessageCircle size={13} />
                                  </button>
                                  {passenger.user?.phone && (
                                    <a href={`tel:${passenger.user.phone}`}
                                      className="w-8 h-8 rounded-lg bg-green-50 border border-green-100 text-green-600 hover:bg-green-600 hover:text-white flex items-center justify-center transition-all"
                                      title="Call Passenger">
                                      <Phone size={13} />
                                    </a>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex items-center justify-end gap-1.5 mt-3 pt-2 border-t border-slate-100">
                          <TrendingUp size={13} className="text-green-600" />
                          <span className="text-xs text-slate-500">Earnings from this ride:</span>
                          <span className="text-base font-bold text-green-600">Rs {rideEarnings}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Edit Form */}
                  {editingRide === ride._id && (
                    <EditRideForm ride={ride} onSave={updateRide} onCancel={() => setEditingRide(null)} />
                  )}
                </div>
              );
            })
          )
        )}

        {/* Past Rides */}
        {activeTab === "past" && (
          pastRides.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <History size={48} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No past rides yet</p>
              <p className="text-xs text-slate-400 mt-1">Completed rides will appear here</p>
            </div>
          ) : (
            pastRides.map(ride => {
              const ridePassengers = passengers[ride._id] || [];
              const isCancelled = ride.status === "cancelled";
              const duration = formatDuration(ride.startTime, ride.endTime);
              const earnings = ridePassengers.reduce((sum, p) => sum + ride.price * p.seatsBooked, 0);

              return (
                <div key={ride._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-4 mb-3 hover:shadow-md transition-all">
                  <div className={`w-2 h-12 rounded-full flex-shrink-0 ${isCancelled ? "bg-red-400" : "bg-green-400"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin size={12} className="text-slate-400" />
                      <span className="text-sm font-semibold text-slate-700 truncate">
                        {shortAddr(ride.pickup?.name)} → {shortAddr(ride.drop?.name)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400">
                      <span>{new Date(ride.date).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}</span>
                      {duration && <span>{duration}</span>}
                      <span>Rs {ride.price}</span>
                      {!isCancelled && earnings > 0 && <span className="font-semibold text-green-600">Earned Rs {earnings}</span>}
                    </div>
                    {ridePassengers.length > 0 && !isCancelled && (
                      <p className="text-xs text-slate-400 mt-1">🚗 {ridePassengers.length} passenger(s) travelled</p>
                    )}
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 ${isCancelled ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"
                    }`}>
                    {isCancelled ? "Cancelled" : "Completed"}
                  </span>
                </div>
              );
            })
          )
        )}
      </main>

      {/* Chat Modal */}
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
    </div>
  );
};

export default DriverDashboard;