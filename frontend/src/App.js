import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RoleSelector from "./pages/RoleSelector";
import DriverDashboard from "./pages/DriverDashboard";
import PassengerDashboard from "./pages/PassengerDashboard";
import CreateRide from "./pages/CreateRide";
import SearchRide from "./pages/SearchRide";
import LandingPage from "./pages/LandingPage";
import VerificationPage from "./pages/VerificationPage";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

const RoleBasedDashboard = () => {
  const role = localStorage.getItem("userRole");
  if (role === "driver") return <DriverDashboard />;
  if (role === "passenger") return <PassengerDashboard />;
  return <Navigate to="/role-selector" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/role-selector" element={
          <PrivateRoute>
            <RoleSelector />
          </PrivateRoute>
        } />
        
        <Route path="/dashboard" element={
          <PrivateRoute>
            <RoleBasedDashboard />
          </PrivateRoute>
        } />
        
        <Route path="/create-ride" element={
          <PrivateRoute>
            <CreateRide />
          </PrivateRoute>
        } />
        
        <Route path="/search-ride" element={
          <PrivateRoute>
            <SearchRide />
          </PrivateRoute>
        } />

      
        <Route path="/verify-cnic" element={
          <PrivateRoute>
            <VerificationPage />
          </PrivateRoute>
        } />

       
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;