import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { Search, PlusCircle, Calendar, MessageSquare, User, LogOut, LogIn, UserPlus, Sun, Moon } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          <img src="/sug-logo.png" alt="Shobhit University" className="brand-logo" />
          <span className="brand-text">
            SUG <span>RideShare</span>
          </span>
        </Link>
        <nav className="nav-links">
          <NavLink to="/find">
            <Search size={16} />
            <span>Find a Ride</span>
          </NavLink>
          {user && (
            <NavLink to="/offer">
              <PlusCircle size={16} />
              <span>Offer a Ride</span>
            </NavLink>
          )}
          {user && (
            <NavLink to="/my-rides">
              <Calendar size={16} />
              <span>My Rides</span>
            </NavLink>
          )}
          {user && (
            <NavLink to="/my-requests">
              <MessageSquare size={16} />
              <span>My Requests</span>
            </NavLink>
          )}
          {user ? (
            <>
              <NavLink to="/profile">
                <User size={16} />
                <span>{user.name}</span>
              </NavLink>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">
                <LogIn size={16} />
                <span>Login</span>
              </NavLink>
              <NavLink to="/register" className="btn btn-primary btn-sm" style={{ color: "#fff" }}>
                <UserPlus size={14} />
                <span>Sign Up</span>
              </NavLink>
            </>
          )}
          <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme" type="button">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>
      </div>
    </header>
  );
}
