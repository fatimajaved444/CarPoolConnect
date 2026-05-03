import React from 'react';
import { Link } from 'react-router-dom';
import { Car, MapPin, Calendar, Shield, Users, ArrowRight, Star } from 'lucide-react';
import Navbar from '../components/Navbar';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Share the journey. <br className="hidden md:block" /> Split the cost.
          </h1>
          <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto">
            CarpoolConnect brings drivers and passengers together. Save money, reduce carbon footprint, and travel comfortably across the city.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/signup" className="w-full sm:w-auto px-8 py-3.5 bg-white text-indigo-700 font-bold rounded-xl shadow-lg hover:bg-gray-50 transition transform hover:-translate-y-0.5">
              Get Started for Free
            </Link>
            <Link to="/login" className="w-full sm:w-auto px-8 py-3.5 bg-indigo-500/30 hover:bg-indigo-500/50 backdrop-blur-sm text-white font-bold rounded-xl border border-indigo-400/30 transition">
              I already have an account
            </Link>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="py-20 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-800">How CarpoolConnect Works</h2>
          <p className="text-gray-500 mt-3">Simple steps to your next shared ride</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Search, title: "1. Find a Ride", desc: "Enter your pickup and drop locations. Browse available rides heading your way." },
            { icon: Users, title: "2. Book your Seat", desc: "Select the number of seats you need and pay online securely or with cash." },
            { icon: Car, title: "3. Travel Together", desc: "Meet your driver, enjoy the ride, and track your journey in real-time." }
          ].map((step, idx) => (
            <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600">
                <step.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{step.title}</h3>
              <p className="text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-y border-gray-200 py-16">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: "Active Rides", val: "1,200+" },
            { label: "Happy Users", val: "5,000+" },
            { label: "Cities Covered", val: "15" },
            { label: "CO2 Saved (tons)", val: "450" }
          ].map((stat, i) => (
            <div key={i} className="space-y-2">
              <p className="text-3xl font-extrabold text-indigo-600">{stat.val}</p>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto bg-gray-900 text-gray-400 py-8 text-center">
        <p>© 2026 CarpoolConnect. All rights reserved.</p>
      </footer>
    </div>
  );
};

// Simple Search icon since it wasn't imported from lucide-react in the top
function Search(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );
}

export default LandingPage;
