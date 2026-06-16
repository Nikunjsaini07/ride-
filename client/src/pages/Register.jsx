import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import PasswordInput from "../components/PasswordInput.jsx";
import { motion } from "framer-motion";
import { User, Mail, Phone, Lock, Bike, UserPlus } from "lucide-react";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    hasBike: false,
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register(form);
      navigate("/find");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  const pageVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } }
  };

  return (
    <motion.div className="auth-wrap" initial="hidden" animate="visible" variants={pageVariants}>
      <form className="card auth-card" onSubmit={submit}>
        <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <UserPlus size={22} style={{ color: 'var(--primary)' }} />
          <span>Create your account</span>
        </h2>
        {error && <div className="alert">{error}</div>}
        
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <User size={14} />
          <span>Full name</span>
        </label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Mail size={14} />
          <span>Email</span>
        </label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Phone size={14} />
          <span>Phone (shared with ride partners)</span>
        </label>
        <input
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Lock size={14} />
          <span>Password (min 6 characters)</span>
        </label>
        <PasswordInput
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        
        <label className="checkbox">
          <input
            type="checkbox"
            checked={form.hasBike}
            onChange={(e) => setForm({ ...form, hasBike: e.target.checked })}
          />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Bike size={15} />
            <span>I have a bike and can offer rides</span>
          </span>
        </label>
        <button className="btn btn-primary" disabled={busy}>
          {busy ? "Creating..." : "Sign Up"}
        </button>
        <p className="auth-alt">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </motion.div>
  );
}
