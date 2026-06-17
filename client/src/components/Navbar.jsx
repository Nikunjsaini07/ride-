import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { Search, PlusCircle, Calendar, MessageSquare, User, LogOut, LogIn, UserPlus, Sun, Moon, Menu, X } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/");
  };

  const navLinksContent = (
    <>
      <NavLink to="/find" onClick={() => setIsOpen(false)}>
        <Search size={16} />
        <span>Find a Ride</span>
      </NavLink>
      {user && (
        <NavLink to="/offer" onClick={() => setIsOpen(false)}>
          <PlusCircle size={16} />
          <span>Offer a Ride</span>
        </NavLink>
      )}
      {user && (
        <NavLink to="/my-rides" onClick={() => setIsOpen(false)}>
          <Calendar size={16} />
          <span>My Rides</span>
        </NavLink>
      )}
      {user && (
        <NavLink to="/my-requests" onClick={() => setIsOpen(false)}>
          <MessageSquare size={16} />
          <span>My Requests</span>
        </NavLink>
      )}
      {user ? (
        <>
          <NavLink to="/profile" onClick={() => setIsOpen(false)}>
            <User size={16} />
            <span>{user.name}</span>
          </NavLink>
          <button className="btn btn-ghost btn-sm logout-nav-btn" onClick={handleLogout}>
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </>
      ) : (
        <>
          <NavLink to="/login" onClick={() => setIsOpen(false)}>
            <LogIn size={16} />
            <span>Login</span>
          </NavLink>
          <NavLink to="/register" className="btn btn-primary btn-sm signup-nav-btn" style={{ color: "#000" }} onClick={() => setIsOpen(false)}>
            <UserPlus size={14} />
            <span>Sign Up</span>
          </NavLink>
        </>
      )}
    </>
  );

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={() => setIsOpen(false)}>
          <img src="/sug-logo.png" alt="Logo" className="brand-logo" />
          <span className="brand-text">
            <span>Ride</span>Share
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="nav-links">
          {navLinksContent}
          <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme" type="button">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>

        {/* Mobile controls: Theme Switcher + Hamburger Button */}
        <div className="mobile-controls">
          <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme" type="button">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="hamburger-btn" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Menu" type="button">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Responsive mobile sidebar drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="sidebar-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
            >
              <div className="sidebar-header">
                <span className="brand-text">Navigation</span>
                <button className="close-btn" onClick={() => setIsOpen(false)} aria-label="Close Menu" type="button">
                  <X size={24} />
                </button>
              </div>
              <nav className="sidebar-links">
                {navLinksContent}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
