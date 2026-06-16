import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import PasswordInput from "../components/PasswordInput.jsx";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(form.email, form.password);
      navigate("/find");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
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
          <LogIn size={22} style={{ color: 'var(--primary)' }} />
          <span>Welcome back</span>
        </h2>
        {error && <div className="alert">{error}</div>}
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
          <Lock size={14} />
          <span>Password</span>
        </label>
        <PasswordInput
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button className="btn btn-primary" disabled={busy}>
          {busy ? "Logging in..." : "Login"}
        </button>
        <p className="auth-alt">
          <Link to="/forgot-password">Forgot password?</Link>
        </p>
        <p className="auth-alt">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </motion.div>
  );
}
