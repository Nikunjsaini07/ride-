import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          🛵 SUG <span>RideShare</span>
        </Link>
        <nav className="nav-links">
          <NavLink to="/find">Find a Ride</NavLink>
          {user && <NavLink to="/offer">Offer a Ride</NavLink>}
          {user && <NavLink to="/my-rides">My Rides</NavLink>}
          {user && <NavLink to="/my-requests">My Requests</NavLink>}
          {user ? (
            <>
              <NavLink to="/profile">{user.name}</NavLink>
              <button className="btn btn-ghost" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register" className="btn btn-primary">
                Sign Up
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
