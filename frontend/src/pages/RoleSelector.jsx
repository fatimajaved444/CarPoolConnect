import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car, User, ArrowRight } from "lucide-react";

const RoleSelector = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  const handleContinue = () => {
  if (selectedRole) {
    localStorage.setItem("userRole", selectedRole);
    
    if (selectedRole === "driver") {
      navigate("/verify-cnic");
    } else {
      navigate("/dashboard");
    }
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <div className="h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Car className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">How would you like to ride?</h1>
          <p className="text-gray-500 mt-2">Choose your role to continue</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Driver Card */}
          <div
            onClick={() => setSelectedRole("driver")}
            className={`cursor-pointer rounded-2xl p-6 transition-all ${
              selectedRole === "driver"
                ? "bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-600 ring-offset-2"
                : "bg-white text-gray-800 hover:shadow-lg border border-gray-200"
            }`}
          >
            <div className={`h-14 w-14 rounded-xl flex items-center justify-center mb-4 ${
              selectedRole === "driver" ? "bg-white/20" : "bg-indigo-100"
            }`}>
              <Car className={`h-7 w-7 ${selectedRole === "driver" ? "text-white" : "text-indigo-600"}`} />
            </div>
            <h2 className="text-xl font-bold mb-2">I'm a Driver</h2>
            <p className={`text-sm ${selectedRole === "driver" ? "text-white/80" : "text-gray-500"}`}>
              I have a car and want to offer rides. I can earn money by sharing my journey.
            </p>
          </div>

          {/* Passenger Card */}
          <div
            onClick={() => setSelectedRole("passenger")}
            className={`cursor-pointer rounded-2xl p-6 transition-all ${
              selectedRole === "passenger"
                ? "bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-600 ring-offset-2"
                : "bg-white text-gray-800 hover:shadow-lg border border-gray-200"
            }`}
          >
            <div className={`h-14 w-14 rounded-xl flex items-center justify-center mb-4 ${
              selectedRole === "passenger" ? "bg-white/20" : "bg-indigo-100"
            }`}>
              <User className={`h-7 w-7 ${selectedRole === "passenger" ? "text-white" : "text-indigo-600"}`} />
            </div>
            <h2 className="text-xl font-bold mb-2">I'm a Passenger</h2>
            <p className={`text-sm ${selectedRole === "passenger" ? "text-white/80" : "text-gray-500"}`}>
              I need a ride to go somewhere. I want to find affordable rides from trusted drivers.
            </p>
          </div>
        </div>

        <button
          onClick={handleContinue}
          disabled={!selectedRole}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition flex items-center justify-center gap-2"
        >
          Continue as {selectedRole === "driver" ? "Driver" : selectedRole === "passenger" ? "Passenger" : "..."}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default RoleSelector;