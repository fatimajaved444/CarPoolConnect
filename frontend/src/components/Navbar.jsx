// src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, PlusCircle, Search, Calendar, User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const navLinks = user ? [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/create-ride", label: "Offer Ride", icon: PlusCircle },
    { path: "/search-ride", label: "Find Ride", icon: Search }
  ] : [];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">CarpoolConnect</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition text-sm font-medium"
              >
                <link.icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-indigo-50 rounded-lg border border-indigo-100">
                  <div className="h-7 w-7 bg-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-bold text-indigo-900">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-4 py-2 text-red-600 hover:text-white transition rounded-xl hover:bg-red-500 text-sm font-semibold shadow-sm"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-5 py-2 text-indigo-600 font-semibold text-sm hover:bg-indigo-50 rounded-xl transition">
                  Login
                </Link>
                <Link to="/signup" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition shadow-md">
                  Signup
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-2 px-4">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-indigo-600 rounded-lg transition"
            >
              <link.icon className="h-4 w-4" />
              <span>{link.label}</span>
            </Link>
          ))}
          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 text-red-600 w-full rounded-lg hover:bg-red-50 transition mt-2 font-semibold"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          ) : (
            <div className="flex flex-col gap-2 mt-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 text-center text-indigo-600 font-semibold bg-indigo-50 rounded-lg">Login</Link>
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 text-center bg-indigo-600 text-white font-semibold rounded-lg">Signup</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;