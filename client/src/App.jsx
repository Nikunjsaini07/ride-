import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import FindRides from "./pages/FindRides.jsx";
import OfferRide from "./pages/OfferRide.jsx";
import MyRides from "./pages/MyRides.jsx";
import MyRequests from "./pages/MyRequests.jsx";
import Profile from "./pages/Profile.jsx";

const Protected = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="container">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/find" element={<FindRides />} />
          <Route
            path="/offer"
            element={
              <Protected>
                <OfferRide />
              </Protected>
            }
          />
          <Route
            path="/my-rides"
            element={
              <Protected>
                <MyRides />
              </Protected>
            }
          />
          <Route
            path="/my-requests"
            element={
              <Protected>
                <MyRequests />
              </Protected>
            }
          />
          <Route
            path="/profile"
            element={
              <Protected>
                <Profile />
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
